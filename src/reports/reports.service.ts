import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Trade, TradeDocument } from '../trades/schemas/trade.schema';
import { OverviewQueryDto } from './dto/overview-query.dto';

interface OverviewReport {
  winRate: number;
  rAvg: number;
  expectancy: number;
  drawdownApprox: number;
  tradesCount: number;
  bySymbol: Array<{ symbol: string; trades: number; avgR: number }>;
  equityCurve: Array<{ date: string; cumulativeR: number }>;
}

@Injectable()
export class ReportsService {
  constructor(@InjectModel(Trade.name) private readonly tradeModel: Model<TradeDocument>) {}

  async overview(userId: string, query: OverviewQueryDto): Promise<OverviewReport> {
    const match: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
      status: 'CLOSED'
    };
    if (query.accountId) {
      match.accountId = new Types.ObjectId(query.accountId);
    }
    if (query.from || query.to) {
      match['execution.exitTime'] = {};
      if (query.from) match['execution.exitTime'].$gte = new Date(query.from);
      if (query.to) match['execution.exitTime'].$lte = new Date(query.to);
    }

    const pipeline = [
      { $match: match },
      {
        $addFields: {
          rMultiple: {
            $cond: [{ $ifNull: ['$analytics.rMultiple', false] }, '$analytics.rMultiple', 0]
          }
        }
      }
    ];

    const trades = await this.tradeModel.aggregate([
      ...pipeline,
      {
        $group: {
          _id: null,
          tradesCount: { $sum: 1 },
          wins: { $sum: { $cond: [{ $gt: ['$analytics.rMultiple', 0] }, 1, 0] } },
          avgR: { $avg: '$analytics.rMultiple' }
        }
      }
    ]);

    const winRate = trades[0]?.tradesCount ? trades[0].wins / trades[0].tradesCount : 0;
    const rAvg = trades[0]?.avgR ?? 0;
    const expectancy = (trades[0]?.avgR ?? 0) * winRate;

    const bySymbolAgg = await this.tradeModel.aggregate([
      ...pipeline,
      {
        $group: {
          _id: '$symbol',
          trades: { $sum: 1 },
          avgR: { $avg: '$analytics.rMultiple' }
        }
      },
      { $sort: { trades: -1 } }
    ]);

    const curveAgg = await this.tradeModel.aggregate([
      ...pipeline,
      { $sort: { 'execution.exitTime': 1 } },
      {
        $project: {
          date: '$execution.exitTime',
          rMultiple: '$analytics.rMultiple'
        }
      }
    ]);

    let cumulative = 0;
    let peak = 0;
    let trough = 0;
    const equityCurve = curveAgg.map((item) => {
      cumulative += item.rMultiple ?? 0;
      peak = Math.max(peak, cumulative);
      trough = Math.min(trough, cumulative);
      return { date: item.date?.toISOString() ?? new Date().toISOString(), cumulativeR: Number(cumulative.toFixed(2)) };
    });

    const drawdownApprox = peak - trough;

    return {
      winRate: Number(winRate.toFixed(2)),
      rAvg: Number((rAvg ?? 0).toFixed(2)),
      expectancy: Number(expectancy.toFixed(2)),
      drawdownApprox: Number(drawdownApprox.toFixed(2)),
      tradesCount: trades[0]?.tradesCount ?? 0,
      bySymbol: bySymbolAgg.map((item) => ({
        symbol: item._id,
        trades: item.trades,
        avgR: Number((item.avgR ?? 0).toFixed(2))
      })),
      equityCurve
    };
  }

  async errors(userId: string) {
    const match = { userId: new Types.ObjectId(userId), status: 'CLOSED' };
    const moveSlAgainst = await this.tradeModel.aggregate([
      { $match: match },
      { $unwind: '$execution.events' },
      { $match: { 'execution.events.type': 'MOVE_SL' } },
      { $count: 'count' }
    ]);

    const earlyExit = await this.tradeModel.aggregate([
      { $match: { ...match, 'analytics.followedPlan': false } },
      { $count: 'count' }
    ]);

    return {
      moveSlAgainst: moveSlAgainst[0]?.count ?? 0,
      earlyExit: earlyExit[0]?.count ?? 0
    };
  }
}
