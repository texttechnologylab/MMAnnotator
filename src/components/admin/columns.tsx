import { LoadingState } from "@/components/shadcn/ui/loading-button"
import { Checkbox } from "@/components/shadcn/ui/checkbox"
import type { ColumnDef } from "@tanstack/react-table"
import type { DocumentData } from "@/lib/resources/repository"
import { LoadingStateIcon } from "./LoadingStateIcon"
import type { DocumentDataValid, FileData } from "./types"

export const documentToValid = (
  documents: DocumentData[]
): DocumentDataValid[] =>
  documents.map((entry) => ({ ...entry, valid: LoadingState.NEUTRAL }))

export const fileColumns: ColumnDef<FileData>[] = [
  {
    accessorKey: "name",
    header: "Name"
  },
  {
    accessorKey: "description",
    header: "Description"
  },
  {
    accessorKey: "size",
    header: "Size"
  },
  {
    accessorKey: "type",
    header: "Type"
  },
  {
    accessorKey: "progress",
    cell: ({ row }: { row: any }) => (
      <LoadingStateIcon loading={row.getValue("progress")} />
    ),
    header: "Progress"
  },
  {
    accessorKey: "file",
    header: "File",
    visible: false
  } as ColumnDef<FileData>
]

export const validateColumns: ColumnDef<DocumentDataValid>[] = [
  {
    accessorKey: "name",
    header: "Name"
  },
  {
    accessorKey: "valid",
    cell: ({ row }: { row: any }) => (
      <LoadingStateIcon loading={row.getValue("valid")} />
    ),
    header: "Valid"
  }
]

export const documentColumns: ColumnDef<DocumentData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    )
  },
  {
    accessorKey: "name",
    header: "Name"
  },
  {
    accessorKey: "description",
    header: "Description"
  },
  {
    accessorKey: "size",
    header: "Size"
  },
  {
    accessorKey: "mimetype",
    header: "MimeType"
  },
  {
    accessorKey: "created",
    header: "Created"
  },
  {
    accessorKey: "modified",
    header: "Modified"
  },
  {
    accessorKey: "owner.label",
    header: "Owner"
  },
  {
    accessorKey: "uri",
    header: "URI"
  },
  {
    accessorKey: "permission",
    header: "Permission"
  }
]
