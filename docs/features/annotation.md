# Annotation Workflow

After logging in, an annotator selects a project, picks a document from the
project [Overview](#project-overview), and annotates it on the annotation page.

## Document lifecycle

Opening a document is driven by `useCasSeg`, which sequences the WebSocket
handshake and reports progress through a `LoadingStateDrawer`:

1. `open_cas` — load text, type system and views
2. `open_view` — switch to the annotator's personal view (`view_user_<name>`)
3. `open_tool` / `open_tool_seg` — load feature structures (images are paged)

Saving stages each form field as a `create` or `edit` on the document's command
queue and flushes them as a single `work_batch`; the server confirms with a
`msg` event.

## Criteria-based rating forms

Rating forms are described declaratively as **criteria sections**
(`lib/criteriaForm.ts`). Each field is a `button`, `select` or `number` and may
carry a description and RAG-specific labels/values:

```ts
const criteriaSections: CriteriaSection[] = [
  {
    title: "Student answers",
    fields: [
      { id: "K1", type: "button", label: "Task completed as instructed?" },
      {
        id: "K11",
        type: "select",
        label: "Task fulfilment",
        options: [{ label: "0 – topic missed", value: "0" } /* … */]
      },
      { id: "K16", type: "number", label: "Number of sources" }
    ]
  }
]
```

Helpers derive the form's default values (`createDefaultValues`) and the
machine-readable descriptions handed to the RAG Bot
(`createCriteriaDescriptions`). Each value is persisted as a UIMA
`org.texttechnologylab.annotation.core.Category` feature structure keyed by the
field `id`.

The page renders the criteria as `AnnotationCriteriaSections` next to the source
material — scenario text, question/answer blocks, and a virtualised image
gallery (`DynamicImageList`).

## Multimedia

Images are stored as base64 `AnnotationComment` feature structures and loaded
page by page through `useImages`/`open_tool_seg`, then rendered with
[react-virtuoso](https://virtuoso.dev/) so large documents stay responsive.
Clicking a thumbnail opens a zoomable dialog.

## Project Overview

The per-project Overview (`pages/projects/Overview.tsx`) lists documents with
their annotation status, the annotators who have contributed, and — for admins —
the access map. It also hosts the admin panel (overall progress and
[CSV export](admin.md#export)).
