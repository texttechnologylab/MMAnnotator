# Configuration

## Environment Variables

The app connects to a TextAnnotator backend via WebSocket. Configure the backend URL through Vite environment variables or the Docker entrypoint.

<!-- TODO: Document specific env vars once stabilized -->

## Vite Config

The Vite configuration lives in `vite.config.ts` and includes:

- `@vitejs/plugin-react` for React/JSX support
- `@tailwindcss/vite` for Tailwind CSS v4 integration

## Path Aliases

TypeScript path aliases are configured in `tsconfig.json`:

| Alias | Path    |
| ----- | ------- |
| `@/*` | `src/*` |

This allows imports like `@/components/shadcn/ui/button` instead of relative paths.
