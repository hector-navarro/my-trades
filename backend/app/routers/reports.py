from collections import Counter
from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..dependencies import get_current_user, get_db
from ..utils.calculations import build_equity_curve, detect_plan_deviations

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/overview", response_model=schemas.TradeMetrics)
def overview(
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.Trade).filter(models.Trade.user_id == current_user.id, models.Trade.status == models.TradeStatus.CLOSED)
    if start_date:
        query = query.filter(models.Trade.closed_at >= start_date)
    if end_date:
        query = query.filter(models.Trade.closed_at <= end_date)
    trades: List[models.Trade] = query.all()
    total_trades = len(trades)
    wins = [t for t in trades if (t.pnl or 0) > 0]
    win_rate = len(wins) / total_trades if total_trades else 0
    r_values = [t.r_multiple or 0 for t in trades]
    average_r = sum(r_values) / total_trades if total_trades else 0
    expectancy = (sum(r_values) / total_trades) if total_trades else 0
    drawdown = 0.0
    peak = 0.0
    running = 0.0
    for trade in sorted(trades, key=lambda t: t.closed_at or t.created_at):
        running += t.pnl or 0.0
        peak = max(peak, running)
        drawdown = min(drawdown, running - peak)
    top_symbols = [item for item, _ in Counter([t.symbol for t in trades]).most_common(5)]
    top_setups = [
        item
        for item, _ in Counter([
            t.setup.name if t.setup else "Unassigned"
            for t in trades
        ]).most_common(5)
    ]
    curve = build_equity_curve(trades)
    return schemas.TradeMetrics(
        total_trades=total_trades,
        win_rate=round(win_rate, 4),
        average_r=round(average_r, 4),
        expectancy=round(expectancy, 4),
        approximate_drawdown=round(drawdown, 4),
        top_symbols=top_symbols,
        top_setups=top_setups,
        equity_curve=curve,
    )


@router.get("/deviations", response_model=schemas.DeviationReport)
def deviations(
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.Trade).filter(models.Trade.user_id == current_user.id, models.Trade.status == models.TradeStatus.CLOSED)
    if start_date:
        query = query.filter(models.Trade.closed_at >= start_date)
    if end_date:
        query = query.filter(models.Trade.closed_at <= end_date)
    trades = query.all()
    early_exit = 0
    sl_violation = 0
    time_violation = 0
    for trade in trades:
        complied, stats = detect_plan_deviations(trade, trade.events)
        if stats["early_exit"]:
            early_exit += 1
        if stats["sl_violation"]:
            sl_violation += 1
        if stats["time_violation"]:
            time_violation += 1
    return schemas.DeviationReport(
        early_exit_count=early_exit,
        sl_violation_count=sl_violation,
        time_violation_count=time_violation,
        total_closed_trades=len(trades),
    )


@router.get("/risk-alerts", response_model=List[schemas.RiskAlert])
def risk_alerts(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    alerts: List[schemas.RiskAlert] = []
    policy = db.query(models.RiskPolicy).filter(models.RiskPolicy.user_id == current_user.id).first()
    if not policy:
        return alerts
    today = datetime.utcnow().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    trades_today = (
        db.query(models.Trade)
        .filter(
            models.Trade.user_id == current_user.id,
            models.Trade.closed_at >= start_of_day,
            models.Trade.closed_at <= end_of_day,
        )
        .all()
    )
    total_loss_today = sum([t.pnl for t in trades_today if t.pnl and t.pnl < 0])
    losses_in_row = 0
    for trade in (
        db.query(models.Trade)
        .filter(models.Trade.user_id == current_user.id, models.Trade.status == models.TradeStatus.CLOSED)
        .order_by(models.Trade.closed_at.desc())
        .all()
    ):
        if trade.pnl and trade.pnl < 0:
            losses_in_row += 1
        else:
            break
    if policy.max_daily_loss and abs(total_loss_today) > policy.max_daily_loss:
        alerts.append(schemas.RiskAlert(message="Daily loss limit exceeded", level="danger"))
    if policy.max_consecutive_losses and losses_in_row >= policy.max_consecutive_losses:
        alerts.append(schemas.RiskAlert(message="Consecutive loss limit reached", level="warning"))
    if policy.max_risk_per_trade:
        risky_trades = (
            db.query(models.Trade)
            .filter(models.Trade.user_id == current_user.id)
            .filter(models.Trade.status == models.TradeStatus.OPEN)
            .filter(func.abs(models.Trade.planned_entry - models.Trade.planned_sl) > policy.max_risk_per_trade)
            .all()
        )
        if risky_trades:
            alerts.append(schemas.RiskAlert(message="Some open trades exceed max risk per trade", level="info"))
    if policy.max_trade_duration_minutes:
        threshold = datetime.utcnow() - timedelta(minutes=policy.max_trade_duration_minutes)
        long_trades = (
            db.query(models.Trade)
            .filter(models.Trade.user_id == current_user.id, models.Trade.status == models.TradeStatus.OPEN)
            .filter(models.Trade.opened_at != None)  # noqa: E711
            .filter(models.Trade.opened_at < threshold)
            .all()
        )
        if long_trades:
            alerts.append(schemas.RiskAlert(message="Some open trades exceed max duration", level="warning"))
    return alerts
