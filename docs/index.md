# MultiMedia Annotator (MM-Annotator)

Web frontend for the [TextAnnotator](https://github.com/texttechnologylab/TextAnnotator)
backend — a browser-based platform for collaborative, real-time annotation of
text and multimedia (image) documents, with optional LLM-assisted annotation.

Built with React 19, TypeScript, Vite, Tailwind CSS v4 and
[shadcn/ui](https://ui.shadcn.com/). State is held in [Zustand](https://github.com/pmndrs/zustand);
all live annotation traffic runs over a single WebSocket to the TextAnnotator
UIMA CAS service.

## Features

- **Project workflow** — browse projects, track per-document status and overall
  progress, resume annotation. See [Annotation](features/annotation.md).
- **Real-time collaboration** — persistent WebSocket, batched CAS edits, live
  updates. See [API & WebSockets](architecture/api.md).
- **Criteria-based rating forms** — configurable button/select/numeric sections
  mapped to UIMA `Category` annotations.
- **Multimedia** — text, Q/A scenarios and virtualised, lazy-loaded image
  galleries side by side.
- **LLM assistance (UCE RAG Bot)** — streaming chat with text/vision models that
  can auto-fill rating fields. See [RAG Bot](features/rag-bot.md).
- **Admin tooling** — upload, validation, permissions, export. See
  [Admin](features/admin.md).
- Role-based access and dark mode.

## Quick Start

```bash
npm install
npm run dev
```

See [Installation](getting-started/installation.md) and
[Configuration](getting-started/configuration.md) for full setup.

## Demo

A live demo is available at
[eval.textannotator.texttechnologylab.org](https://www.eval.textannotator.texttechnologylab.org/).

|              |                 |
| ------------ | --------------- |
| **Username** | `DemoAnnotator` |
| **Password** | `demo2025`      |
