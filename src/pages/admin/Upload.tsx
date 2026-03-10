"use client"
import { NumberInput } from "@/components/inputs/CustomInput"
import { ComboboxInput } from "@/components/inputs/ComboBoxInput"
import { Button } from "@/components/shadcn/ui/button"
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
import { type DocumentData, getDocuments } from "@/lib/resources/repository"
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

export const UploadPage = () => {
  const { session } = useUser()

  const [project, setProject] = useState<string>("30438")
  const [selectedItem, setSelectedItem] = useState<TreeDataItem>()
  const [documentTableData, setDocumentTableData] = useState<DocumentData[]>([])
  const [filterUrls, setFilterUrls] = useState<string[]>([])
  const [targets, setTargets] = useState<string[]>([])
  const [userCombo, setUserCombo] = useState<UserCombo[]>([])

  const tableRef = useRef<TableType<DocumentData>>()

  const treeForm = useForm({ defaultValues: { project: "30438" } })
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

  const onTreeSubmit = (data: any) => setProject(data.project)

  const treeItemSelect = (item: TreeDataItem | undefined) => {
    if (!item?.id || !session) return
    if (item.type === "REPOSITORY" || item.type === "PROJECT") {
      getDocuments(session, item.id, 1000).then((data) =>
        setDocumentTableData(data.data)
      )
      setSelectedItem(item)
    }
  }

  const onFilterSubmit = async (filterData: any) => {
    const documents = documentTableData.map((entry) => entry.uri)
    getAccessPermissionsForTargets(session!, documents, "USER").then(
      (access) => {
        setFilterUrls(
          access
            .filter((entry) => entry.authority.uri === filterData.user)
            .map((entry) => entry.object)
        )
      }
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
                <Button type="submit" variant="outline">
                  <ReloadIcon />
                </Button>
              </CardContent>
            </form>
          </Form>
          <div className="flex-1 overflow-hidden">
            <RepoTree rootProject={project} onSelectChange={treeItemSelect} />
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
                  <Button variant="outline" type="submit">
                    <ReloadIcon />
                  </Button>
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
                        .rows.map((row) => row.getValue("uri") as string)
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
