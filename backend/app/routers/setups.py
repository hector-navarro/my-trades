from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..db import get_db
from ..utils.security import get_current_user

router = APIRouter(prefix="/setups", tags=["setups"])


@router.get("", response_model=List[schemas.Setup])
def list_setups(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Setup).filter(models.Setup.user_id == current_user.id).all()


@router.post("", response_model=schemas.Setup)
def create_setup(payload: schemas.SetupBase, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    setup = models.Setup(name=payload.name, description=payload.description, user_id=current_user.id)
    db.add(setup)
    db.commit()
    db.refresh(setup)
    return setup


@router.put("/{setup_id}", response_model=schemas.Setup)
def update_setup(setup_id: int, payload: schemas.SetupBase, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    setup = db.query(models.Setup).filter(models.Setup.id == setup_id, models.Setup.user_id == current_user.id).first()
    if not setup:
        raise HTTPException(status_code=404, detail="Setup no encontrado")
    setup.name = payload.name
    setup.description = payload.description
    db.commit()
    db.refresh(setup)
    return setup


@router.delete("/{setup_id}")
def delete_setup(setup_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    setup = db.query(models.Setup).filter(models.Setup.id == setup_id, models.Setup.user_id == current_user.id).first()
    if not setup:
        raise HTTPException(status_code=404, detail="Setup no encontrado")
    db.delete(setup)
    db.commit()
    return {"ok": True}
