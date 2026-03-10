# Components Overview

The app uses [shadcn/ui](https://ui.shadcn.com/) as its component library, built on Radix UI primitives and styled with Tailwind CSS v4.

## Component Categories

### Pages (`pages/`)

Route-level components rendered by React Router. Each page composes hooks and UI components.

### shadcn/ui (`components/shadcn/ui/`)

Pre-built accessible components: Button, Card, Table, Dialog, Drawer, Form, etc. Customized via CSS variables in `index.css`.

### Custom Inputs (`components/inputs/`)

Form field components built on top of `react-hook-form` and shadcn:

- `ButtonInput` — Toggle button group (radio-like selection)
- `ButtonArray` — Similar button group with Controller
- `SelectInput` — Dropdown select
- `ComboBoxInput` — Searchable combobox
- `CheckBoxInput` — Checkbox field
- `SwitchInput` — Toggle switch
- `DateInput` — Date picker
- `CustomInput` — Text/number inputs

### Display (`components/display/`)

- `ImageList` — Dynamic image gallery from CAS data
- `LoadingStateDrawer` — Drawer showing operation progress

### Key Components

- `NavBar` — Top navigation bar with side panel menu
- `RagBot` — AI chat assistant with resizable overlay panel
- `RepoTree` — Repository/project tree with async loading via React 19 `use()`
- `SelectableText` — Text highlighting and annotation
