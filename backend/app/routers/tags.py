from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..dependencies import get_current_user, get_db

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("/", response_model=List[schemas.TagRead])
def list_tags(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Tag).filter(models.Tag.user_id == current_user.id).all()


@router.post("/", response_model=schemas.TagRead)
def create_tag(tag_in: schemas.TagCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    tag = models.Tag(user_id=current_user.id, name=tag_in.name, color=tag_in.color)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@router.delete("/{tag_id}")
def delete_tag(tag_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    tag = (
        db.query(models.Tag)
        .filter(models.Tag.id == tag_id, models.Tag.user_id == current_user.id)
        .first()
    )
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    db.delete(tag)
    db.commit()
    return {"ok": True}
