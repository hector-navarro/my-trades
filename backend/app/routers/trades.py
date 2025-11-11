from datetime import datetime
from io import StringIO
from typing import List

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from .. import models, schemas
from ..dependencies import get_current_user, get_db
from ..utils.calculations import compute_planned_rr, compute_r_multiple, detect_plan_deviations

router = APIRouter(prefix="/trades", tags=["trades"])


@router.get("/", response_model=List[schemas.TradeRead])
def list_trades(
    status: models.TradeStatus | None = Query(None),
    symbol: str | None = Query(None),
    setup_id: int | None = Query(None),
    direction: models.TradeDirection | None = Query(None),
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.Trade).filter(models.Trade.user_id == current_user.id)
    if status:
        query = query.filter(models.Trade.status == status)
    if symbol:
        query = query.filter(models.Trade.symbol == symbol)
    if setup_id:
        query = query.filter(models.Trade.setup_id == setup_id)
    if direction:
        query = query.filter(models.Trade.direction == direction)
    if start_date:
        query = query.filter(models.Trade.created_at >= start_date)
    if end_date:
        query = query.filter(models.Trade.created_at <= end_date)
    trades = query.order_by(models.Trade.created_at.desc()).offset(skip).limit(limit).all()
    return trades


@router.post("/", response_model=schemas.TradeRead)
def create_trade(
    trade_in: schemas.TradeCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trade = models.Trade(
        user_id=current_user.id,
        symbol=trade_in.symbol,
        direction=trade_in.direction,
        planned_entry=trade_in.planned_entry,
        planned_sl=trade_in.planned_sl,
        planned_tp=trade_in.planned_tp,
        planned_time_limit_minutes=trade_in.planned_time_limit_minutes,
        planned_reason=trade_in.planned_reason,
        planned_emotion=trade_in.planned_emotion,
        planned_tags=trade_in.planned_tags,
        quantity=trade_in.quantity,
        account_id=trade_in.account_id,
        setup_id=trade_in.setup_id,
        planned_risk_reward=compute_planned_rr(trade_in.direction, trade_in.planned_entry, trade_in.planned_sl, trade_in.planned_tp),
    )
    if trade_in.tag_ids:
        tags = db.query(models.Tag).filter(models.Tag.id.in_(trade_in.tag_ids), models.Tag.user_id == current_user.id).all()
        trade.tags = tags
    db.add(trade)
    db.flush()
    for attachment in trade_in.attachments or []:
        db.add(models.TradeAttachment(trade_id=trade.id, url=attachment.url, description=attachment.description))
    db.commit()
    db.refresh(trade)
    return trade


@router.get("/{trade_id}", response_model=schemas.TradeRead)
def get_trade(trade_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    trade = (
        db.query(models.Trade)
        .filter(models.Trade.id == trade_id, models.Trade.user_id == current_user.id)
        .first()
    )
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade


@router.put("/{trade_id}", response_model=schemas.TradeRead)
def update_trade(
    trade_id: int,
    trade_in: schemas.TradeUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trade = (
        db.query(models.Trade)
        .filter(models.Trade.id == trade_id, models.Trade.user_id == current_user.id)
        .first()
    )
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    for field, value in trade_in.dict(exclude_unset=True).items():
        if field == "tag_ids" and value is not None:
            tags = db.query(models.Tag).filter(models.Tag.id.in_(value), models.Tag.user_id == current_user.id).all()
            trade.tags = tags
        else:
            setattr(trade, field, value)
    if trade.planned_entry and trade.planned_sl and trade.planned_tp:
        trade.planned_risk_reward = compute_planned_rr(trade.direction, trade.planned_entry, trade.planned_sl, trade.planned_tp)
    db.commit()
    db.refresh(trade)
    return trade


@router.post("/{trade_id}/events", response_model=schemas.TradeRead)
def add_event(
    trade_id: int,
    event_in: schemas.TradeEventCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trade = (
        db.query(models.Trade)
        .filter(models.Trade.id == trade_id, models.Trade.user_id == current_user.id)
        .first()
    )
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    occurred_at = event_in.occurred_at or datetime.utcnow()
    event = models.TradeEvent(
        trade_id=trade.id,
        type=event_in.type,
        price=event_in.price,
        quantity=event_in.quantity,
        note=event_in.note,
        occurred_at=occurred_at,
    )
    if event_in.type == "ENTRY":
        trade.status = models.TradeStatus.OPEN
        trade.actual_entry_price = event_in.price
        trade.opened_at = occurred_at
    if event_in.type == "EXIT":
        trade.status = models.TradeStatus.CLOSED
        trade.actual_exit_price = event_in.price
        trade.closed_at = occurred_at
        if trade.actual_entry_price is None:
            trade.actual_entry_price = trade.planned_entry
        if trade.actual_exit_price is not None and trade.actual_entry_price is not None:
            trade.pnl = (
                (trade.actual_exit_price - trade.actual_entry_price)
                if trade.direction == models.TradeDirection.LONG
                else (trade.actual_entry_price - trade.actual_exit_price)
            ) * (trade.quantity or 1)
            trade.r_multiple = compute_r_multiple(
                trade.direction, trade.actual_entry_price, trade.planned_sl, trade.actual_exit_price
            )
        complied, _ = detect_plan_deviations(trade, list(trade.events) + [event])
        trade.complied_with_plan = complied
    db.add(event)
    db.commit()
    db.refresh(trade)
    return trade


@router.delete("/{trade_id}")
def delete_trade(trade_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    trade = (
        db.query(models.Trade)
        .filter(models.Trade.id == trade_id, models.Trade.user_id == current_user.id)
        .first()
    )
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    db.delete(trade)
    db.commit()
    return {"ok": True}


@router.get("/{trade_id}/export")
def export_trade_csv(trade_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    trade = (
        db.query(models.Trade)
        .filter(models.Trade.id == trade_id, models.Trade.user_id == current_user.id)
        .first()
    )
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    events_data = [
        {
            "type": event.type,
            "price": event.price,
            "quantity": event.quantity,
            "occurred_at": event.occurred_at.isoformat() if event.occurred_at else None,
            "note": event.note,
        }
        for event in trade.events
    ]
    df = pd.DataFrame(events_data)
    csv_buffer = StringIO()
    df.to_csv(csv_buffer, index=False)
    csv_buffer.seek(0)
    filename = f"trade_{trade.id}_events.csv"
    return StreamingResponse(
        iter([csv_buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
