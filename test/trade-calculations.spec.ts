import { computeFollowedPlan, computeRMultiple } from '../src/trades/utils/trade-calculations';

describe('computeRMultiple', () => {
  it('calculates positive R for winning long trade', () => {
    expect(computeRMultiple(100, 110, 95, 'LONG')).toBeCloseTo(2);
  });

  it('calculates negative R for losing long trade', () => {
    expect(computeRMultiple(100, 90, 95, 'LONG')).toBeCloseTo(-2);
  });

  it('calculates positive R for winning short trade', () => {
    expect(computeRMultiple(100, 90, 105, 'SHORT')).toBeCloseTo(2);
  });

  it('calculates negative R for losing short trade', () => {
    expect(computeRMultiple(100, 110, 105, 'SHORT')).toBeCloseTo(-2);
  });
});

describe('computeFollowedPlan', () => {
  const basePlan = {
    tp: 110,
    sl: 95,
    maxDurationMin: 60
  };

  it('returns true when plan followed without move', () => {
    const result = computeFollowedPlan({
      side: 'LONG',
      events: [],
      entryPrice: 100,
      exitPrice: 110,
      plan: basePlan,
      entryTime: new Date('2023-01-01T00:00:00Z'),
      exitTime: new Date('2023-01-01T00:30:00Z')
    });
    expect(result).toBe(true);
  });

  it('returns false when stop moved against plan', () => {
    const result = computeFollowedPlan({
      side: 'LONG',
      events: [{ type: 'MOVE_SL', payload: { newSl: 98 } } as any],
      entryPrice: 100,
      exitPrice: 110,
      plan: basePlan,
      entryTime: new Date(),
      exitTime: new Date()
    });
    expect(result).toBe(false);
  });

  it('returns false when exit early below tolerance', () => {
    const result = computeFollowedPlan({
      side: 'LONG',
      events: [],
      entryPrice: 100,
      exitPrice: 102,
      plan: basePlan,
      entryTime: new Date(),
      exitTime: new Date()
    });
    expect(result).toBe(false);
  });

  it('returns false when duration exceeds max', () => {
    const result = computeFollowedPlan({
      side: 'LONG',
      events: [],
      entryPrice: 100,
      exitPrice: 110,
      plan: basePlan,
      entryTime: new Date('2023-01-01T00:00:00Z'),
      exitTime: new Date('2023-01-01T02:00:00Z')
    });
    expect(result).toBe(false);
  });
});
