# Trading Diary Platform

Aplicación completa de diario de trading con backend NestJS + MongoDB y frontend Angular.

## Requisitos

- Node.js 20+
- npm 10+
- Docker (opcional pero recomendado)

## Variables de entorno

Configura las variables basadas en `.env.example`.

```
cp .env.example .env
```

### Claves principales

- `PORT`: Puerto de la API (default `3000`).
- `MONGODB_URI`: Cadena de conexión a MongoDB.
- `JWT_SECRET` y `JWT_REFRESH_SECRET`: Secretos para tokens.

## Instalación y ejecución (API)

```bash
npm install
npm run start:dev
```

La API estará disponible en `http://localhost:3000/api/v1`.

## Docker Compose

Levanta MongoDB y la API con:

```bash
docker compose up -d --build
```

Esto expondrá:

- API NestJS en `http://localhost:3000/api/v1`
- MongoDB en `mongodb://localhost:27017`

## Tests

```bash
npm run test
```

## Formato y lint

```bash
npm run lint
npm run format
```

## Colección Postman

En `infra/TradingDiary.postman_collection.json` hay una colección con ejemplos de requests.

## Frontend Angular

El frontend se encuentra en `frontend/`.

```bash
cd frontend
npm install
npm run start
```

Aplicación disponible en `http://localhost:4200`.

## Funcionalidades principales

- Autenticación JWT con refresh tokens.
- Gestión de trades con eventos y adjuntos (URL).
- Cálculo automático de métricas (`rMultiple`, `followedPlan`).
- Configuración de políticas de riesgo, setups y tags.
- Reportes con agregaciones MongoDB (overview y errores comunes).
- Exportación CSV.
