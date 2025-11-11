import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Trade, TradeDocument, TradeEvent, TradeSide } from './schemas/trade.schema';
import { CreateTradeDto, QueryTradesDto, UpdateTradeDto } from './dto/create-trade.dto';
import { AddTradeEventDto } from './dto/add-event.dto';
import { AddAttachmentDto } from './dto/add-attachment.dto';
import { computeFollowedPlan, computeRMultiple } from './utils/trade-calculations';

@Injectable()
export class TradesService {
  constructor(@InjectModel(Trade.name) private readonly tradeModel: Model<TradeDocument>) {}

  async create(userId: string, dto: CreateTradeDto): Promise<Trade> {
    this.validatePlan(dto);
    const plan = {
      entry: dto.entry,
      sl: dto.sl,
      tp: dto.tp,
      rr: dto.rr,
      maxDurationMin: dto.maxDurationMin,
      positionSize: dto.positionSize,
      riskPct: dto.riskPct,
      context: dto.context,
      emotionPre: dto.emotionPre,
      tags: dto.tags ?? []
    };
    const created = new this.tradeModel({
      userId: new Types.ObjectId(userId),
      symbol: dto.symbol,
      side: dto.side,
      timeframe: dto.timeframe,
      setupId: dto.setupId ? new Types.ObjectId(dto.setupId) : undefined,
      plan,
      status: 'PLANNED'
    });
    return created.save();
  }

  async findAll(userId: string, query: QueryTradesDto) {
    const filters: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
    if (query.status) {
      filters.status = query.status;
    }
    if (query.symbol) {
      filters.symbol = query.symbol;
    }
    const dateFilter: Record<string, Date> = {};
    if (query.from) {
      dateFilter.$gte = new Date(query.from);
    }
    if (query.to) {
      dateFilter.$lte = new Date(query.to);
    }
    if (Object.keys(dateFilter).length) {
      filters['execution.entryTime'] = dateFilter;
    }
    const page = query.page ?? 1;
    const size = query.size ?? 20;
    return this.tradeModel
      .find(filters)
      .sort({ createdAt: -1 })
      .skip((page - 1) * size)
      .limit(size)
      .lean()
      .exec();
  }

  async findOne(userId: string, id: string) {
    const trade = await this.tradeModel.findOne({ _id: id, userId }).lean().exec();
    if (!trade) {
      throw new NotFoundException('Trade not found');
    }
    return trade;
  }

  async update(userId: string, id: string, dto: UpdateTradeDto) {
    const trade = await this.tradeModel.findOne({ _id: id, userId }).exec();
    if (!trade) {
      throw new NotFoundException('Trade not found');
    }
    if (trade.status !== 'PLANNED') {
      throw new BadRequestException('Only planned trades can be updated');
    }
    if (dto.entry || dto.sl || dto.tp) {
      this.validatePlan({
        symbol: trade.symbol,
        side: trade.side,
        entry: dto.entry ?? trade.plan.entry,
        sl: dto.sl ?? trade.plan.sl,
        tp: dto.tp ?? trade.plan.tp,
        rr: dto.rr ?? trade.plan.rr,
        tags: dto.tags ?? trade.plan.tags
      } as CreateTradeDto);
    }
    if (dto.entry) trade.plan.entry = dto.entry;
    if (dto.sl) trade.plan.sl = dto.sl;
    if (dto.tp) trade.plan.tp = dto.tp;
    if (dto.rr) trade.plan.rr = dto.rr;
    if (dto.tags) trade.plan.tags = dto.tags;
    if (dto.notes) trade.analytics = { ...trade.analytics, notes: dto.notes } as any;
    return trade.save();
  }

  async addEvent(userId: string, id: string, dto: AddTradeEventDto) {
    const trade = await this.tradeModel.findOne({ _id: id, userId }).exec();
    if (!trade) {
      throw new NotFoundException('Trade not found');
    }

    const event: TradeEvent = {
      type: dto.type,
      price: dto.price,
      qty: dto.qty,
      time: dto.time ? new Date(dto.time) : new Date(),
      payload: dto.payload
    };

    trade.execution.events = [...(trade.execution.events ?? []), event];

    if (dto.type === 'ENTRY') {
      trade.status = 'OPEN';
      trade.execution.entryPrice = dto.price ?? trade.plan.entry;
      trade.execution.entryTime = event.time;
    }

    if (dto.type === 'EXIT') {
      trade.status = 'CLOSED';
      trade.execution.exitPrice = dto.price;
      trade.execution.exitTime = event.time;
      this.computeAnalytics(trade);
    }

    if (dto.type === 'MOVE_SL' && dto.payload?.newSl) {
      trade.plan.sl = Number(dto.payload.newSl);
    }

    if (dto.type === 'MOVE_TP' && dto.payload?.newTp) {
      trade.plan.tp = Number(dto.payload.newTp);
    }

    await trade.save();
    return trade;
  }

  async addAttachment(userId: string, id: string, dto: AddAttachmentDto) {
    const trade = await this.tradeModel.findOne({ _id: id, userId }).exec();
    if (!trade) {
      throw new NotFoundException('Trade not found');
    }
    const attachment = { url: dto.url, type: dto.type, addedAt: new Date() };
    (trade as any).attachments = [...((trade as any).attachments ?? []), attachment];
    await trade.save();
    return attachment;
  }

  private computeAnalytics(trade: TradeDocument) {
    const entryPrice = trade.execution.entryPrice;
    const exitPrice = trade.execution.exitPrice;
    const sl = trade.plan.sl;
    if (!entryPrice || !exitPrice || !sl) {
      return;
    }
    const rMultiple = computeRMultiple(entryPrice, exitPrice, sl, trade.side as TradeSide);
    const followedPlan = computeFollowedPlan({
      side: trade.side as TradeSide,
      events: trade.execution.events,
      entryPrice,
      exitPrice,
      plan: { tp: trade.plan.tp, sl: trade.plan.sl, maxDurationMin: trade.plan.maxDurationMin },
      entryTime: trade.execution.entryTime ?? undefined,
      exitTime: trade.execution.exitTime ?? undefined
    });
    const timeElapsedMin = trade.execution.entryTime && trade.execution.exitTime
      ? Math.abs(
          (trade.execution.exitTime.getTime() - trade.execution.entryTime.getTime()) / 60000
        )
      : undefined;
    trade.analytics = {
      ...trade.analytics,
      rMultiple,
      followedPlan,
      timeElapsedMin
    };
  }

  private validatePlan(dto: CreateTradeDto) {
    const { entry, sl, tp, side } = dto;
    if (side === 'LONG' && !(sl < entry && entry < tp)) {
      throw new BadRequestException('For LONG trades, SL < entry < TP');
    }
    if (side === 'SHORT' && !(tp < entry && entry < sl)) {
      throw new BadRequestException('For SHORT trades, TP < entry < SL');
    }
    const rr = Math.abs(tp - entry) / Math.abs(entry - sl);
    if (rr < 0.5) {
      throw new BadRequestException('Risk-reward must be at least 0.5R');
    }
  }
}
