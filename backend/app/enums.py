import enum


class TradeStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"


class TradeDirection(str, enum.Enum):
    LONG = "LONG"
    SHORT = "SHORT"
