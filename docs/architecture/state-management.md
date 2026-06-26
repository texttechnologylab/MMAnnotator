# State Management

The app uses [Zustand](https://github.com/pmndrs/zustand) for global state.

## Stores

| Store              | File                          | Purpose                                                                                 |
| ------------------ | ----------------------------- | --------------------------------------------------------------------------------------- |
| `useUser`          | `zustand/useUser.tsx`         | Session, username and user URI (mirrored to cookies)                                    |
| `useProjectStore`  | `zustand/useProject.tsx`      | Project list and current project; `fetchProjects`                                       |
| `useDocumentStore` | `zustand/useDocument.tsx`     | CAS documents, the WebSocket, the listener registry, RAG messages, per-document options |
| `useProjectStore`  | `zustand/useProjectStats.tsx` | Per-project stats: raw response, completed docs, documents                              |
| `useLoadingState`  | `zustand/useLoadingState.tsx` | Multi-step loading indicators (e.g. open CAS → view → tool)                             |

## `useDocumentStore`

The central store. It owns:

- **`documents`** — a `Map<id, CASDocument>`. `CASDocument` mirrors the backend
  UIMA CAS: text, type system, views and `toolElements` (feature structures
  keyed by type and address).
- **The WebSocket** — created lazily by `initSocket`/`getAnnotationSocket`, with
  reconnect handling, a CSV-export blob handler, and per-command parsing
  (`open_cas`, `open_view`, `open_tool`, `change_cas`, `uce_rag`, …).
- **A grouped listener registry** — `subscribeToWebSocket(type, cb, group)`,
  `callListeners` and `clearListeners(group)`. Grouping by document/feature id
  lets a page subscribe and tear down cleanly without affecting others.

```tsx
const { subscribeToWebSocket, clearListeners } = useDocumentStore()

const unsubscribe = subscribeToWebSocket(
  "export",
  (data) => {
    // handle export completion
  },
  projectId
)
```

## Patterns

Hooks in `hooks/` wrap a store plus the API layer and return derived data — e.g.
`useProjectStats` issues `list_project_stats` and exposes `completed`, `raw` and
`projectDocuments`; `useCasSeg` drives the full open→view→tool→save lifecycle for
one document.
