from datetime import datetime
from typing import Iterable, Tuple

from ..models import Direction, EventType, Trade


def calculate_planned_rr(direction: Direction, entry: float, stop: float, target: float) -> float:
    risk = abs(entry - stop)
    reward = abs(target - entry)
    if risk == 0:
        return 0
    return reward / risk


def derive_trade_outcome(trade: Trade) -> Tuple[float, float, bool, dict]:
    """Return pnl, rr_multiple, complied_plan, deviations"""
    deviations = {"early_exit": False, "sl_violation": False, "time_violation": False}

    if trade.actual_entry_price is None or trade.actual_exit_price is None:
        return 0.0, 0.0, False, deviations

    risk_price = abs(trade.planned_entry - trade.planned_stop_loss)
    if risk_price == 0:
        risk_price = 1e-9
    direction_multiplier = 1 if trade.direction == Direction.LONG else -1
    price_diff = (trade.actual_exit_price - trade.actual_entry_price) * direction_multiplier
    rr_multiple = price_diff / risk_price
    pnl = price_diff

    complied = True

    planned_rr = calculate_planned_rr(trade.direction, trade.planned_entry, trade.planned_stop_loss, trade.planned_take_profit)
    planned_target_price = trade.planned_take_profit

    # Check for SL move against plan
    for event in trade.events:
        if event.type == EventType.MOVE_SL and event.price is not None:
            moved_in_wrong_direction = (
                (trade.direction == Direction.LONG and event.price > trade.planned_stop_loss)
                or (trade.direction == Direction.SHORT and event.price < trade.planned_stop_loss)
            )
            if moved_in_wrong_direction:
                deviations["sl_violation"] = True
                complied = False
                break

    # Early exit detection
    if planned_rr:
        achieved_rr = rr_multiple
        if trade.direction == Direction.LONG:
            target_diff = trade.planned_take_profit - trade.actual_entry_price
        else:
            target_diff = trade.actual_entry_price - trade.planned_take_profit
        if target_diff != 0:
            achieved_reward_price = (trade.actual_exit_price - trade.actual_entry_price) * direction_multiplier
            rr_vs_target = achieved_reward_price / abs(target_diff)
            if rr_vs_target < 0.9:  # exited >0.1R before TP
                deviations["early_exit"] = True
                complied = False

    if trade.planned_time_limit_minutes and trade.opened_at and trade.closed_at:
        duration = (trade.closed_at - trade.opened_at).total_seconds() / 60
        if duration > trade.planned_time_limit_minutes:
            deviations["time_violation"] = True
            complied = False

    return pnl, rr_multiple, complied, deviations


def update_trade_outcome(trade: Trade) -> None:
    pnl, rr_multiple, complied, deviations = derive_trade_outcome(trade)
    trade.pnl = pnl
    trade.rr_multiple = rr_multiple
    trade.complied_plan = complied
    trade._deviations_cache = deviations


def summarize_equity_curve(trades: Iterable[Trade]) -> Tuple[float, list]:
    equity = 0.0
    curve = []
    for trade in sorted(trades, key=lambda t: t.closed_at or t.created_at):
        equity += trade.pnl or 0.0
        curve.append(equity)
    return equity, curve
