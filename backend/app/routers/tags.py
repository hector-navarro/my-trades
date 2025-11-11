from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..db import get_db
from ..utils.security import get_current_user

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=List[schemas.Tag])
def list_tags(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Tag).filter(models.Tag.user_id == current_user.id).all()


@router.post("", response_model=schemas.Tag)
def create_tag(payload: schemas.TagBase, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    tag = models.Tag(name=payload.name, user_id=current_user.id)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@router.put("/{tag_id}", response_model=schemas.Tag)
def update_tag(tag_id: int, payload: schemas.TagBase, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    tag = db.query(models.Tag).filter(models.Tag.id == tag_id, models.Tag.user_id == current_user.id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Etiqueta no encontrada")
    tag.name = payload.name
    db.commit()
    db.refresh(tag)
    return tag


@router.delete("/{tag_id}")
def delete_tag(tag_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    tag = db.query(models.Tag).filter(models.Tag.id == tag_id, models.Tag.user_id == current_user.id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Etiqueta no encontrada")
    db.delete(tag)
    db.commit()
    return {"ok": True}
