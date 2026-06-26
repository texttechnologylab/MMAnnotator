# Configuration

## Runtime environment

Backend endpoints are read at runtime from the global `window._env_` object, so a
single build can be deployed against different backends. When a value is missing,
the fallbacks in [`src/lib/constants.ts`](https://github.com/texttechnologylab/MMAnnotator/blob/master/src/lib/constants.ts)
are used.

| Variable      | Used by                           | Purpose                               |
| ------------- | --------------------------------- | ------------------------------------- |
| `BACKEND_URL` | `zustand/useDocument` (WebSocket) | TextAnnotator UIMA service (`…/uima`) |
| `UCE_URL`     | `App.tsx` (RAG Bot routing)       | UCE host serving the RAG Bot          |

In Docker, `window._env_` is generated at container start by
[`docker-entrypoint.sh`](../deployment/docker.md), which writes the environment
variables into a `config.js` file served alongside the app.

## Service endpoints

The remaining backend services are configured in `src/lib/constants.ts`:

| Constant                | Service                                  |
| ----------------------- | ---------------------------------------- |
| `RESOURCE_MANAGER_URL`  | Projects, repositories, documents        |
| `AUTHORITY_MANAGER_URL` | Login, users, groups, access permissions |
| `ANNO_SERVICE_URL`      | Annotation service                       |
| `ANNO_API_URL`          | Annotation REST API                      |
| `SERVICES_URL`          | Auxiliary services                       |
| `TEXTIMAGER_URL`        | TextImager                               |
| `DEFAULT_UCE_URL`       | Default UCE host (RAG Bot)               |

## Build configuration

- **Vite** ([`vite.config.ts`](https://github.com/texttechnologylab/MMAnnotator/blob/master/vite.config.ts)) —
  `@vitejs/plugin-react`, `@tailwindcss/vite`, and manual chunking of heavy
  dependencies (icons, charts, Radix, tables, virtualisation).
- **Path alias** — `@/*` resolves to `src/*`.
