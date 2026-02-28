FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY src/frontend/package*.json ./
RUN npm ci

COPY src/frontend/ ./

# Empty string = same-origin, so /recommend/ resolves to the Cloud Run host
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ─────────────────────────────────────────────────────────────

FROM python:3.11-slim

WORKDIR /app

COPY src/backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY src/backend/ ./

# Serve the React build as static files via FastAPI
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
