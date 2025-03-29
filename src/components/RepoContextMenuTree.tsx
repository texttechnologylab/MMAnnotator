import { ReactNode, useEffect, useState } from "react"
import { ComboboxInputMult } from "./inputs/ComboBoxInput"
import { SelectInput } from "./inputs/SelectInput"
import { InputLabel } from "./inputs/common"
import { Button } from "./shadcn/ui/button"
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
  AccessResponse,
  GroupCombo,
  UserCombo,
  getListAccessPermissions,
  getListGroupsCombo,
  getListUsersCombo,
  setAccessPermissions
} from "@/lib/resources/permissions"
import {
  createProject,
  createRepository,
  deleteItem,
  deleteRepository
} from "@/lib/resources/repository"
import { TextInput } from "./inputs/CustomInput"
import { toast } from "sonner"
import { DataTable } from "./shadcn/ui/data-table"
import { DataTableContent } from "./shadcn/ui/data-table-content"
import { CheckBoxInput } from "./inputs/CheckBoxInput"

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

//TODO: Extract common code with RepoContextMenu and make more modular
export const RepoContextMenuTree = ({
  asChild,
  targets,
  parent,
  children
}: {
  asChild?: boolean
  targets?: () => string | undefined
  parent?: string
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

  const permissionForm = useForm<PermissionForm>({
    defaultValues: {
      user: [],
      permission: "",
      recursive: false
    }
  })

  const createRepoForm = useForm({
    defaultValues: {
      name: "",
      parent: targets ? targets() || "" : ""
    }
  })

  const createProjectForm = useForm({
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
    else response = await deleteRepository(session, targetsString, parent)

    if (response.success) toast.success("Item deleted successfully")
    else toast.error("Failed to delete item")
  }

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

  const onCreateRepoSubmit = async (data: any) => {
    if (!session || !userUri) return
    if (!targets || !targets()) return
    const response = await createRepository(session, data.name, targets()!)
    if (response.success && response.result.length > 0) {
      const accessResponse = await setAccessPermissions(
        session,
        response.result[0].uri,
        userUri,
        "4",
        false
      )
      if (accessResponse.success) toast.success("Repo created successfully")
      else toast.error("Failed to set permissions")
    } else toast.error("Failed to create repo")
  }

  const onCreateProjectSubmit = async (data: any) => {
    if (!session) return
    if (!targets || !targets()) return
    const targetsString = targets()
    if (!targetsString?.includes("project")) return

    const response = await createProject(
      session,
      data.name,
      data.description,
      targetsString.slice(targetsString.lastIndexOf("/") + 1),
      data.frontend,
      data.key
    )
    if (response.success) toast.success("Project created successfully")
    else toast.error("Failed to create project")
  }

  const isTargetRepo = targets && targets()?.includes("repository")

  return (
    <Dialog>
      <ContextMenu>
        <ContextMenuTrigger asChild={asChild}>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <DialogTrigger>
            <ContextMenuItem onClick={() => setSelectedTab("permissions")}>
              Update Permissions
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setSelectedTab("create")}>
              {isTargetRepo ? "Create Repository" : "Create Project/Repository"}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setSelectedTab("delete")}>
              Delete
            </ContextMenuItem>
          </DialogTrigger>
        </ContextMenuContent>
      </ContextMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Interaction</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="flex">
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="create">Create Repository/Project</TabsTrigger>
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
                      <InputLabel label="Recursive" />
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
                    <div className="h-[100%] overflow-scroll">
                      <DataTableContent />
                    </div>
                  </DataTable>
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="create">
            <Tabs defaultValue={"repository"}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="repository">Repository</TabsTrigger>
                <TabsTrigger disabled={isTargetRepo} value="project">
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
                      <Button type="submit">Create Repository</Button>
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
                      <Button type="submit">Create Project</Button>
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
                <Button onClick={() => onDelete()} type="button">
                  Delete items
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
