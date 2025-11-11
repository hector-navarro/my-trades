from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, validator

from .models import Direction, EventType, TradeStatus


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class AccountBase(BaseModel):
    name: str
    balance: float = 0.0


class Account(AccountBase):
    id: int

    class Config:
        orm_mode = True


class SetupBase(BaseModel):
    name: str
    description: Optional[str] = None


class Setup(SetupBase):
    id: int

    class Config:
        orm_mode = True


class TagBase(BaseModel):
    name: str


class Tag(TagBase):
    id: int

    class Config:
        orm_mode = True


class AttachmentBase(BaseModel):
    url: str
    description: Optional[str]


class Attachment(AttachmentBase):
    id: int

    class Config:
        orm_mode = True


class TradeBase(BaseModel):
    symbol: str
    direction: Direction
    planned_entry: float
    planned_stop_loss: float
    planned_take_profit: float
    planned_time_limit_minutes: Optional[int]
    planned_reason: Optional[str]
    emotional_state: Optional[str]
    account_id: Optional[int]
    setup_id: Optional[int]
    tag_ids: List[int] = []

    @validator("planned_stop_loss", "planned_take_profit", "planned_entry")
    def validate_prices(cls, value):
        if value is None:
            raise ValueError("Price values must be provided")
        return value


class TradeCreate(TradeBase):
    attachments: List[AttachmentBase] = []


class TradeUpdate(BaseModel):
    status: Optional[TradeStatus]
    planned_time_limit_minutes: Optional[int]
    planned_reason: Optional[str]
    emotional_state: Optional[str]
    planned_stop_loss: Optional[float]
    planned_take_profit: Optional[float]
    planned_entry: Optional[float]
    setup_id: Optional[int]
    account_id: Optional[int]
    tag_ids: Optional[List[int]]


class TradeDetail(TradeBase):
    id: int
    status: TradeStatus
    planned_risk_reward: Optional[float]
    actual_entry_price: Optional[float]
    actual_exit_price: Optional[float]
    pnl: Optional[float]
    rr_multiple: Optional[float]
    complied_plan: Optional[bool]
    opened_at: Optional[datetime]
    closed_at: Optional[datetime]
    created_at: datetime
    setup: Optional[Setup]
    tags: List[Tag]
    attachments: List[Attachment]

    class Config:
        orm_mode = True


class TradeEventBase(BaseModel):
    type: EventType
    note: Optional[str]
    price: Optional[float]
    quantity: Optional[float]
    timestamp: Optional[datetime]


class TradeEventCreate(TradeEventBase):
    pass


class TradeEvent(TradeEventBase):
    id: int

    class Config:
        orm_mode = True


class RiskPolicyBase(BaseModel):
    max_risk_per_trade: Optional[float]
    max_daily_loss: Optional[float]
    max_consecutive_losses: Optional[int]
    max_trade_duration_minutes: Optional[int]


class RiskPolicy(RiskPolicyBase):
    id: int

    class Config:
        orm_mode = True


class OverviewMetrics(BaseModel):
    total_trades: int
    win_rate: float
    average_r: float
    expectancy: float
    approximate_drawdown: float
    total_pnl: float
    best_symbols: List[str]
    best_setups: List[str]
    equity_curve: List[float]


class DeviationsReport(BaseModel):
    total_trades: int
    early_exit_count: int
    sl_violation_count: int
    time_violation_count: int


class TradeExportRow(BaseModel):
    id: int
    symbol: str
    direction: Direction
    status: TradeStatus
    planned_entry: float
    planned_stop_loss: float
    planned_take_profit: float
    planned_risk_reward: Optional[float]
    actual_entry_price: Optional[float]
    actual_exit_price: Optional[float]
    pnl: Optional[float]
    rr_multiple: Optional[float]
    complied_plan: Optional[bool]
    setup: Optional[str]
    tags: str
    opened_at: Optional[datetime]
    closed_at: Optional[datetime]


class RiskAlert(BaseModel):
    triggered: bool
    messages: List[str]
