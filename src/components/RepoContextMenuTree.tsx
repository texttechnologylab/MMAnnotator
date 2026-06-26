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
  type AccessResponse,
  type GroupCombo,
  type UserCombo,
  getListAccessPermissions,
  getListGroupsCombo,
  getListUsersCombo,
  setAccessPermissions
} from "@/lib/resources/permissions"
import {
  createProject,
  createRepository,
  deleteItem,
  deleteProject,
  deleteRepository,
  getResourceTargetId,
  getResourceTargetKind,
  type ResourceTargetUri
} from "@/lib/resources/repository"
import { TextInput } from "./inputs/CustomInput"
import { toast } from "sonner"
import { DataTable } from "./shadcn/ui/data-table"
import { DataTableContent } from "./shadcn/ui/data-table-content"
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

export const RepoContextMenuTree = ({
  asChild,
  targets,
  parent,
  onNodeCreated,
  onNodeDeleted,
  onNodeRefreshRequested,
  onTreeRefreshRequested,
  children
}: {
  asChild?: boolean
  targets?: () => ResourceTargetUri | undefined
  parent?: ResourceTargetUri
  onNodeCreated?: (node: {
    id: ResourceTargetUri
    name: string
    type: "REPOSITORY" | "PROJECT"
    parentId: ResourceTargetUri
  }) => void
  onNodeDeleted?: (nodeId: ResourceTargetUri) => void
  onNodeRefreshRequested?: (nodeId: ResourceTargetUri) => Promise<void> | void
  onTreeRefreshRequested?: () => void
  children?: ReactNode
}) => {
  const { session, userUri } = useUser()
  const [userCombo, setUserCombo] = useState<UserCombo[]>([])

  const [groupCombo, setGroupCombo] = useState<GroupCombo[]>([])
  const [selectedTab, setSelectedTab] = useState<string>("permissions")

  const [access, setAccess] = useState<AccessResponse>()

  interface PermissionForm {
    user: string[]
    permission: string
    recursive: boolean
  }

  interface CreateRepositoryForm {
    name: string
    parent: string
  }

  interface CreateProjectForm {
    session: string
    name: string
    description: string
    parent: string
    frontend: string
    key: string
  }

  const permissionForm = useForm<PermissionForm>({
    defaultValues: {
      user: [],
      permission: "",
      recursive: false
    }
  })

  const createRepoForm = useForm<CreateRepositoryForm>({
    defaultValues: {
      name: "",
      parent: targets ? targets() || "" : ""
    }
  })

  const createProjectForm = useForm<CreateProjectForm>({
    defaultValues: {
      session: "",
      name: "",
      description: "",
      parent: targets ? targets() || "" : "",
      frontend: "",
      key: ""
    }
  })

  useEffect(() => {
    if (!session) return
    if (!targets) return
    getListAccessPermissions(
      session,
      targets() || "",
      "USER",
      "0",
      "0",
      "100"
    ).then((data) => {
      setAccess(data)
    })
  }, [session, targets])

  useEffect(() => {
    if (!session) return
    getListUsersCombo(session, "1", "0", "100").then((data) => {
      setUserCombo(data)
    })
    getListGroupsCombo(session, "1", "0", "100").then((data) => {
      setGroupCombo(data)
    })
  }, [session])

  const onDelete = async () => {
    if (!session || !parent) return
    if (!targets) return
    const targetsString = targets()
    if (!targetsString) return
    let response = null
    if (targetsString.includes("document"))
      response = await deleteItem(session, targetsString, parent)
    else if (targetsString.includes("repository"))
      response = await deleteRepository(session, targetsString, parent)
    else response = await deleteProject(session, targetsString, parent)

    if (response.success) {
      onNodeDeleted?.(targetsString)
      onTreeRefreshRequested?.()
      toast.success("Item deleted successfully")
      return
    }

    toast.error("Failed to delete item")
    throw new Error("Failed to delete item")
  }

  const { run: runDelete, loading: deleteLoading } = useLoadingAction(onDelete)

  const { run: runRefresh, loading: refreshLoading } = useLoadingAction(
    async () => {
      const nodeId = targets?.()
      if (!nodeId) return
      await onNodeRefreshRequested?.(nodeId)
      onTreeRefreshRequested?.()
    }
  )

  const onPermissionSubmit = async (data: PermissionForm) => {
    if (!session) return
    if (!targets || !targets()) return
    const promises = []
    for (const user of data.user) {
      promises.push(
        setAccessPermissions(
          session,
          targets()!,
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

  const onCreateRepoSubmit = async (data: CreateRepositoryForm) => {
    if (!session || !userUri) return
    if (!targets || !targets()) return
    const parentId = targets()
    if (!parentId) return

    const response = await createRepository(session, data.name, parentId)
    if (response.success && response.result.length > 0) {
      const createdRepository = response.result[0]
      if (createdRepository?.uri) {
        onNodeCreated?.({
          id: createdRepository.uri,
          name: createdRepository.name || data.name,
          type: "REPOSITORY",
          parentId
        })
      }

      const accessResponse = await setAccessPermissions(
        session,
        response.result[0].uri,
        userUri,
        "4",
        false
      )
      if (accessResponse.success) toast.success("Repo created successfully")
      else toast.error("Failed to set permissions")

      onTreeRefreshRequested?.()
    } else toast.error("Failed to create repo")
  }

  const onCreateProjectSubmit = async (data: CreateProjectForm) => {
    if (!session) return
    if (!targets || !targets()) return
    const targetsString = targets()
    if (!targetsString) return
    if (getResourceTargetKind(targetsString) !== "project") return

    const response = await createProject(
      session,
      data.name,
      data.description,
      getResourceTargetId(targetsString),
      data.frontend,
      data.key
    )
    if (response.success) {
      const createdProject = Array.isArray(response.result)
        ? response.result[0]
        : response.result

      if (createdProject?.uri) {
        onNodeCreated?.({
          id: createdProject.uri,
          name: createdProject.name || data.name,
          type: "PROJECT",
          parentId: targetsString
        })
      }
      onTreeRefreshRequested?.()
      toast.success("Project created successfully")
    } else toast.error("Failed to create project")
  }

  const isTargetRepoAndNotRoot = targets && targets()?.includes("repository")

  return (
    <Dialog>
      <ContextMenu>
        <ContextMenuTrigger asChild={asChild}>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            disabled={!targets?.() || refreshLoading === LoadingState.LOADING}
            onClick={() => void runRefresh()}
          >
            Refresh
          </ContextMenuItem>
          <DialogTrigger asChild>
            <ContextMenuItem onClick={() => setSelectedTab("permissions")}>
              Update Permissions
            </ContextMenuItem>
          </DialogTrigger>
          <DialogTrigger asChild>
            <ContextMenuItem onClick={() => setSelectedTab("create")}>
              {isTargetRepoAndNotRoot
                ? "Create Repository"
                : "Create Project/Repository"}
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
          <DialogTitle>Interaction</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="flex">
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="create">
              {isTargetRepoAndNotRoot
                ? "Create Repository"
                : "Create Project/Repository"}
            </TabsTrigger>
            <TabsTrigger value="delete">Delete</TabsTrigger>
          </TabsList>
          <TabsContent value="permissions">
            <Form {...permissionForm}>
              <form onSubmit={permissionForm.handleSubmit(onPermissionSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <div className="space-y-1 mt-3">
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
                    <div className="flex items-center space-x-2 mt-10">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Recursive
                      </label>
                      <CheckBoxInput
                        control={permissionForm.control}
                        name="recursive"
                      />
                    </div>
                  </div>
                </div>
                <div className="h-[400px]">
                  <DataTable
                    columns={accessColumns}
                    data={
                      access
                        ? access.access?.sort((a, b) => b.level - a.level)
                        : []
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
          <TabsContent value="create">
            <Tabs defaultValue={"repository"}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="repository">Repository</TabsTrigger>
                <TabsTrigger disabled={isTargetRepoAndNotRoot} value="project">
                  Project
                </TabsTrigger>
              </TabsList>
              <TabsContent value="repository">
                <Form {...createRepoForm}>
                  <form
                    onSubmit={createRepoForm.handleSubmit(onCreateRepoSubmit)}
                  >
                    <div className="grid gap-4 py-4">
                      <div className="space-y-1">
                        <TextInput
                          name="name"
                          label="Name"
                          control={createRepoForm.control}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <LoadingButton
                        type="submit"
                        loading={
                          createRepoForm.formState.isSubmitting
                            ? LoadingState.LOADING
                            : LoadingState.NEUTRAL
                        }
                      >
                        Create Repository
                      </LoadingButton>
                    </DialogFooter>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="project">
                <Form {...createProjectForm}>
                  <form
                    onSubmit={createProjectForm.handleSubmit(
                      onCreateProjectSubmit
                    )}
                  >
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <TextInput
                          name="name"
                          label="Name"
                          control={createProjectForm.control}
                        />

                        <TextInput
                          name="description"
                          label="Description"
                          control={createProjectForm.control}
                        />

                        <TextInput
                          name="frontend"
                          label="Frontend"
                          control={createProjectForm.control}
                        />

                        <TextInput
                          name="key"
                          label="Key"
                          control={createProjectForm.control}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <LoadingButton
                        type="submit"
                        loading={
                          createProjectForm.formState.isSubmitting
                            ? LoadingState.LOADING
                            : LoadingState.NEUTRAL
                        }
                      >
                        Create Project
                      </LoadingButton>
                    </DialogFooter>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
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
