# Trading Journal Application

Aplicación web completa para planificar, ejecutar y analizar operaciones de trading.

## Estructura del proyecto

- `backend/`: API REST construida con FastAPI.
- `frontend/`: SPA desarrollada con React + Vite.
- `infra/`: Recursos de infraestructura y contenedores.

## Requisitos

- Docker y Docker Compose (recomendado).
- Opcionalmente: Python 3.11 y Node.js 20 para ejecución local sin contenedores.

## Puesta en marcha con contenedores

```bash
cd infra
docker compose up --build
```

Servicios disponibles:
- Backend: http://localhost:8000 (documentación OpenAPI en `/api/openapi.json`).
- Frontend: http://localhost:3000.
- Base de datos: Postgres accesible dentro de la red de Docker.

Credenciales de ejemplo: regístrate desde la interfaz (`/signup`).

## Ejecución local sin contenedores

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=sqlite:///./trading.db
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Pruebas

Ejecutar pruebas unitarias del backend:

```bash
cd backend
pytest
```

## Endpoints principales

- `POST /api/auth/signup`: registro de usuarios.
- `POST /api/auth/token`: autenticación (OAuth2 password flow).
- `GET/POST/PUT/DELETE /api/trades`: gestión de trades.
- `POST /api/trades/{id}/events`: registrar eventos de ejecución.
- `GET /api/reports/overview`: métricas agregadas.
- `GET /api/reports/deviations`: reporte de desvíos.
- `GET /api/reports/risk-alerts`: alertas en base a reglas de riesgo.
- `GET/POST /api/risk/policy`: configuración de riesgo por usuario.
- `GET/POST /api/setups`, `GET/POST /api/tags`: catálogos reutilizables.

## Exportación CSV

Cada trade permite exportar sus eventos mediante `GET /api/trades/{id}/export`.

## Seguridad

- Contraseñas con hash bcrypt.
- Autenticación mediante JWT (Bearer tokens).
- Validaciones de coherencia para operativas long/short.

## Métricas y análisis

El backend calcula métricas de win rate, R promedio, expectativa, drawdown aproximado, distribución por símbolo/setup y curva de capital. El frontend muestra estos datos en el dashboard.

## Evidencias y adjuntos

Los trades admiten adjuntar URLs de evidencia (`attachments`).

## Importación

Se puede extender fácilmente a importación CSV utilizando los endpoints existentes.
