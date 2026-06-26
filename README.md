# MultiMedia Annotator (MM-Annotator)

Web frontend for the [TextAnnotator](https://aclanthology.org/2020.lrec-1.112/)
backend - a browser-based platform for collaborative, real-time annotation of
text and multimedia (image) documents, with optional LLM-assisted annotation.
Built with React 19, TypeScript, Vite and Tailwind CSS.

## Features

- **Project-based workflow**: browse projects, track per-document annotation
  status and overall progress, resume where you left off.
- **Criteria-based rating forms**: configurable sections of button, select and
  numeric fields that map to UIMA `Category` feature structures.
- **Multimedia annotation**: text, question/answer scenarios and lazy-loaded,
  virtualised image galleries shown side by side.
- **LLM-assisted annotation (UCE RAG Bot)**: streaming chat with text and
  vision models that can read the document and auto-fill rating fields via
  structured _tool actions_.
- **Admin tooling**: document upload (XMI / gzipped XMI), CAS validation,
  fine-grained permission management (per user/group, recursive, even
  distribution among annotators), CSV export and progress dashboards.
- **Role-based access** and dark mode.

## Getting Started

Requires Node.js 22+ and npm 10+.

```bash
npm install
npm run dev      # dev server (http://localhost:5173)
npm run build    # production build -> dist/
npm run lint     # ESLint
npm run format   # Prettier
```

## Configuration

Backend endpoints are resolved at runtime from `window._env_`, with fallbacks in
[src/lib/constants.ts](src/lib/constants.ts):

| Variable      | Purpose                                |
| ------------- | -------------------------------------- |
| `BACKEND_URL` | TextAnnotator WebSocket URL (`…/uima`) |
| `UCE_URL`     | UCE host for the RAG Bot               |

In Docker these are injected at container start by
[docker-entrypoint.sh](docker-entrypoint.sh). See
[docs/getting-started/configuration.md](docs/getting-started/configuration.md).

## Docker

```bash
docker build -t mm-annotator .
docker run -p 80:80 -e BACKEND_URL=wss://host/uima -e UCE_URL=https://uce mm-annotator
```

A multi-stage build compiles the app and serves it via nginx with SPA routing.

## Project Structure

```
src/
  pages/        # Route pages (Login, Projects, Overview, Annotation, Admin Upload)
  components/   # UI: NavBar, RagBot, RepoTree, inputs/, display/, admin/, shadcn/
  hooks/        # Data hooks (useCasSeg, useImages, useProjectStats, …)
  lib/          # API clients (annotator/, resources/), helpers, criteria forms
  zustand/      # Global stores (user, project, document, stats, loading)
```

## Documentation

Full documentation is published at
**[texttechnologylab.github.io/MMAnnotator](https://texttechnologylab.github.io/MMAnnotator/)**.
The sources live in [docs/](docs/) and are built and deployed from `master` via
GitHub Actions (MkDocs Material).

## Demo

[https://www.eval.textannotator.texttechnologylab.org/](https://www.eval.textannotator.texttechnologylab.org/)

- Username: `DemoAnnotator`
- Password: `demo2025`
  Note: the adming panel is not available in the demo since uploading can not be permitted securely.
