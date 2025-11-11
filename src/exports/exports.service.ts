import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Trade, TradeDocument } from '../trades/schemas/trade.schema';
import { ExportQueryDto } from './dto/export-query.dto';

@Injectable()
export class ExportsService {
  constructor(@InjectModel(Trade.name) private readonly tradeModel: Model<TradeDocument>) {}

  async exportCsv(userId: string, query: ExportQueryDto): Promise<string> {
    const filters: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
    if (query.from || query.to) {
      filters['execution.entryTime'] = {};
      if (query.from) filters['execution.entryTime'].$gte = new Date(query.from);
      if (query.to) filters['execution.entryTime'].$lte = new Date(query.to);
    }
    const trades = await this.tradeModel.find(filters).sort({ createdAt: -1 }).lean().exec();
    const header = [
      'Symbol',
      'Side',
      'Entry',
      'Exit',
      'SL',
      'TP',
      'Status',
      'RMultiple',
      'FollowedPlan',
      'Tags'
    ];
    const rows = trades.map((trade) => [
      trade.symbol,
      trade.side,
      trade.execution?.entryPrice ?? trade.plan.entry,
      trade.execution?.exitPrice ?? '',
      trade.plan.sl,
      trade.plan.tp,
      trade.status,
      trade.analytics?.rMultiple ?? '',
      trade.analytics?.followedPlan ?? '',
      (trade.plan.tags ?? []).join('|')
    ]);
    return [header, ...rows]
      .map((row) => row.map((value) => `"${value ?? ''}"`).join(','))
      .join('\n');
  }
}
