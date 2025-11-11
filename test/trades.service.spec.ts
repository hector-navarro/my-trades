import { TradesService } from '../src/trades/trades.service';
import { AddTradeEventDto } from '../src/trades/dto/add-event.dto';

function createTradeMock() {
  const trade: any = {
    status: 'PLANNED',
    side: 'LONG',
    plan: { entry: 100, sl: 95, tp: 110, maxDurationMin: 60, tags: [] },
    execution: { events: [] },
    analytics: {},
    save: jest.fn().mockResolvedValue(true)
  };
  return trade;
}

describe('TradesService', () => {
  it('updates trade on entry event', async () => {
    const trade = createTradeMock();
    const tradeModel: any = {
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(trade) })
    };
    const service = new TradesService(tradeModel);
    const dto: AddTradeEventDto = { type: 'ENTRY', price: 101 } as any;
    await service.addEvent('user', 'trade', dto);

    expect(trade.status).toBe('OPEN');
    expect(trade.execution.entryPrice).toBe(101);
    expect(trade.execution.events).toHaveLength(1);
  });

  it('computes analytics on exit', async () => {
    const trade = createTradeMock();
    trade.status = 'OPEN';
    trade.execution.entryPrice = 100;
    trade.execution.entryTime = new Date('2023-01-01T00:00:00Z');

    const tradeModel: any = {
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(trade) })
    };
    const service = new TradesService(tradeModel);
    const dto: AddTradeEventDto = { type: 'EXIT', price: 110 } as any;
    await service.addEvent('user', 'trade', dto);

    expect(trade.status).toBe('CLOSED');
    expect(trade.analytics.rMultiple).toBeGreaterThan(0);
    expect(trade.analytics.followedPlan).toBe(true);
  });
});
