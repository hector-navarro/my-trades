from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import Base, engine
from .routers import auth, trades, setups, tags, risk, reports

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Trading Journal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(trades.router)
app.include_router(setups.router)
app.include_router(tags.router)
app.include_router(risk.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {"message": "Trading Journal API"}
