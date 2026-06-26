# API & WebSockets

The frontend talks to the [TextAnnotator](https://aclanthology.org/2020.lrec-1.112/)
backend over two channels: REST for resources/authentication and a persistent
WebSocket for live annotation.

## WebSocket (UIMA CAS)

A single connection is established by `WebSocketProvider`
(`components/wrappers/WebSocketProvider.tsx`): it opens the socket, authenticates
with a `session` command, then keeps it alive with a 30 s `ping`. The socket and
its message handling live in `useDocumentStore`; the command set is exposed
through `useANNO` (`lib/annotator/AnnoLib.ts`).

### Outgoing commands (selection)

| Command                       | Purpose                                                        |
| ----------------------------- | -------------------------------------------------------------- |
| `session`                     | Authenticate the connection                                    |
| `open_cas` / `close_cas`      | Open / close a CAS document                                    |
| `open_view` / `close_view`    | Select the annotator's view                                    |
| `open_tool` / `open_tool_seg` | Open a tool (segmented = paged, for images)                    |
| `work_batch`                  | Apply a queue of `create`/`edit`/`remove`/`append_array` edits |
| `save_cas`                    | Persist a document                                             |
| `create_db_cas_fast`          | Upload a new CAS from raw XMI                                  |
| `list_project_stats`          | Fetch per-project annotation statistics                        |
| `export`                      | Generate a CSV export                                          |
| `uce_rag`                     | RAG Bot (`open` / `message`)                                   |

Edits are not sent individually: callers stage `create`/`edit`/`remove`/
`append_array` commands on the document's `cmdQueue` and flush them with
`startQueue`, which emits a single `work_batch`.

### Incoming events

Components subscribe via the listener registry; the store dispatches on
`response.cmd`.

| Event                        | Description                                                  |
| ---------------------------- | ------------------------------------------------------------ |
| `open_cas`                   | Document metadata, text and type system                      |
| `open_tool[_seg]`            | Feature structures for a tool (paged for images)             |
| `change_cas`                 | Incremental feature-structure updates (live sync)            |
| `list_project_stats`         | Project statistics payload                                   |
| `export` / `export_progress` | Export finished / progress update                            |
| `uce_rag`                    | RAG Bot replies (`open`, `message`, `message_update` stream) |
| `msg`                        | Generic server message (e.g. save confirmation)              |
| `on_close`                   | Connection closed                                            |

Binary frames are treated as the CSV export blob and downloaded automatically.

## REST

REST clients are plain `fetch` wrappers; the session token is passed as a query
parameter.

- **Authority Manager** (`lib/annotator/login.ts`, `lib/resources/permissions.ts`)
  — `login`, `checklogin`, user/group lists, and access permissions
  (`listaccesspermissions`, `setaccesspermission`).
- **Resource Manager** (`lib/resources/repository.ts`) — projects, repositories
  and documents (`projects`, `project/:id`, `getrepositories`, `getdocuments`),
  plus create/delete operations.

Resources are addressed by typed URIs of the form
`…/resource/{project|repository|document}/{id}`.
