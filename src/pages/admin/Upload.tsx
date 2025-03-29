"use client"
import { NumberInput } from "@/components/inputs/CustomInput"
import { Button } from "@/components/shadcn/ui/button"
import { DataTable } from "@/components/shadcn/ui/data-table"
import { Form } from "@/components/shadcn/ui/form"
import {
  LoadingButton,
  LoadingState
} from "@/components/shadcn/ui/loading-button"
import { useANNO } from "@/lib/annotator/AnnoLib"
import { useDocumentStore } from "@/zustand/useDocument"
import {
  ColumnDef,
  Table as TableType,
  VisibilityState
} from "@tanstack/react-table"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import * as pako from "pako"
import {
  CircleAlert,
  CircleCheck,
  CircleDashedIcon,
  Loader2
} from "lucide-react"
import { TreeDataItem } from "@/components/shadcn/ui/tree"
import { DocumentData, getDocuments } from "@/lib/resources/repository"
import { useUser } from "@/zustand/useUser"
import { Checkbox } from "@/components/shadcn/ui/checkbox"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/shadcn/ui/resizable"
import { CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card"
import { DataTableContent } from "@/components/shadcn/ui/data-table-content"
import { DataTablePagination } from "@/components/shadcn/ui/data-table-pagination"
import { RepoTree } from "@/components/RepoTree"
import { RepoContextMenu } from "@/components/RepoContextMenu"
import WithAuth from "@/components/wrappers/WithAuth"
import { ReloadIcon } from "@radix-ui/react-icons"
import { SwitchInput } from "@/components/inputs/SwitchInput"
import { InputLabel } from "@/components/inputs/common"
import { ComboboxInput } from "@/components/inputs/ComboBoxInput"
import {
  getAccessPermissionsForTargets,
  getListUsersCombo,
  UserCombo
} from "@/lib/resources/permissions"
import { Dialog } from "@radix-ui/react-dialog"
import { DialogContent, DialogTrigger } from "@/components/shadcn/ui/dialog"
import { sameElements } from "@/lib/helpers"

interface FileData {
  name: string
  description: string
  size: number
  type: string
  progress: LoadingState
  file: File
}

export const LoadingStateIcon = ({ loading }: { loading?: LoadingState }) => {
  return (
    <>
      {loading == LoadingState.LOADING && (
        <Loader2 className={"h-4 w-4 animate-spin"} />
      )}
      {loading == LoadingState.ERROR && (
        <CircleAlert className="h-4 w-4 mr-2" />
      )}
      {loading == LoadingState.SUCCESS && (
        <CircleCheck className="h-4 w-4 mr-2" />
      )}
      {loading == LoadingState.NEUTRAL && (
        <CircleDashedIcon className="h-4 w-4 mr-2" />
      )}
    </>
  )
}

const columns: ColumnDef<FileData>[] = [
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
    cell: ({ row }: { row: any }) => {
      return <LoadingStateIcon loading={row.getValue("progress")} />
    },
    header: "Progress"
  },
  {
    accessorKey: "file",
    header: "File",
    visible: false
  } as ColumnDef<FileData>
]

type DocumentDataValid = DocumentData & { valid: LoadingState }

const documentToValid = (document: DocumentData[]): DocumentDataValid[] => {
  return document.map((entry) => ({ ...entry, valid: LoadingState.NEUTRAL }))
}

const validateColumns: ColumnDef<DocumentDataValid>[] = [
  {
    accessorKey: "name",
    header: "Name"
  },
  {
    accessorKey: "valid",
    cell: ({ row }: { row: any }) => {
      return <LoadingStateIcon loading={row.getValue("valid")} />
    },
    header: "Valid"
  }
]

