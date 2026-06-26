"use client"
import { NumberInput } from "@/components/inputs/CustomInput"
import { ComboboxInput } from "@/components/inputs/ComboBoxInput"
import { DataTable } from "@/components/shadcn/ui/data-table"
import { DataTableContent } from "@/components/shadcn/ui/data-table-content"
import { DataTablePagination } from "@/components/shadcn/ui/data-table-pagination"
import { Form } from "@/components/shadcn/ui/form"
import { CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/shadcn/ui/resizable"
import { RepoContextMenu } from "@/components/RepoContextMenu"
import { RepoTree } from "@/components/RepoTree"
import WithAuth from "@/components/wrappers/WithAuth"
import type { TreeDataItem } from "@/components/shadcn/ui/tree"
import {
  type DocumentData,
  getDocuments,
  type ResourceTargetUri
} from "@/lib/resources/repository"
import {
  getAccessPermissionsForTargets,
  getListUsersCombo,
  type UserCombo
} from "@/lib/resources/permissions"
import { sameElements } from "@/lib/helpers"
import { useUser } from "@/zustand/useUser"
import { ReloadIcon } from "@radix-ui/react-icons"
import type { Table as TableType } from "@tanstack/react-table"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { documentColumns } from "@/components/admin/columns"
import { ValidateFilesDialog } from "@/components/admin/ValidateFilesDialog"
import { UploadFilesDialog } from "@/components/admin/UploadFilesDialog"
import { useLocalStorage } from "usehooks-ts"
import {
  LoadingButton,
  LoadingState
} from "@/components/shadcn/ui/loading-button"

export const UploadPage = () => {
  const { session } = useUser()

  const [project, setProject] = useLocalStorage("upload-project", "0")
  const [selectedItem, setSelectedItem] = useState<TreeDataItem>()
  const [documentTableData, setDocumentTableData] = useState<DocumentData[]>([])
  const [filterUrls, setFilterUrls] = useState<string[]>([])
  const [targets, setTargets] = useState<ResourceTargetUri[]>([])
  const [userCombo, setUserCombo] = useState<UserCombo[]>([])
  const [repoTreeLoading, setRepoTreeLoading] = useState(false)

  const tableRef = useRef<TableType<DocumentData> | undefined>(undefined)

  const treeForm = useForm({ defaultValues: { project: project } })
  const documentFilters = useForm({ defaultValues: { user: "" } })

  const repositoryId = selectedItem?.id
    ? selectedItem.id.slice(selectedItem.id.lastIndexOf("/") + 1)
    : "29614"

  useEffect(() => {
    if (!session) return
    getListUsersCombo(session, "1", "0", "100").then(setUserCombo)
  }, [session])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTargets([])
  }, [session])

  const onTreeSubmit = (data: { project: string }) => setProject(data.project)

  const treeItemSelect = (item: TreeDataItem | undefined) => {
    if (!item?.id || !session) return
    if (item.type === "REPOSITORY" || item.type === "PROJECT") {
      getDocuments(session, item.id, 1000).then((data) =>
        setDocumentTableData(data.data)
      )
      setSelectedItem(item)
    }
  }

  const onFilterSubmit = async (filterData: { user: string }) => {
    const documents = documentTableData.map((entry) => entry.uri)
    const access = await getAccessPermissionsForTargets(
      session!,
      documents,
      "USER"
    )
    setFilterUrls(
      access
        .filter((entry) => entry.authority.uri === filterData.user)
        .map((entry) => entry.object)
    )
  }

  const visibleDocuments =
    filterUrls.length === 0
      ? documentTableData
      : documentTableData.filter((entry) => filterUrls.includes(entry.uri))

  return (
    <WithAuth>
      <ResizablePanelGroup orientation="horizontal">
        {/* ── Left: project tree ─────────────────────────────────── */}
        <ResizablePanel defaultSize={15} className="h-[94vh] flex flex-col">
          <Form {...treeForm}>
            <form onSubmit={treeForm.handleSubmit(onTreeSubmit)}>
              <CardContent className="flex items-end gap-1">
                <NumberInput
                  control={treeForm.control}
                  name="project"
                  label={"Current Root Project"}
                />
                <LoadingButton
                  type="submit"
                  variant="outline"
                  loading={
                    repoTreeLoading
                      ? LoadingState.LOADING
                      : LoadingState.NEUTRAL
                  }
                >
                  <ReloadIcon />
                </LoadingButton>
              </CardContent>
            </form>
          </Form>
          <div className="flex-1 overflow-hidden">
            <RepoTree
              rootProject={project}
              onSelectChange={treeItemSelect}
              onLoadingChange={setRepoTreeLoading}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* ── Right: documents table + actions ───────────────────── */}
        <ResizablePanel defaultSize={85} className="mr-3">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize={60}>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>

              {/* Filter by entity */}
              <Form {...documentFilters}>
                <form
                  onSubmit={documentFilters.handleSubmit(onFilterSubmit)}
                  className="flex items-end gap-1 ml-4"
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
                  <LoadingButton
                    variant="outline"
                    type="submit"
                    loading={
                      documentFilters.formState.isSubmitting
                        ? LoadingState.LOADING
                        : LoadingState.NEUTRAL
                    }
                  >
                    <ReloadIcon />
                  </LoadingButton>
                </form>
              </Form>

              {/* Document table */}
              <CardContent className="h-[70%]">
                <RepoContextMenu targets={targets} parent={selectedItem?.id}>
                  <DataTable
                    columns={documentColumns}
                    data={visibleDocuments}
                    refData={tableRef}
                    onRowSelectionChanged={() => {
                      const newTargets = tableRef.current
                        ?.getFilteredSelectedRowModel()
                        .rows.map(
                          (row) => row.getValue("uri") as ResourceTargetUri
                        )
                      if (!newTargets || sameElements(newTargets, targets))
                        return
                      setTargets(newTargets)
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

                <ValidateFilesDialog tableRef={tableRef} />
              </CardContent>

              <CardContent>
                <UploadFilesDialog
                  documentTableData={documentTableData}
                  repositoryId={repositoryId}
                />
              </CardContent>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </WithAuth>
  )
}
