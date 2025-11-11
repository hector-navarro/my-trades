from collections import deque
from datetime import datetime, timedelta
from typing import List

from sqlalchemy.orm import Session

from ..models import RiskPolicy, Trade, TradeStatus


def evaluate_risk_policy(db: Session, user_id: int) -> List[str]:
    messages: List[str] = []
    policy: RiskPolicy | None = db.query(RiskPolicy).filter(RiskPolicy.user_id == user_id).first()
    if not policy:
        return messages

    recent_trades = (
        db.query(Trade)
        .filter(Trade.user_id == user_id)
        .order_by(Trade.closed_at.desc())
        .limit(50)
        .all()
    )

    today = datetime.utcnow().date()
    daily_loss = 0.0
    consecutive_losses = 0

    for trade in recent_trades:
        if trade.status != TradeStatus.CLOSED:
            continue
        if trade.closed_at and trade.closed_at.date() == today:
            daily_loss += min(trade.pnl or 0.0, 0.0)
        if (trade.pnl or 0.0) < 0:
            consecutive_losses += 1
        else:
            break

    if policy.max_daily_loss is not None and abs(daily_loss) >= policy.max_daily_loss:
        messages.append("Se alcanzó la pérdida diaria máxima establecida")

    if policy.max_consecutive_losses is not None and consecutive_losses >= policy.max_consecutive_losses:
        messages.append("Se alcanzó el número máximo de pérdidas consecutivas")

    if policy.max_risk_per_trade is not None:
        open_trades = db.query(Trade).filter(Trade.user_id == user_id, Trade.status == TradeStatus.OPEN).all()
        for trade in open_trades:
            risk = abs(trade.planned_entry - trade.planned_stop_loss)
            if risk > policy.max_risk_per_trade:
                messages.append(f"Trade {trade.id} excede el riesgo máximo permitido")

    if policy.max_trade_duration_minutes is not None:
        open_trades = db.query(Trade).filter(Trade.user_id == user_id, Trade.status == TradeStatus.OPEN).all()
        for trade in open_trades:
            if trade.opened_at:
                elapsed = datetime.utcnow() - trade.opened_at
                if elapsed > timedelta(minutes=policy.max_trade_duration_minutes):
                    messages.append(f"Trade {trade.id} excede el tiempo máximo permitido")

    return messages
