# API & WebSockets

## Backend

The frontend communicates with the [TextAnnotator](https://github.com/texttechnologylab/TextAnnotator) backend.

## WebSocket Communication

Real-time features use a persistent WebSocket connection managed by `WebSocketProvider` (`components/wrappers/WebSocketProvider.tsx`).

Components subscribe to events via `useDocumentStore`:

```tsx
const { subscribeToWebSocket, clearListeners } = useDocumentStore()

subscribeToWebSocket(
  "export",
  (data) => {
    // handle export completion
  },
  listenerId
)
```

### Event Types

| Event             | Description                                      |
| ----------------- | ------------------------------------------------ |
| `export`          | Export job completed                             |
| `export_progress` | Export progress update                           |
| `msg`             | Generic server message                           |
| `uce_rag`         | RAG Bot response (open, message, message_update) |

## REST API

REST API calls are handled through utility functions in `lib/annotator/`:

- `AnnoApi.ts` — Core API client
- `AnnoLib.ts` — Higher-level annotation operations
- `login.ts` — Authentication
- `MainController.ts` — Request orchestration
