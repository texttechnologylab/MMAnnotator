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

Build from source:

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

## Reproducible capsule

For a reproducible deployment, use the
prebuilt image published to the TTLab registry instead of building locally. The
frontend is one service of the wider TextAnnotator + RAG stack:

```yaml
ta-frontend:
  image: docker.texttechnologylab.org/textannotator-rag-demo:latest
  ports:
    - ${PORT_FRONTEND}:80
  environment:
    BACKEND_URL: ${WS_URL}
    UCE_URL: ${UCE_URL}
```

`PORT_FRONTEND`, `WS_URL` and `UCE_URL` are supplied via the stack's `.env` file;
`WS_URL` points at the TextAnnotator WebSocket (`…/uima`) and `UCE_URL` at the
UCE host serving the RAG Bot.

The UCE host is provided by the
[Unified Corpus Explorer (UCE)](https://github.com/texttechnologylab/UCE), which
serves the RAG Bot backend; see its repository for deployment instructions.
