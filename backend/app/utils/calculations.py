from datetime import datetime
from typing import Iterable, List, Tuple, TYPE_CHECKING

from ..enums import TradeDirection

if TYPE_CHECKING:
    from ..models import Trade, TradeEvent  # pragma: no cover


def compute_planned_rr(direction: TradeDirection, entry: float, sl: float, tp: float) -> float:
    risk = abs(entry - sl)
    reward = abs(tp - entry)
    return round(reward / risk, 4) if risk != 0 else 0.0


def compute_r_multiple(direction: TradeDirection, entry: float, sl: float, exit_price: float) -> float:
    risk = abs(entry - sl)
    if risk == 0:
        return 0.0
    result = exit_price - entry if direction == TradeDirection.LONG else entry - exit_price
    return result / risk


def detect_plan_deviations(trade: "Trade", events: Iterable["TradeEvent"]) -> Tuple[bool, dict]:
    """Return tuple (complied_with_plan, counters)."""
    if trade.planned_time_limit_minutes is None:
        time_limit = None
    else:
        time_limit = trade.planned_time_limit_minutes
    risk_price = abs(trade.planned_entry - trade.planned_sl)
    complied = True
    stats = {
        "early_exit": False,
        "sl_violation": False,
        "time_violation": False,
    }
    move_sl_against_plan = False
    exit_event = None
    first_event_time = None
    for event in sorted(events, key=lambda e: e.occurred_at or datetime.utcnow()):
        if first_event_time is None:
            first_event_time = event.occurred_at
        if event.type == "MOVE_SL" and event.price is not None:
            if trade.direction == TradeDirection.LONG and event.price < trade.planned_sl:
                move_sl_against_plan = True
            if trade.direction == TradeDirection.SHORT and event.price > trade.planned_sl:
                move_sl_against_plan = True
        if event.type == "EXIT":
            exit_event = event
    if exit_event and risk_price > 0:
        if trade.direction == TradeDirection.LONG and exit_event.price is not None:
            if trade.planned_tp - exit_event.price > 0.1 * risk_price:
                stats["early_exit"] = True
        if trade.direction == TradeDirection.SHORT and exit_event.price is not None:
            if exit_event.price - trade.planned_tp > 0.1 * risk_price:
                stats["early_exit"] = True
    if move_sl_against_plan:
        stats["sl_violation"] = True
    if exit_event and time_limit and first_event_time:
        elapsed = (exit_event.occurred_at - first_event_time).total_seconds() / 60.0
        if elapsed > time_limit:
            stats["time_violation"] = True
    complied = not any(stats.values())
    return complied, stats


def build_equity_curve(trades: List["Trade"]) -> List[float]:
    balance = 0.0
    curve = []
    for trade in sorted(trades, key=lambda t: t.closed_at or t.created_at):
        balance += trade.pnl or 0.0
        curve.append(round(balance, 2))
    return curve
