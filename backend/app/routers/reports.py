from collections import Counter
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db
from ..services.calculations import summarize_equity_curve
from ..utils.security import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/overview", response_model=schemas.OverviewMetrics)
def overview(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    trades: List[models.Trade] = (
        db.query(models.Trade)
        .filter(models.Trade.user_id == current_user.id, models.Trade.status == models.TradeStatus.CLOSED)
        .all()
    )
    total = len(trades)
    wins = len([t for t in trades if (t.pnl or 0) > 0])
    win_rate = wins / total if total else 0.0
    average_r = sum(t.rr_multiple or 0 for t in trades) / total if total else 0.0
    expectancy = win_rate * average_r - (1 - win_rate) * abs(average_r) if total else 0.0
    total_pnl, curve = summarize_equity_curve(trades)

    best_symbols = [symbol for symbol, _ in Counter(t.symbol for t in trades).most_common(3)]
    best_setups = [setup for setup, _ in Counter(t.setup.name if t.setup else "Sin setup" for t in trades).most_common(3)]

    min_equity = min(curve) if curve else 0.0
    drawdown = min_equity if min_equity < 0 else 0.0

    return schemas.OverviewMetrics(
        total_trades=total,
        win_rate=win_rate,
        average_r=average_r,
        expectancy=expectancy,
        approximate_drawdown=abs(drawdown),
        total_pnl=total_pnl,
        best_symbols=best_symbols,
        best_setups=best_setups,
        equity_curve=curve,
    )


@router.get("/deviations", response_model=schemas.DeviationsReport)
def deviations(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    trades: List[models.Trade] = (
        db.query(models.Trade)
        .filter(models.Trade.user_id == current_user.id, models.Trade.status == models.TradeStatus.CLOSED)
        .all()
    )
    total = len(trades)
    early_exit = 0
    sl_violation = 0
    time_violation = 0
    for trade in trades:
        deviations = getattr(trade, "_deviations_cache", None)
        if not deviations and trade.events:
            from ..services.calculations import update_trade_outcome

            update_trade_outcome(trade)
            deviations = getattr(trade, "_deviations_cache", None)
        if deviations:
            if deviations.get("early_exit"):
                early_exit += 1
            if deviations.get("sl_violation"):
                sl_violation += 1
            if deviations.get("time_violation"):
                time_violation += 1
    return schemas.DeviationsReport(
        total_trades=total,
        early_exit_count=early_exit,
        sl_violation_count=sl_violation,
        time_violation_count=time_violation,
    )
