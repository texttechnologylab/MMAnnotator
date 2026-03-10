# State Management

The app uses [Zustand](https://github.com/pmndrs/zustand) for global state management.

## Stores

| Store             | File                          | Purpose                                       |
| ----------------- | ----------------------------- | --------------------------------------------- |
| `useUser`         | `zustand/useUser.tsx`         | User session, username, authentication        |
| `useProject`      | `zustand/useProject.tsx`      | Current project selection, project list       |
| `useDocument`     | `zustand/useDocument.tsx`     | Document state, WebSocket event subscriptions |
| `useProjectStats` | `zustand/useProjectStats.tsx` | Annotation progress and statistics            |
| `useLoadingState` | `zustand/useLoadingState.tsx` | Global loading indicators                     |

## Patterns

Stores are consumed directly in components via hooks:

```tsx
const { userName, session } = useUser()
const { currentProject, setCurrentProject } = useProjectStore()
```

Data-fetching hooks in `hooks/` typically combine zustand stores with API calls and return derived data.
