# Project Structure

```
src/
├── pages/              # Route-level page components
│   ├── LoginPage.tsx
│   ├── ProjectsPage.tsx
│   ├── AnnotatorPage.tsx
│   ├── LandingPage.tsx
│   ├── HelpPage.tsx
│   ├── LegalNotice.tsx
│   ├── admin/
│   │   └── Upload.tsx
│   └── projects/
│       ├── Overview.tsx
│       └── demo/
│           └── DemoImage.tsx
├── components/         # Reusable UI components
│   ├── NavBar.tsx
│   ├── RagBot.tsx
│   ├── RepoTree.tsx
│   ├── inputs/         # Form input components
│   ├── display/        # Display-only components
│   ├── shadcn/         # shadcn/ui components
│   ├── admin/          # Admin-specific components
│   └── wrappers/       # HOCs and providers
├── hooks/              # Custom React hooks for data fetching
├── lib/                # Utilities, API clients, helpers
│   ├── annotator/      # TextAnnotator API integration
│   └── resources/      # Permission and repository utilities
└── zustand/            # Global state stores
```

## Key Directories

### `pages/`

Each file corresponds to a route defined in `App.tsx`. Pages compose components and hooks together.

### `components/`

Reusable components shared across pages. Includes shadcn/ui primitives under `shadcn/ui/` and custom form inputs under `inputs/`.

### `hooks/`

Data-fetching hooks that encapsulate API calls and caching logic (e.g., `useProject`, `useImages`, `useCas`).

### `lib/`

Non-React utilities — API client functions, helper methods, and resource management.

### `zustand/`

Global state stores for user session, project selection, document state, and loading indicators.
