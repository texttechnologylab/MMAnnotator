# Admin

Administrative features are available to users with sufficient access on a
project. They are split between the project **Overview** admin panel and the
dedicated **Upload** page (`/admin/upload`).

## Repository browser

The Upload page shows the project as a lazily loaded tree (`RepoTree`, using
React 19's `use()`), with documents of the selected repository listed in a
[TanStack Table](https://tanstack.com/table). Documents can be filtered by the
entity that has access to them.

## Upload

`UploadFilesDialog` uploads UIMA CAS documents into a repository. It accepts
`.xmi` and gzipped `.xmi.gz` files (decompressed client-side with
[pako](https://github.com/nodeca/pako)), optionally skips duplicates, and streams
each file to the backend via `create_db_cas_fast`, showing per-file and overall
progress.

## Validation

`ValidateFilesDialog` checks selected documents by opening each CAS and watching
for success or an error `msg`, marking every document valid or invalid — a quick
way to catch malformed uploads.

## Permissions

`RepoContextMenu` manages access control for the selected documents. For one or
more users/groups it sets a permission level — **None, Read, Write, Delete,
Grant** — optionally recursively. _Spread evenly_ distributes the selected
documents across the chosen annotators (useful for assigning a corpus across a
team). The same menu can delete resources.

## Export

From the Overview admin panel, **Export** issues an `export` command. Progress is
streamed via `export_progress`, and the resulting CSV (containing all
annotations) is delivered as a binary frame and downloaded automatically.
