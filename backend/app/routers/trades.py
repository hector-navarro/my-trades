from datetime import datetime
from io import StringIO
from typing import List, Optional

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from .. import models, schemas
from ..db import get_db
from ..services.calculations import calculate_planned_rr, update_trade_outcome
from ..services.risk import evaluate_risk_policy
from ..utils.security import get_current_user

router = APIRouter(prefix="/trades", tags=["trades"])


@router.get("", response_model=List[schemas.TradeDetail])
def list_trades(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    symbol: Optional[str] = None,
    setup_id: Optional[int] = None,
    state: Optional[models.TradeStatus] = None,
    direction: Optional[models.Direction] = None,
    tag: Optional[int] = None,
):
    query = db.query(models.Trade).filter(models.Trade.user_id == current_user.id)
    if start_date:
        query = query.filter(models.Trade.created_at >= start_date)
    if end_date:
        query = query.filter(models.Trade.created_at <= end_date)
    if symbol:
        query = query.filter(models.Trade.symbol.ilike(f"%{symbol}%"))
    if setup_id:
        query = query.filter(models.Trade.setup_id == setup_id)
    if state:
        query = query.filter(models.Trade.status == state)
    if direction:
        query = query.filter(models.Trade.direction == direction)
    if tag:
        query = query.join(models.Trade.tags).filter(models.Tag.id == tag)
    return query.order_by(models.Trade.created_at.desc()).all()


