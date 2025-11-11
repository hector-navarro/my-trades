from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.declarative import declared_attr
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./trading.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args, future=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


class Base:
    @declared_attr.directive
    def __tablename__(cls):
        return cls.__name__.lower()

    id = None


Base = declarative_base(cls=Base)


def init_db():
    from . import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
