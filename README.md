# MultiMedia Annotator Frontend

React frontend for the [TextAnnotator](https://github.com/texttechnologylab/TextAnnotator) backend, built for creating and managing text/multimedia annotation projects.

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Docker:

```bash
docker build -t mm-annotator .
docker run -p 80:80 mm-annotator
```

## Project Structure

```
src/
  pages/          # Route pages (Login, Projects, Overview, Annotation, Admin)
  components/     # Reusable UI (NavBar, RagBot, inputs, shadcn wrappers)
  hooks/          # Data-fetching hooks (useProject, useImages, useCas, etc.)
  lib/            # API clients, helpers, resource utilities
  zustand/        # Global stores (user, project, document, loading state)
```

## Demo

[https://www.eval.textannotator.texttechnologylab.org/](https://www.eval.textannotator.texttechnologylab.org/)

- Username: `DemoAnnotator`
- Password: `demo2025`