@router.post("", response_model=schemas.TradeDetail)
def create_trade(payload: schemas.TradeCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if payload.direction == models.Direction.LONG and not (payload.planned_stop_loss < payload.planned_entry < payload.planned_take_profit):
        raise HTTPException(status_code=400, detail="Validación LONG fallida: SL < entrada < TP")
    if payload.direction == models.Direction.SHORT and not (payload.planned_take_profit < payload.planned_entry < payload.planned_stop_loss):
        raise HTTPException(status_code=400, detail="Validación SHORT fallida: TP < entrada < SL")

    trade = models.Trade(
        user_id=current_user.id,
        symbol=payload.symbol,
        direction=payload.direction,
        planned_entry=payload.planned_entry,
        planned_stop_loss=payload.planned_stop_loss,
        planned_take_profit=payload.planned_take_profit,
        planned_time_limit_minutes=payload.planned_time_limit_minutes,
        planned_reason=payload.planned_reason,
        emotional_state=payload.emotional_state,
        account_id=payload.account_id,
        setup_id=payload.setup_id,
    )
    trade.planned_risk_reward = calculate_planned_rr(trade.direction, trade.planned_entry, trade.planned_stop_loss, trade.planned_take_profit)
    if payload.tag_ids:
        tags = db.query(models.Tag).filter(models.Tag.id.in_(payload.tag_ids), models.Tag.user_id == current_user.id).all()
        trade.tags = tags

    for attachment in payload.attachments:
        trade.attachments.append(models.TradeAttachment(url=attachment.url, description=attachment.description))

    db.add(trade)
    db.commit()
    db.refresh(trade)

    return trade


@router.get("/{trade_id}", response_model=schemas.TradeDetail)
def get_trade(trade_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    trade = (
        db.query(models.Trade)
        .filter(models.Trade.id == trade_id, models.Trade.user_id == current_user.id)
        .first()
    )
    if not trade:
        raise HTTPException(status_code=404, detail="Trade no encontrado")
    return trade


@router.put("/{trade_id}", response_model=schemas.TradeDetail)
def update_trade(trade_id: int, payload: schemas.TradeUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    trade = (
        db.query(models.Trade)
        .filter(models.Trade.id == trade_id, models.Trade.user_id == current_user.id)
        .first()
    )
    if not trade:
        raise HTTPException(status_code=404, detail="Trade no encontrado")

    data = payload.dict(exclude_unset=True)
    if "tag_ids" in data:
        tags = db.query(models.Tag).filter(models.Tag.id.in_(data["tag_ids"]), models.Tag.user_id == current_user.id).all()
        trade.tags = tags
        data.pop("tag_ids")
    for key, value in data.items():
        setattr(trade, key, value)

    trade.planned_risk_reward = calculate_planned_rr(trade.direction, trade.planned_entry, trade.planned_stop_loss, trade.planned_take_profit)
    db.commit()
    db.refresh(trade)
    return trade


@router.delete("/{trade_id}")
def delete_trade(trade_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    trade = db.query(models.Trade).filter(models.Trade.id == trade_id, models.Trade.user_id == current_user.id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade no encontrado")
    db.delete(trade)
    db.commit()
    return {"ok": True}


@router.post("/{trade_id}/events", response_model=schemas.TradeEvent)
def add_event(trade_id: int, payload: schemas.TradeEventCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    trade = db.query(models.Trade).filter(models.Trade.id == trade_id, models.Trade.user_id == current_user.id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade no encontrado")
    event = models.TradeEvent(trade_id=trade.id, type=payload.type, note=payload.note, price=payload.price, quantity=payload.quantity, timestamp=payload.timestamp or datetime.utcnow())
    trade.events.append(event)

    if payload.type == models.EventType.ENTRY and payload.price is not None:
        trade.actual_entry_price = payload.price
        trade.opened_at = event.timestamp
        trade.status = models.TradeStatus.OPEN
    if payload.type == models.EventType.EXIT and payload.price is not None:
        trade.actual_exit_price = payload.price
        trade.closed_at = event.timestamp
        trade.status = models.TradeStatus.CLOSED
        update_trade_outcome(trade)

    db.add(event)
    db.commit()
    db.refresh(event)
    db.refresh(trade)
    return event


@router.get("/{trade_id}/events", response_model=List[schemas.TradeEvent])
def list_events(trade_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    trade = db.query(models.Trade).filter(models.Trade.id == trade_id, models.Trade.user_id == current_user.id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade no encontrado")
    return trade.events


@router.post("/{trade_id}/attachments", response_model=schemas.Attachment)
def add_attachment(trade_id: int, payload: schemas.AttachmentBase, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    trade = db.query(models.Trade).filter(models.Trade.id == trade_id, models.Trade.user_id == current_user.id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade no encontrado")
    attachment = models.TradeAttachment(url=payload.url, description=payload.description)
    trade.attachments.append(attachment)
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment


@router.get("/export/csv")
def export_trades_csv(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    trades = db.query(models.Trade).filter(models.Trade.user_id == current_user.id).all()
    rows: List[schemas.TradeExportRow] = []
    for trade in trades:
        rows.append(
            schemas.TradeExportRow(
                id=trade.id,
                symbol=trade.symbol,
                direction=trade.direction,
                status=trade.status,
                planned_entry=trade.planned_entry,
                planned_stop_loss=trade.planned_stop_loss,
                planned_take_profit=trade.planned_take_profit,
                planned_risk_reward=trade.planned_risk_reward,
                actual_entry_price=trade.actual_entry_price,
                actual_exit_price=trade.actual_exit_price,
                pnl=trade.pnl,
                rr_multiple=trade.rr_multiple,
                complied_plan=trade.complied_plan,
                setup=trade.setup.name if trade.setup else None,
                tags=",".join(tag.name for tag in trade.tags),
                opened_at=trade.opened_at,
                closed_at=trade.closed_at,
            ).dict()
        )
    df = pd.DataFrame(rows)
    buffer = StringIO()
    df.to_csv(buffer, index=False)
    return Response(content=buffer.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=trades.csv"})


@router.get("/risk/alerts", response_model=schemas.RiskAlert)
def risk_alerts(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    messages = evaluate_risk_policy(db, current_user.id)
    return schemas.RiskAlert(triggered=bool(messages), messages=messages)
