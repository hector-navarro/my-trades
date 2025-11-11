from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .routers import auth, trades, setups, tags, risk, reports

init_db()

app = FastAPI(title="Trading Journal API", openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(trades.router, prefix="/api")
app.include_router(setups.router, prefix="/api")
app.include_router(tags.router, prefix="/api")
app.include_router(risk.router, prefix="/api")
app.include_router(reports.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
