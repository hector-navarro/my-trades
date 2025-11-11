from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db
from ..utils.security import get_current_user

router = APIRouter(prefix="/risk", tags=["risk"])


@router.get("", response_model=schemas.RiskPolicy)
def get_policy(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    policy = db.query(models.RiskPolicy).filter(models.RiskPolicy.user_id == current_user.id).first()
    if not policy:
        policy = models.RiskPolicy(user_id=current_user.id)
        db.add(policy)
        db.commit()
        db.refresh(policy)
    return policy


@router.put("", response_model=schemas.RiskPolicy)
def update_policy(payload: schemas.RiskPolicyBase, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    policy = db.query(models.RiskPolicy).filter(models.RiskPolicy.user_id == current_user.id).first()
    if not policy:
        policy = models.RiskPolicy(user_id=current_user.id)
        db.add(policy)
    for key, value in payload.dict(exclude_unset=True).items():
        setattr(policy, key, value)
    db.commit()
    db.refresh(policy)
    return policy
