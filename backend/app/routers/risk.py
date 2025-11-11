from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..dependencies import get_current_user, get_db

router = APIRouter(prefix="/risk", tags=["risk"])


@router.get("/policy", response_model=schemas.RiskPolicyRead | None)
def get_policy(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.RiskPolicy).filter(models.RiskPolicy.user_id == current_user.id).first()


@router.post("/policy", response_model=schemas.RiskPolicyRead)
def upsert_policy(
    policy_in: schemas.RiskPolicyCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    policy = db.query(models.RiskPolicy).filter(models.RiskPolicy.user_id == current_user.id).first()
    if not policy:
        policy = models.RiskPolicy(user_id=current_user.id)
        db.add(policy)
        db.flush()
    for field, value in policy_in.dict(exclude_unset=True).items():
        setattr(policy, field, value)
    db.commit()
    db.refresh(policy)
    return policy
