from datetime import datetime, timedelta
from types import SimpleNamespace

from ..enums import TradeDirection
from ..utils.calculations import compute_planned_rr, compute_r_multiple, detect_plan_deviations


def dummy_trade(direction=TradeDirection.LONG):
    return SimpleNamespace(
        id=1,
        user_id=1,
        symbol="AAPL",
        direction=direction,
        planned_entry=100,
        planned_sl=95 if direction == TradeDirection.LONG else 105,
        planned_tp=110 if direction == TradeDirection.LONG else 90,
        planned_time_limit_minutes=60,
    )


def test_compute_planned_rr():
    rr = compute_planned_rr(TradeDirection.LONG, 100, 95, 110)
    assert rr == 2.0


def test_compute_r_multiple_long():
    r = compute_r_multiple(TradeDirection.LONG, 100, 95, 110)
    assert r == 2.0


def test_compute_r_multiple_short():
    r = compute_r_multiple(TradeDirection.SHORT, 100, 105, 90)
    assert r == 2.0


def test_detect_plan_deviation_ok():
    trade = dummy_trade()
    now = datetime.utcnow()
    events = []
    entry_event = type("Evt", (), {"type": "ENTRY", "price": 100, "occurred_at": now})
    exit_event = type(
        "Evt",
        (),
        {"type": "EXIT", "price": 110, "occurred_at": now + timedelta(minutes=30)},
    )
    complied, stats = detect_plan_deviations(trade, [entry_event, exit_event])
    assert complied is True
    assert stats == {"early_exit": False, "sl_violation": False, "time_violation": False}


def test_detect_plan_deviation_flags():
    trade = dummy_trade()
    now = datetime.utcnow()
    entry_event = type("Evt", (), {"type": "ENTRY", "price": 100, "occurred_at": now})
    sl_move = type("Evt", (), {"type": "MOVE_SL", "price": 90, "occurred_at": now + timedelta(minutes=5)})
    exit_event = type(
        "Evt",
        (),
        {"type": "EXIT", "price": 105, "occurred_at": now + timedelta(minutes=120)},
    )
    complied, stats = detect_plan_deviations(trade, [entry_event, sl_move, exit_event])
    assert complied is False
    assert stats["early_exit"] is True
    assert stats["sl_violation"] is True
    assert stats["time_violation"] is True
