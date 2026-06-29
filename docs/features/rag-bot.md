# RAG Bot

The **UCE RAG Bot** (`components/RagBot.tsx`) is an optional LLM assistant
available on the annotation page. It opens as a resizable overlay so the
annotator can chat while keeping the document in view. The backend is provided by
the [Unified Corpus Explorer (UCE)](https://github.com/texttechnologylab/UCE).

## Models

The bot supports text and vision models served via UCE/Ollama; a recommended
model is preselected per `promptType`:

| Model                        | Use                 |
| ---------------------------- | ------------------- |
| `ollama/qwen3:8b-q4_K_M`     | text (default)      |
| `ollama/qwen2.5vl:7b-q4_K_M` | text **and** images |

## How it works

1. **Start chat** — the client sends a `uce_rag` `open` command carrying the
   chosen model, the document's text ordering (`casTextOrder`), the criteria
   descriptions, and the `promptType`. The backend builds a system prompt from
   these and returns a chat session id.
2. **Chat** — messages are sent as `uce_rag` `message` and streamed back as
   `message_update` events; partial output is rendered live. `<think>…</think>`
   reasoning blocks are visually de-emphasised.

## Tool actions

The model can act on the form. When a reply contains a JSON object such as:

```json
{ "command": "edit_field", "criteria_id": "A4", "value": "2" }
```

the client maps it to the corresponding criteria field and calls the form's
`setValue`, so the rating is filled in automatically. The JSON is stripped from
the visible message and replaced with a confirmation line. This lets the bot
propose ratings that the annotator can review and adjust before saving.
