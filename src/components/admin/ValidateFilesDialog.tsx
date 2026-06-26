import { Button } from "@/components/shadcn/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card"
import { DataTable } from "@/components/shadcn/ui/data-table"
import { DataTableContent } from "@/components/shadcn/ui/data-table-content"
import { DataTablePagination } from "@/components/shadcn/ui/data-table-pagination"
import { DataTableProgress } from "@/components/shadcn/ui/data-table-progress"
import { DialogContent, DialogTrigger } from "@/components/shadcn/ui/dialog"
import {
  LoadingButton,
  LoadingState
} from "@/components/shadcn/ui/loading-button"
import { useANNO } from "@/lib/annotator/AnnoLib"
import type { DocumentData } from "@/lib/resources/repository"
import { useDocumentStore } from "@/zustand/useDocument"
import { Dialog } from "@radix-ui/react-dialog"
import type { Table as TableType } from "@tanstack/react-table"
import { type RefObject, useState } from "react"
import { documentToValid, validateColumns } from "./columns"
import type { DocumentDataValid } from "./types"

interface ValidateFilesDialogProps {
  tableRef: RefObject<TableType<DocumentData> | undefined>
}

export const ValidateFilesDialog = ({ tableRef }: ValidateFilesDialogProps) => {
  const { subscribeToWebSocket, getById } = useDocumentStore()
  const { openCASDocument, closeCASDocument } = useANNO()

  const [validDocuments, setValidDocuments] = useState<DocumentDataValid[]>([])
  const [validateRunning, setValidateRunning] = useState<LoadingState>(
    LoadingState.NEUTRAL
  )

  const onOpen = () => {
    const rows =
      tableRef.current?.getSelectedRowModel().rows.map((row) => row.original) ??
      []
    setValidDocuments(documentToValid(rows))
  }

  const validateDocuments = async () => {
    let errorOccurred = false
    const documents = [...validDocuments]
    setValidateRunning(LoadingState.LOADING)

    for (let i = 0; i < documents.length; i++) {
      const document = documents[i]
      const id = document.uri.split("/").pop()!
      openCASDocument(id)

      setValidDocuments((prev) =>
        prev.map((d, j) =>
          j === i ? { ...d, valid: LoadingState.LOADING } : d
        )
      )

      const success = await new Promise((resolve) => {
        const group = "open_cas_test" + document.uri

        const unsubscribeOpen = subscribeToWebSocket(
          "open_cas",
          () => {
            unsubscribeOpen()
            unsubscribeMsg()
            resolve(true)
          },
          group
        )

        const unsubscribeMsg = subscribeToWebSocket(
          "msg",
          () => {
            unsubscribeOpen()
            unsubscribeMsg()
            resolve(false)
          },
          group
        )
      })

      if (success) {
        const doc = getById(id)
        if (doc != null) closeCASDocument(doc)
        else console.error("Opened document is null in storage.")
      } else {
        errorOccurred = true
      }

      setValidDocuments((prev) =>
        prev.map((d, j) =>
          j === i
            ? {
                ...d,
                valid: success ? LoadingState.SUCCESS : LoadingState.ERROR
              }
            : d
        )
      )
    }

    setValidateRunning(
      errorOccurred ? LoadingState.ERROR : LoadingState.SUCCESS
    )
  }

  const completedValidations = validDocuments.filter(
    (document) =>
      document.valid === LoadingState.SUCCESS ||
      document.valid === LoadingState.ERROR
  ).length

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={onOpen} variant="outline">
          Validate Files
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[60vw]">
        <CardHeader>
          <CardTitle>Validate Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[70vh]">
            <DataTable columns={validateColumns} data={validDocuments}>
              <div className="h-[90%] overflow-scroll">
                <DataTableContent />
              </div>
              <DataTableProgress
                className="mt-2"
                total={validDocuments.length}
                completed={completedValidations}
              />
              <div className="h-[10%] mt-3">
                <DataTablePagination
                  pageSizes={[10, 20, 30, 50, 100, 200, 500, 1000]}
                />
              </div>
            </DataTable>
          </div>

          <LoadingButton onClick={validateDocuments} loading={validateRunning}>
            Validate
          </LoadingButton>
        </CardContent>
      </DialogContent>
    </Dialog>
  )
}
