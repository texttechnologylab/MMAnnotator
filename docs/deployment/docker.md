# Docker Deployment

The app ships with a multi-stage Dockerfile that builds the frontend and serves
it with nginx.

## Build & run

```bash
docker build -t mm-annotator .
docker run -p 80:80 \
  -e BACKEND_URL=wss://your-host/uima \
  -e UCE_URL=https://your-uce-host \
  mm-annotator
```

The app is then available at `http://localhost`.

## How it works

1. **Build stage** — `node:22-alpine` runs `npm install` and `npm run build`.
2. **Serve stage** — the `dist/` output is copied into `nginx:alpine` with a
   custom `nginx.conf`.

## SPA routing

`nginx.conf` falls back to `index.html` so client-side routes resolve correctly.

## Runtime configuration

`docker-entrypoint.sh` runs at container start and writes the environment
variables into a `config.js` file (defining `window._env_`) served next to the
app. This lets one image target different backends without rebuilding. See
[Configuration](../getting-started/configuration.md) for the available
variables.

## Docker Compose

```yaml
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - BACKEND_URL=wss://your-host/uima
      - UCE_URL=https://your-uce-host
```
