# Docker Deployment

The app ships with a multi-stage Dockerfile that builds the frontend and serves it via nginx.

## Build & Run

```bash
docker build -t mm-annotator .
docker run -p 80:80 mm-annotator
```

The app will be available at `http://localhost`.

## How It Works

1. **Build stage** — Uses `node:22-alpine` to `npm install` and `npm run build`
2. **Serve stage** — Copies the `dist/` output into `nginx:alpine` with a custom `nginx.conf`

## Custom nginx Configuration

The `nginx.conf` is copied into the container to handle SPA routing (all paths fall back to `index.html`).

## Environment Variables at Runtime

The `docker-entrypoint.sh` script runs at container startup and can inject environment variables (e.g., backend URL) into the built assets before nginx starts serving.

## Docker Compose Example

```yaml
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - BACKEND_URL=https://your-backend.example.com
```
