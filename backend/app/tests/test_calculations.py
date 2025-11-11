from datetime import datetime, timedelta

from ..models import Direction, EventType, Trade, TradeStatus
from ..services.calculations import calculate_planned_rr, derive_trade_outcome


class DummyEvent:
    def __init__(self, type, price=None, timestamp=None):
        self.type = type
        self.price = price
        self.timestamp = timestamp or datetime.utcnow()


def test_calculate_planned_rr_long():
    rr = calculate_planned_rr(Direction.LONG, entry=100, stop=95, target=110)
    assert rr == 2.0


def test_calculate_planned_rr_short():
    rr = calculate_planned_rr(Direction.SHORT, entry=100, stop=105, target=90)
    assert rr == 2.0


def test_derive_trade_outcome_compliance():
    trade = Trade(
        symbol="TEST",
        direction=Direction.LONG,
        planned_entry=100,
        planned_stop_loss=95,
        planned_take_profit=110,
        status=TradeStatus.CLOSED,
    )
    trade.actual_entry_price = 100
    trade.actual_exit_price = 110
    trade.opened_at = datetime.utcnow()
    trade.closed_at = trade.opened_at + timedelta(minutes=30)
    trade.events = [DummyEvent(EventType.ENTRY, price=100), DummyEvent(EventType.EXIT, price=110)]

    pnl, rr, complied, deviations = derive_trade_outcome(trade)
    assert round(pnl, 2) == 10
    assert round(rr, 2) == 2.0
    assert complied is True
    assert not deviations["early_exit"]


def test_derive_trade_outcome_detects_deviation():
    trade = Trade(
        symbol="TEST",
        direction=Direction.LONG,
        planned_entry=100,
        planned_stop_loss=95,
        planned_take_profit=110,
        planned_time_limit_minutes=10,
        status=TradeStatus.CLOSED,
    )
    trade.actual_entry_price = 100
    trade.actual_exit_price = 102
    trade.opened_at = datetime.utcnow()
    trade.closed_at = trade.opened_at + timedelta(minutes=20)
    trade.events = [
        DummyEvent(EventType.ENTRY, price=100),
        DummyEvent(EventType.MOVE_SL, price=97),
        DummyEvent(EventType.EXIT, price=102),
    ]

    pnl, rr, complied, deviations = derive_trade_outcome(trade)
    assert complied is False
    assert deviations["early_exit"] is True
    assert deviations["time_violation"] is True
    assert deviations["sl_violation"] is True
