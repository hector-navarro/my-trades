from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..dependencies import get_current_user, get_db

router = APIRouter(prefix="/setups", tags=["setups"])


@router.get("/", response_model=List[schemas.SetupRead])
def list_setups(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Setup).filter(models.Setup.user_id == current_user.id).all()


@router.post("/", response_model=schemas.SetupRead)
def create_setup(setup_in: schemas.SetupCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    setup = models.Setup(user_id=current_user.id, name=setup_in.name, description=setup_in.description)
    db.add(setup)
    db.commit()
    db.refresh(setup)
    return setup


@router.delete("/{setup_id}")
def delete_setup(setup_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    setup = (
        db.query(models.Setup)
        .filter(models.Setup.id == setup_id, models.Setup.user_id == current_user.id)
        .first()
    )
    if not setup:
        raise HTTPException(status_code=404, detail="Setup not found")
    db.delete(setup)
    db.commit()
    return {"ok": True}
