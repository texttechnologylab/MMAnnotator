import { type ReactNode, useEffect, useState } from "react"
import { ComboboxInputMult } from "./inputs/ComboBoxInput"
import { SelectInput } from "./inputs/SelectInput"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from "./shadcn/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./shadcn/ui/dialog"
import { Form } from "./shadcn/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./shadcn/ui/tabs"
import { useUser } from "@/zustand/useUser"
import { useForm } from "react-hook-form"
import {
  type AccessPermission,
  type GroupCombo,
  type UserCombo,
  getAccessPermissionsForTargets,
  getListGroupsCombo,
  getListUsersCombo,
  setAccessPermissionsForTargets
} from "@/lib/resources/permissions"
import { deleteItem, type ResourceTargetUri } from "@/lib/resources/repository"
import { DataTable } from "./shadcn/ui/data-table"
import { DataTableContent } from "./shadcn/ui/data-table-content"
import { toast } from "sonner"
import { chunkArray } from "@/lib/helpers"
import { CheckBoxInput } from "./inputs/CheckBoxInput"
import { LoadingButton, LoadingState } from "./shadcn/ui/loading-button"
import { useLoadingAction } from "../hooks/useLoadingAction"

const accessColumns = [
  {
    header: "Entity",
    accessorKey: "authority.label"
  },
  {
    header: "Permission",
    accessorKey: "level"
  }
]

export const RepoContextMenu = ({
  asChild,
  targets,
  parent,
  children
}: {
  asChild?: boolean
  targets?: ResourceTargetUri[]
  parent?: ResourceTargetUri
  children?: ReactNode
}) => {
  const { session } = useUser()
  const [userCombo, setUserCombo] = useState<UserCombo[]>([])

  const [groupCombo, setGroupCombo] = useState<GroupCombo[]>([])
  const [selectedTab, setSelectedTab] = useState<string>("permissions")

  const [access, setAccess] = useState<AccessPermission[]>()

  interface PermissionForm {
    user: string[]
    permission: string
    recursive: boolean
    spreadEvenly: boolean
  }

  const permissionForm = useForm<PermissionForm>({
    defaultValues: {
      user: [],
      permission: "",
      recursive: false,
      spreadEvenly: false
    }
  })

  useEffect(() => {
    if (!session) return
    getListUsersCombo(session, "1", "0", "100").then((data) => {
      setUserCombo(data)
    })
    getListGroupsCombo(session, "1", "0", "100").then((data) => {
      setGroupCombo(data)
    })
  }, [session])

  useEffect(() => {
    if (!session) return
    if (!targets || targets?.length == 0) return
    getAccessPermissionsForTargets(session, targets, "USER").then((data) => {
      setAccess(data)
    })
  }, [session, targets])

  const onDelete = async () => {
    if (!session || !parent) return
    if (!targets || targets?.length == 0) return

    const response = await deleteItem(session, targets, parent)
    if (response.success) toast.success("Item deleted successfully")
    else toast.error("Failed to delete item")
  }

  const { run: runDelete, loading: deleteLoading } = useLoadingAction(onDelete)

  const onPermissionSubmit = async (data: PermissionForm) => {
    if (!session) return
    if (!targets || targets?.length == 0) return
    let chunks: ResourceTargetUri[][] = []

    if (data.spreadEvenly) {
      chunks = chunkArray(targets, targets.length / data.user.length)
    }

    const promises = []
    for (const userIndex in data.user) {
      const user = data.user[userIndex]
      console.log(user, chunks[userIndex])
      promises.push(
        setAccessPermissionsForTargets(
          session,
          data.spreadEvenly ? chunks[userIndex] : targets,
          user,
          data.permission,
          data.recursive
        )
      )
    }
    const responses = await Promise.all(promises)
    if (responses.some((response) => !response.success)) {
      toast.error("Failed to update permissions")
      return
    }
    toast.success("Permissions updated successfully")
  }

  return (
    <Dialog>
      <ContextMenu>
        <ContextMenuTrigger asChild={asChild}>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <DialogTrigger asChild>
            <ContextMenuItem onClick={() => setSelectedTab("permissions")}>
              Update Permissions
            </ContextMenuItem>
          </DialogTrigger>
          <DialogTrigger asChild>
            <ContextMenuItem onClick={() => setSelectedTab("delete")}>
              Delete
            </ContextMenuItem>
          </DialogTrigger>
        </ContextMenuContent>
      </ContextMenu>
      <DialogContent className="sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Update permissions</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="flex">
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="delete">Delete</TabsTrigger>
          </TabsList>
          <TabsContent value="permissions">
            <Form {...permissionForm}>
              <form onSubmit={permissionForm.handleSubmit(onPermissionSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <div className="space-y-1">
                      <ComboboxInputMult
                        control={permissionForm.control}
                        name="user"
                        label="Entity"
                        groupedOptions={{
                          users: userCombo.map((user) => ({
                            value: user.uri,
                            label: user.name
                          })),
                          groups: groupCombo.map((group) => ({
                            value: group.uri,
                            label: group.name
                          }))
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <SelectInput
                        control={permissionForm.control}
                        name="permission"
                        label="Permission"
                        options={[
                          { value: "0", label: "None" },
                          { value: "1", label: "Read" },
                          { value: "2", label: "Write" },
                          { value: "3", label: "Delete" },
                          { value: "4", label: "Grant" }
                        ]}
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-5">
                      <label className="text-sm font-medium leading-none">
                        Recursive
                      </label>
                      <CheckBoxInput
                        control={permissionForm.control}
                        name="recursive"
                      />
                      <label
                        className="text-sm font-medium leading-none"
                        title="Divides the documents selected equally (or as close as possible) among the users selected in the dropdown."
                      >
                        Spread Evenly
                      </label>
                      <CheckBoxInput
                        control={permissionForm.control}
                        name="spreadEvenly"
                      />
                    </div>
                  </div>
                </div>
                <div className="h-[400px]">
                  <DataTable
                    columns={accessColumns}
                    data={
                      access ? access.sort((a, b) => b.level - a.level) : []
                    }
                  >
                    <div className="h-full overflow-scroll">
                      <DataTableContent />
                    </div>
                  </DataTable>
                </div>
                <DialogFooter>
                  <LoadingButton
                    type="submit"
                    loading={
                      permissionForm.formState.isSubmitting
                        ? LoadingState.LOADING
                        : LoadingState.NEUTRAL
                    }
                  >
                    Save changes
                  </LoadingButton>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="delete">
            <form>
              <div className="grid gap-4 py-4">
                <div className="text-center">
                  <b>This action can not be undone!</b>
                </div>
              </div>
              <DialogFooter>
                <LoadingButton
                  onClick={() => void runDelete()}
                  type="button"
                  loading={deleteLoading}
                >
                  Delete items
                </LoadingButton>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
