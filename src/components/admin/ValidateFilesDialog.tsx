import { Button } from "@/components/shadcn/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card"
import { DataTable } from "@/components/shadcn/ui/data-table"
import { DataTableContent } from "@/components/shadcn/ui/data-table-content"
import { DataTablePagination } from "@/components/shadcn/ui/data-table-pagination"
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
  const { subscribeToWebSocket, clearListeners, getById } = useDocumentStore()
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
    let tableData = validDocuments
    setValidateRunning(LoadingState.LOADING)

    for (let i = 0; i < tableData.length; i++) {
      const document = tableData[i]
      const id = document.uri.split("/").pop()!
      openCASDocument(id)
      tableData = tableData.map((d, j) =>
        j === i ? { ...d, valid: LoadingState.LOADING } : d
      )
      setValidDocuments(tableData)

      const success = await new Promise((resolve) => {
        subscribeToWebSocket(
          "open_cas",
          () => resolve(true),
          "open_cas_test" + document.uri
        )
        subscribeToWebSocket(
          "msg",
          () => resolve(false),
          "open_cas_test" + document.uri
        )
      })

      clearListeners("open_cas_test" + document.uri)

      if (success) {
        const doc = getById(id)
        if (doc != null) closeCASDocument(doc)
        else console.error("Opened document is null in storage.")
      } else {
        errorOccurred = true
      }

      tableData = tableData.map((d, j) =>
        j === i
          ? { ...d, valid: success ? LoadingState.SUCCESS : LoadingState.ERROR }
          : d
      )
      setValidDocuments(tableData)
    }

    setValidateRunning(
      errorOccurred ? LoadingState.ERROR : LoadingState.SUCCESS
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={onOpen} variant="outline">
          Validate Files
        </Button>
      </DialogTrigger>
      <DialogContent>
        <CardHeader>
          <CardTitle>Validate Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[70vh]">
            <DataTable columns={validateColumns} data={validDocuments}>
              <div className="h-[90%] overflow-scroll">
                <DataTableContent />
              </div>
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
