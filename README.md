# Diario de Trading

Aplicación web completa (API + SPA) para planificar, ejecutar y analizar operaciones de trading.

## Características

- Autenticación JWT (registro, login, sesión renovable).
- Gestión completa de operaciones: planificación, eventos, adjuntos y cierre automático.
- Cálculo automático de métricas (R/R planificado, múltiplos de R, cumplimiento del plan).
- Panel de métricas globales con curva de capital y detección de desvíos frecuentes.
- Configuración de políticas de riesgo por usuario y alertas en la interfaz.
- Gestión de setups y etiquetas reutilizables.
- Exportación CSV de las operaciones.
- Backend FastAPI + SQLite y frontend React + Vite.

## Requisitos previos

- Python 3.11+
- Node.js 20+
- npm

Opcional: Docker y Docker Compose para despliegue en contenedores.

## Puesta en marcha (modo desarrollo)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

La API se expone en `http://localhost:8000` y la documentación automática en `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La SPA se sirve en `http://localhost:5173`.

## Ejecución con Docker Compose

```bash
docker-compose up --build
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

## Pruebas

```bash
cd backend
pytest
```

## Endpoints principales

- `POST /auth/signup` – registro de usuario.
- `POST /auth/login` – obtiene token JWT.
- `GET /trades` – listado filtrable de operaciones.
- `POST /trades` – creación de plan.
- `POST /trades/{id}/events` – registro de eventos de ejecución.
- `GET /trades/{id}` – detalle.
- `GET /trades/export/csv` – exportación de operaciones.
- `GET /reports/overview` – métricas globales.
- `GET /reports/deviations` – desvíos frecuentes.
- `GET/PUT /risk` – políticas de riesgo.
- `GET /trades/risk/alerts` – alertas activas.

Todas las rutas (excepto `/auth/*`) requieren encabezado `Authorization: Bearer <token>`.

## Datos de ejemplo

Tras registrarse se pueden crear setups/etiquetas desde la UI y planificar operaciones.

## Notas

- La aplicación utiliza SQLite por defecto, configurable mediante la variable de entorno `DATABASE_URL`.
- Para importar operaciones desde CSV se puede reutilizar el formato de exportación.