const documentColumns: ColumnDef<DocumentData>[] = [
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

interface FormData {
  repository: string
  duplicates: boolean
}

export const UploadPage = () => {
  const { subscribeToWebSocket, clearListeners, getById } = useDocumentStore()
  const { saveCASDocumentRepoRaw, openCASDocument, closeCASDocument } =
    useANNO()
  const { session } = useUser()
  const [project, setProject] = useState<string>("30438")

  const treeForm = useForm({
    defaultValues: {
      project: "30438"
    }
  })

  const documentFilters = useForm({
    defaultValues: {
      user: ""
    }
  })

  const form = useForm<FormData>({
    defaultValues: {
      repository: "29614",
      duplicates: false
    }
  })

  const { control, handleSubmit, setValue } = form
  const [userCombo, setUserCombo] = useState<UserCombo[]>([])
  const [tableData, setTableData] = useState<FileData[]>([])
  const [validDocuments, setValidDocuments] = useState<DocumentDataValid[]>([])
  const [validateRunning, setValidateRunning] = useState<LoadingState>(
    LoadingState.NEUTRAL
  )
  const [documentTableData, setDocumentTableData] = useState<DocumentData[]>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [selectedItem, setSelectedItem] = useState<TreeDataItem>()
  const [targets, setTargets] = useState<string[]>([])
  const [filterUrls, setFilterUrls] = useState<string[]>([])

  const onSubmit = (data: FormData) => {
    uploadFiles(data)
  }

  const tableRef = useRef<TableType<DocumentData>>()

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const allowDuplicates = form.getValues("duplicates")
    const target = e.target
    if (target.files === null) return
    const data = []
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
        file: file
      } satisfies FileData)
    }
    setTableData(data)
  }

  useEffect(() => {
    setColumnVisibility(
      Object.assign(
        {},
        ...columns.map((column: any) => ({
          [column.accessorKey]: column.visible
        }))
      ) as VisibilityState
    )
  }, [])
  // TODO: Don't reset things when reoping stuff
  const onOpenValidate = () => {
    const tableData = documentToValid(
      tableRef.current?.getSelectedRowModel().rows.map((row) => row.original) ??
        []
    )
    setValidDocuments(tableData)
  }

  const validateDocuments = async () => {
    let errorOccured = false
    const tableData = validDocuments
    setValidateRunning(LoadingState.LOADING)
    for (const document of tableData) {
      console.log(tableData)
      const id = document.uri.split("/").pop()!
      openCASDocument(id)
      document.valid = LoadingState.LOADING
      setValidDocuments([...tableData])
      const success = await new Promise((resolve) => {
        subscribeToWebSocket(
          "open_cas",
          () => {
            resolve(true)
          },
          "open_cas_test" + document.uri
        )
        subscribeToWebSocket(
          "msg",
          () => {
            resolve(false)
          },
          "open_cas_test" + document.uri
        )
      })
      clearListeners("open_cas_test" + document.uri)
      if (success) {
        const doc = getById(id)
        if (doc != null) closeCASDocument(doc)
        else {
          console.error("Opened document is null in storage.")
        }
      } else {
        errorOccured = true
      }
      document.valid = success ? LoadingState.SUCCESS : LoadingState.ERROR
      setValidDocuments([...tableData])
    }
    setValidateRunning(errorOccured ? LoadingState.ERROR : LoadingState.SUCCESS)
  }

  const uploadFiles = async (data: FormData) => {
    for (let i = 0; i < tableData.length; i++) {
      const file = tableData[i]
      if (file.progress !== LoadingState.NEUTRAL) continue
      file.progress = LoadingState.LOADING
      setTableData([...tableData])
      const reader = new FileReader()
      if (file.type === "application/x-gzip") {
        await new Promise((resolve) => {
          reader.readAsArrayBuffer(file.file)
          reader.onload = async () => {
            let res = reader.result
            res = pako.inflate(reader.result as ArrayBuffer, { to: "string" })
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
          () => {
            resolve(true)
          },
          "create_db" + file.name
        )
      })

      file.progress = LoadingState.SUCCESS
      setTableData([...tableData])
    }
  }

  const treeItemSelect = (item: TreeDataItem | undefined) => {
    if (!item || !item.id) return
    if (!session) return
    if (item.type === "REPOSITORY" || item.type === "PROJECT") {
      getDocuments(session, item.id, 1000).then((data) => {
        setDocumentTableData(data.data)
      })
      setSelectedItem(item)
      setValue("repository", item.id.slice(item.id.lastIndexOf("/") + 1))
    }
  }

  const onTreeSubmit = (data: any) => {
    setProject(data.project)
  }

  const onFilterSubmit = async (filterData: any) => {
    const documents = documentTableData.map((entry) => entry.uri) ?? []
    getAccessPermissionsForTargets(session!, documents, "USER").then(
      (access) => {
        setFilterUrls(
          access
            .filter((entry) => entry.authority.uri == filterData.user)
            .map((entry) => entry.object)
        )
      }
    )
  }

  const thing = tableRef.current?.getFilteredSelectedRowModel()

  useEffect(() => {
    setTargets(thing?.rows.map((row) => row.getValue("uri") as string) ?? [])
  }, [session, thing])

  useEffect(() => {
    if (!session) return
    getListUsersCombo(session, "1", "0", "100").then((data) => {
      setUserCombo(data)
    })
  }, [session])

  return (
    <WithAuth>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={15} className="h-[94vh]">
          <Form {...treeForm}>
            <form onSubmit={treeForm.handleSubmit(onTreeSubmit)}>
              <CardContent className="flex">
                <NumberInput
                  control={treeForm.control}
                  name="project"
                  label={"Current Root Project"}
                />
                <Button type="submit" variant="outline" className="mt-12 ml-1">
                  <ReloadIcon />
                </Button>
              </CardContent>
            </form>
          </Form>
          <div className="gap-12">
            <div className="flex min-h-full space-x-2">
              <RepoTree rootProject={project} onSelectChange={treeItemSelect} />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={85} className="mr-3">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={60}>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <Form {...documentFilters}>
                <form
                  onSubmit={documentFilters.handleSubmit(onFilterSubmit)}
                  className="h-[10%] flex ml-4"
                >
                  <ComboboxInput
                    optional
                    control={documentFilters.control}
                    name="user"
                    label="Filter by Entity"
                    groupedOptions={{
                      users: userCombo.map((user) => ({
                        value: user.uri,
                        label: user.name
                      }))
                    }}
                    className="w-[95%]"
                  />
                  <Button
                    variant="outline"
                    type="submit"
                    className="float-right mt-8"
                  >
                    <ReloadIcon />
                  </Button>
                </form>
              </Form>
              <CardContent className="h-[70%]">
                <RepoContextMenu targets={targets} parent={selectedItem?.id}>
                  <DataTable
                    columns={documentColumns}
                    data={
                      filterUrls.length == 0
                        ? documentTableData
                        : documentTableData.filter((entry) =>
                            filterUrls.includes(entry.uri)
                          )
                    }
                    refData={tableRef}
                    onRowSelectionChanged={() => {
                      const newTargets = tableRef.current
                        ?.getFilteredSelectedRowModel()
                        .rows.map((row) => row.getValue("uri") as string)
                      if (!newTargets || sameElements(newTargets, targets))
                        return
                      setTargets(
                        tableRef.current
                          ?.getFilteredSelectedRowModel()
                          .rows.map((row) => row.getValue("uri") as string) ??
                          []
                      )
                    }}
                  >
                    <div className="h-[90%] overflow-scroll">
                      <DataTableContent />
                    </div>
                    <div className="h-[10%] mt-3">
                      <DataTablePagination
                        showRowsSelected
                        pageSizes={[10, 20, 30, 50, 100, 200, 500, 1000]}
                      />
                    </div>
                  </DataTable>
                </RepoContextMenu>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => onOpenValidate()} variant="outline">
                      Validate Files
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <CardHeader>
                      <CardTitle>Validate Files</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[70vh]">
                        <DataTable
                          columns={validateColumns}
                          data={validDocuments}
                        >
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
                      <LoadingButton
                        onClick={() => validateDocuments()}
                        loading={validateRunning}
                      >
                        Validate
                      </LoadingButton>
                    </CardContent>
                  </DialogContent>
                </Dialog>
              </CardContent>
              <CardContent>
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
                        <form onSubmit={handleSubmit(onSubmit)}>
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
                              columns={columns}
                              data={tableData}
                              columnVisibility={columnVisibility}
                              setColumnVisibility={setColumnVisibility}
                            >
                              <div className="max-h-[300px] overflow-scroll">
                                <DataTableContent />
                              </div>
                              <DataTablePagination
                                pageSizes={[
                                  10, 20, 30, 50, 100, 200, 500, 1000
                                ]}
                              />
                            </DataTable>
                          </span>
                          <Button type="submit">Upload</Button>
                        </form>
                      </Form>
                    </CardContent>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </WithAuth>
  )
}
