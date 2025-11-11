from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    DateTime,
    Enum,
    ForeignKey,
    Boolean,
    Text,
    Table,
)
from sqlalchemy.orm import relationship

from .database import Base
from .enums import TradeDirection, TradeStatus


trade_tags = Table(
    "trade_tags",
    Base.metadata,
    Column("trade_id", ForeignKey("trade.id"), primary_key=True),
    Column("tag_id", ForeignKey("tag.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    setups = relationship("Setup", back_populates="user", cascade="all, delete-orphan")
    tags = relationship("Tag", back_populates="user", cascade="all, delete-orphan")
    trades = relationship("Trade", back_populates="user", cascade="all, delete-orphan")
    risk_policy = relationship("RiskPolicy", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Account(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    balance = Column(Float, default=0.0)
    user_id = Column(Integer, ForeignKey("user.id"))

    user = relationship("User", back_populates="accounts")
    trades = relationship("Trade", back_populates="account")


class Setup(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    user_id = Column(Integer, ForeignKey("user.id"))

    user = relationship("User", back_populates="setups")
    trades = relationship("Trade", back_populates="setup")


class Tag(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    color = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("user.id"))

    user = relationship("User", back_populates="tags")
    trades = relationship("Trade", secondary=trade_tags, back_populates="tags")


class Trade(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("account.id"), nullable=True)
    setup_id = Column(Integer, ForeignKey("setup.id"), nullable=True)

    symbol = Column(String, nullable=False)
    direction = Column(Enum(TradeDirection), nullable=False)
    status = Column(Enum(TradeStatus), default=TradeStatus.PLANNED)

    planned_entry = Column(Float, nullable=False)
    planned_sl = Column(Float, nullable=False)
    planned_tp = Column(Float, nullable=False)
    planned_risk_reward = Column(Float, nullable=True)
    planned_time_limit_minutes = Column(Integer, nullable=True)
    planned_reason = Column(Text, nullable=True)
    planned_tags = Column(String, nullable=True)
    planned_emotion = Column(String, nullable=True)

    quantity = Column(Float, nullable=True)
    actual_entry_price = Column(Float, nullable=True)
    actual_exit_price = Column(Float, nullable=True)
    pnl = Column(Float, nullable=True)
    r_multiple = Column(Float, nullable=True)
    complied_with_plan = Column(Boolean, default=None)

    opened_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="trades")
    account = relationship("Account", back_populates="trades")
    setup = relationship("Setup", back_populates="trades")
    events = relationship("TradeEvent", back_populates="trade", cascade="all, delete-orphan")
    attachments = relationship("TradeAttachment", back_populates="trade", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=trade_tags, back_populates="trades")


class TradeEvent(Base):
    id = Column(Integer, primary_key=True, index=True)
    trade_id = Column(Integer, ForeignKey("trade.id"))
    type = Column(String, nullable=False)
    price = Column(Float, nullable=True)
    quantity = Column(Float, nullable=True)
    note = Column(Text, nullable=True)
    occurred_at = Column(DateTime, default=datetime.utcnow)

    trade = relationship("Trade", back_populates="events")


class TradeAttachment(Base):
    id = Column(Integer, primary_key=True, index=True)
    trade_id = Column(Integer, ForeignKey("trade.id"))
    url = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    trade = relationship("Trade", back_populates="attachments")


class RiskPolicy(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), unique=True)
    max_risk_per_trade = Column(Float, nullable=True)
    max_daily_loss = Column(Float, nullable=True)
    max_consecutive_losses = Column(Integer, nullable=True)
    max_trade_duration_minutes = Column(Integer, nullable=True)

    user = relationship("User", back_populates="risk_policy")
