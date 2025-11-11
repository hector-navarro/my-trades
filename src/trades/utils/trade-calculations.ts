import { TradeEvent } from '../schemas/trade.schema';

type TradeSide = 'LONG' | 'SHORT';

export function computeRMultiple(entry: number, exit: number, sl: number, side: TradeSide): number {
  if (!entry || !exit || !sl) {
    return 0;
  }
  const risk = Math.abs(entry - sl);
  if (risk === 0) {
    return 0;
  }
  const reward = Math.abs(exit - entry);
  const profitable = (side === 'LONG' && exit >= entry) || (side === 'SHORT' && exit <= entry);
  const sign = profitable ? 1 : -1;
  return Number(((reward / risk) * sign).toFixed(2));
}

export interface FollowedPlanInput {
  side: TradeSide;
  events: TradeEvent[];
  entryPrice: number;
  exitPrice: number;
  plan: {
    tp: number;
    sl: number;
    maxDurationMin?: number;
  };
  entryTime?: Date;
  exitTime?: Date;
  toleranceR?: number;
}

export function computeFollowedPlan({
  side,
  events,
  entryPrice,
  exitPrice,
  plan,
  entryTime,
  exitTime,
  toleranceR = 0.1
}: FollowedPlanInput): boolean {
  if (!entryPrice || !exitPrice) {
    return false;
  }

  const moveSlEvents = events.filter((event) => event.type === 'MOVE_SL');
  const movedAgainst = moveSlEvents.some((event) => {
    if (!event.payload?.newSl) {
      return false;
    }
    const newSl = Number(event.payload.newSl);
    return side === 'LONG' ? newSl > plan.sl : newSl < plan.sl;
  });

  if (movedAgainst) {
    return false;
  }

  const rMultiple = computeRMultiple(entryPrice, exitPrice, plan.sl, side);
  const targetR = computeRMultiple(entryPrice, plan.tp, plan.sl, side);
  if (targetR > 0 && rMultiple < targetR - toleranceR) {
    return false;
  }

  if (plan.maxDurationMin && entryTime && exitTime) {
    const elapsed = Math.abs((exitTime.getTime() - entryTime.getTime()) / 60000);
    if (elapsed > plan.maxDurationMin) {
      return false;
    }
  }

  return true;
}
