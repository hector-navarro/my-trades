from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Float,
    Enum,
    Boolean,
    ForeignKey,
    Table,
    Text,
)
from sqlalchemy.orm import relationship
import enum

from .db import Base


class Direction(str, enum.Enum):
    LONG = "LONG"
    SHORT = "SHORT"


class TradeStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"


class EventType(str, enum.Enum):
    ENTRY = "ENTRY"
    ADD = "ADD"
    REDUCE = "REDUCE"
    MOVE_SL = "MOVE_SL"
    MOVE_TP = "MOVE_TP"
    EXIT = "EXIT"
    NOTE = "NOTE"


trade_tags = Table(
    "trade_tags",
    Base.metadata,
    Column("trade_id", ForeignKey("trades.id"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    accounts = relationship("Account", back_populates="user", cascade="all, delete")
    setups = relationship("Setup", back_populates="user", cascade="all, delete")
    tags = relationship("Tag", back_populates="user", cascade="all, delete")
    trades = relationship("Trade", back_populates="user", cascade="all, delete")
    risk_policy = relationship("RiskPolicy", uselist=False, back_populates="user", cascade="all, delete")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    balance = Column(Float, default=0.0)

    user = relationship("User", back_populates="accounts")
    trades = relationship("Trade", back_populates="account")


class Setup(Base):
    __tablename__ = "setups"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="setups")
    trades = relationship("Trade", back_populates="setup")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="tags")
    trades = relationship("Trade", secondary=trade_tags, back_populates="tags")


class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    setup_id = Column(Integer, ForeignKey("setups.id"))

    symbol = Column(String, nullable=False)
    direction = Column(Enum(Direction), nullable=False)
    status = Column(Enum(TradeStatus), default=TradeStatus.PLANNED, nullable=False)

    planned_entry = Column(Float, nullable=False)
    planned_stop_loss = Column(Float, nullable=False)
    planned_take_profit = Column(Float, nullable=False)
    planned_risk_reward = Column(Float)
    planned_time_limit_minutes = Column(Integer)
    planned_reason = Column(Text)
    emotional_state = Column(String)

    actual_entry_price = Column(Float)
    actual_exit_price = Column(Float)
    pnl = Column(Float)
    rr_multiple = Column(Float)
    complied_plan = Column(Boolean)

    opened_at = Column(DateTime)
    closed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="trades")
    account = relationship("Account", back_populates="trades")
    setup = relationship("Setup", back_populates="trades")
    tags = relationship("Tag", secondary=trade_tags, back_populates="trades")
    events = relationship("TradeEvent", back_populates="trade", cascade="all, delete-orphan")
    attachments = relationship("TradeAttachment", back_populates="trade", cascade="all, delete-orphan")


class TradeEvent(Base):
    __tablename__ = "trade_events"

    id = Column(Integer, primary_key=True)
    trade_id = Column(Integer, ForeignKey("trades.id"), nullable=False)
    type = Column(Enum(EventType), nullable=False)
    note = Column(Text)
    price = Column(Float)
    quantity = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

    trade = relationship("Trade", back_populates="events")


class TradeAttachment(Base):
    __tablename__ = "trade_attachments"

    id = Column(Integer, primary_key=True)
    trade_id = Column(Integer, ForeignKey("trades.id"), nullable=False)
    url = Column(String, nullable=False)
    description = Column(String)

    trade = relationship("Trade", back_populates="attachments")


class RiskPolicy(Base):
    __tablename__ = "risk_policies"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    max_risk_per_trade = Column(Float)
    max_daily_loss = Column(Float)
    max_consecutive_losses = Column(Integer)
    max_trade_duration_minutes = Column(Integer)

    user = relationship("User", back_populates="risk_policy")
