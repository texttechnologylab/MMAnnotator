import { NumberInput } from "@/components/inputs/CustomInput"
import { InputLabel } from "@/components/inputs/common"
import { SwitchInput } from "@/components/inputs/SwitchInput"
import { Button } from "@/components/shadcn/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card"
import { DataTable } from "@/components/shadcn/ui/data-table"
import { DataTableContent } from "@/components/shadcn/ui/data-table-content"
import { DataTablePagination } from "@/components/shadcn/ui/data-table-pagination"
import { DialogContent, DialogTrigger } from "@/components/shadcn/ui/dialog"
import { Form } from "@/components/shadcn/ui/form"
import { LoadingState } from "@/components/shadcn/ui/loading-button"
import { useANNO } from "@/lib/annotator/AnnoLib"
import type { DocumentData } from "@/lib/resources/repository"
import { useDocumentStore } from "@/zustand/useDocument"
import { Dialog } from "@radix-ui/react-dialog"
import type { VisibilityState } from "@tanstack/react-table"
import { type ChangeEvent, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as pako from "pako"
import { fileColumns } from "./columns"
import type { FileData, UploadFormData } from "./types"

interface UploadFilesDialogProps {
  documentTableData: DocumentData[]
  repositoryId: string
}

export const UploadFilesDialog = ({
  documentTableData,
  repositoryId
}: UploadFilesDialogProps) => {
  const { subscribeToWebSocket } = useDocumentStore()
  const { saveCASDocumentRepoRaw } = useANNO()

  const form = useForm<UploadFormData>({
    defaultValues: {
      repository: repositoryId,
      duplicates: false
    }
  })

  // Keep the repository field in sync when the parent changes the selected item
  useEffect(() => {
    form.setValue("repository", repositoryId)
  }, [repositoryId, form])

  const { control, handleSubmit } = form

  const [tableData, setTableData] = useState<FileData[]>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  useEffect(() => {
    setColumnVisibility(
      Object.assign(
        {},
        ...fileColumns.map((column: any) => ({
          [column.accessorKey]: column.visible
        }))
      ) as VisibilityState
    )
  }, [])

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const allowDuplicates = form.getValues("duplicates")
    const target = e.target
    if (target.files === null) return

    const data: FileData[] = []
    for (let i = 0; i < target.files.length; i++) {
      const file = target.files.item(i)
      if (file === null) continue
      if (
        !allowDuplicates &&
        documentTableData.map((entry) => entry.name).includes(file.name)
      ) {
        continue
      }
      data.push({
        name: file.name,
        description: file.name,
        size: file.size,
        type: file.type,
        progress: LoadingState.NEUTRAL,
        file
      })
    }
    setTableData(data)
  }

  const uploadFiles = async (data: UploadFormData) => {
    for (let i = 0; i < tableData.length; i++) {
      const file = tableData[i]
      if (file.progress !== LoadingState.NEUTRAL) continue

      const updated = [...tableData]
      updated[i] = { ...updated[i], progress: LoadingState.LOADING }
      setTableData(updated)

      const reader = new FileReader()
      if (file.type === "application/x-gzip") {
        await new Promise((resolve) => {
          reader.readAsArrayBuffer(file.file)
          reader.onload = async () => {
            const res = pako.inflate(reader.result as ArrayBuffer, {
              to: "string"
            })
            saveCASDocumentRepoRaw(
              file.name,
              file.description,
              Number(data.repository),
              res
            )
            resolve(res)
          }
        })
      } else {
        saveCASDocumentRepoRaw(
          file.name,
          file.description,
          Number(data.repository),
          await file.file.text()
        )
      }

      await new Promise((resolve) => {
        subscribeToWebSocket(
          "create_db_cas_fast",
          () => resolve(true),
          "create_db" + file.name
        )
      })

      setTableData((prev) =>
        prev.map((f, j) =>
          j === i ? { ...f, progress: LoadingState.SUCCESS } : f
        )
      )
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild className="float-right">
        <Button>Upload Files</Button>
      </DialogTrigger>
      <DialogContent>
        <CardHeader>
          <CardTitle>Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(uploadFiles)}>
              <NumberInput
                control={control}
                name="repository"
                label={"Repository/Project ID"}
              />
              <input type="file" multiple onChange={onFileChange} />
              <InputLabel label="Allow Duplicates" />
              <SwitchInput control={control} name="duplicates" />
              <span>
                <DataTable
                  columns={fileColumns}
                  data={tableData}
                  columnVisibility={columnVisibility}
                  setColumnVisibility={setColumnVisibility}
                >
                  <div className="max-h-[300px] overflow-scroll">
                    <DataTableContent />
                  </div>
                  <DataTablePagination
                    pageSizes={[10, 20, 30, 50, 100, 200, 500, 1000]}
                  />
                </DataTable>
              </span>
              <Button type="submit">Upload</Button>
            </form>
          </Form>
        </CardContent>
      </DialogContent>
    </Dialog>
  )
}
