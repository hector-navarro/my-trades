from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, validator

from .enums import TradeDirection, TradeStatus


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str]


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class AccountBase(BaseModel):
    name: str
    balance: Optional[float]


class AccountCreate(AccountBase):
    pass


class AccountRead(AccountBase):
    id: int

    class Config:
        orm_mode = True


class SetupBase(BaseModel):
    name: str
    description: Optional[str]


class SetupCreate(SetupBase):
    pass


class SetupRead(SetupBase):
    id: int

    class Config:
        orm_mode = True


class TagBase(BaseModel):
    name: str
    color: Optional[str]


class TagCreate(TagBase):
    pass


class TagRead(TagBase):
    id: int

    class Config:
        orm_mode = True


class TradeAttachmentBase(BaseModel):
    url: str
    description: Optional[str]


class TradeAttachmentCreate(TradeAttachmentBase):
    pass


class TradeAttachmentRead(TradeAttachmentBase):
    id: int

    class Config:
        orm_mode = True


class TradeEventBase(BaseModel):
    type: str
    price: Optional[float]
    quantity: Optional[float]
    note: Optional[str]
    occurred_at: Optional[datetime]


class TradeEventCreate(TradeEventBase):
    pass


class TradeEventRead(TradeEventBase):
    id: int

    class Config:
        orm_mode = True


class TradeBase(BaseModel):
    symbol: str
    direction: TradeDirection
    planned_entry: float
    planned_sl: float
    planned_tp: float
    planned_time_limit_minutes: Optional[int]
    planned_reason: Optional[str]
    planned_emotion: Optional[str]
    planned_tags: Optional[str]
    quantity: Optional[float]
    account_id: Optional[int]
    setup_id: Optional[int]
    tag_ids: Optional[List[int]] = []

    @validator("planned_tp")
    def validate_plan(cls, v, values):
        entry = values.get("planned_entry")
        sl = values.get("planned_sl")
        direction = values.get("direction")
        if entry is None or sl is None or direction is None:
            return v
        if direction == TradeDirection.LONG:
            if not (sl < entry < v):
                raise ValueError("For LONG trades, SL < entry < TP must hold")
        else:
            if not (v < entry < sl):
                raise ValueError("For SHORT trades, TP < entry < SL must hold")
        return v


class TradeCreate(TradeBase):
    attachments: Optional[List[TradeAttachmentCreate]] = []


class TradeUpdate(BaseModel):
    status: Optional[TradeStatus]
    planned_entry: Optional[float]
    planned_sl: Optional[float]
    planned_tp: Optional[float]
    planned_time_limit_minutes: Optional[int]
    planned_reason: Optional[str]
    planned_emotion: Optional[str]
    planned_tags: Optional[str]
    quantity: Optional[float]
    account_id: Optional[int]
    setup_id: Optional[int]
    tag_ids: Optional[List[int]]


class TradeRead(BaseModel):
    id: int
    status: TradeStatus
    symbol: str
    direction: TradeDirection
    planned_entry: float
    planned_sl: float
    planned_tp: float
    planned_risk_reward: Optional[float]
    planned_time_limit_minutes: Optional[int]
    planned_reason: Optional[str]
    planned_emotion: Optional[str]
    planned_tags: Optional[str]
    quantity: Optional[float]
    account_id: Optional[int]
    setup_id: Optional[int]
    actual_entry_price: Optional[float]
    actual_exit_price: Optional[float]
    pnl: Optional[float]
    r_multiple: Optional[float]
    complied_with_plan: Optional[bool]
    opened_at: Optional[datetime]
    closed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    events: List[TradeEventRead] = []
    attachments: List[TradeAttachmentRead] = []
    tags: List[TagRead] = []

    class Config:
        orm_mode = True


class RiskPolicyBase(BaseModel):
    max_risk_per_trade: Optional[float]
    max_daily_loss: Optional[float]
    max_consecutive_losses: Optional[int]
    max_trade_duration_minutes: Optional[int]


class RiskPolicyRead(RiskPolicyBase):
    id: int

    class Config:
        orm_mode = True


class RiskPolicyCreate(RiskPolicyBase):
    pass


class TradeMetrics(BaseModel):
    total_trades: int
    win_rate: float
    average_r: float
    expectancy: float
    approximate_drawdown: float
    top_symbols: List[str]
    top_setups: List[str]
    equity_curve: List[float]


class DeviationReport(BaseModel):
    early_exit_count: int
    sl_violation_count: int
    time_violation_count: int
    total_closed_trades: int


class RiskAlert(BaseModel):
    message: str
    level: str
