# Project Structure

```
src/
├── pages/                      # Route-level page components (see App.tsx)
│   ├── LoginPage.tsx           # Authority-Manager login
│   ├── LandingPage.tsx         # Redirects based on session
│   ├── ProjectsPage.tsx        # Project picker
│   ├── HelpPage.tsx / LegalNotice.tsx
│   ├── admin/Upload.tsx        # Admin: tree, documents, upload, permissions
│   └── projects/
│       ├── Overview.tsx        # Per-project document list + admin panel
│       └── demo/DemoImage.tsx  # Annotation page (criteria form + images + RAG)
├── components/
│   ├── NavBar.tsx              # Top bar, project switcher, theme toggle
│   ├── RagBot.tsx              # UCE RAG Bot chat panel
│   ├── RepoTree.tsx            # Async repository tree (React 19 `use()`)
│   ├── RepoContextMenu.tsx     # Permission management / delete
│   ├── inputs/                 # react-hook-form field components
│   ├── layout/                 # Annotation page layout + criteria sections
│   ├── display/                # ImageList, LoadingStateDrawer
│   ├── admin/                  # Upload/validate dialogs, table columns
│   ├── shadcn/                 # shadcn/ui primitives + theme provider
│   └── wrappers/               # WebSocketProvider, WithAuth
├── hooks/                      # Data hooks (useCasSeg, useImages, useProjectStats, …)
├── lib/
│   ├── annotator/              # WebSocket/CAS client (AnnoLib), login, AnnoApi
│   ├── resources/              # repository.ts, permissions.ts (REST clients)
│   ├── criteriaForm.ts         # Criteria-form model + helpers
│   └── helpers.ts              # CAS/form utilities, cookies
└── zustand/                    # Global stores
```

## Key directories

### `pages/`

Each file maps to a route declared in `App.tsx`. Pages compose hooks and
components; protected pages are wrapped in `WithAuth`.

### `lib/annotator/`

The non-React core. `AnnoLib.ts` (`useANNO`) exposes the full WebSocket command
set (open/save CAS, views, tools, batched edits, RAG messages, export). `login.ts`
handles authentication against the Authority Manager.

### `lib/resources/`

REST clients for the Resource Manager (`repository.ts`: projects, repositories,
documents) and Authority Manager (`permissions.ts`: users, groups, access
control).

### `hooks/` and `zustand/`

Hooks combine the stores with the API layer and return derived, view-ready data.
See [State Management](state-management.md).
