import { useUser } from "@/zustand/useUser"
import { Tree, TreeDataItem } from "./shadcn/ui/tree"
import { useEffect, useState } from "react"
import {
  ProjectDocument,
  ProjectRepository,
  ResourceProject,
  getProject
} from "@/lib/resources/repository"
import { Folder, FolderDot, Workflow } from "lucide-react"
import { RepoContextMenuTree } from "./RepoContextMenuTree"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getRepoStuff = (
  parentId: string,
  projects: ResourceProject[],
  children: (ProjectRepository | ProjectDocument | string)[]
) => {
  const data: TreeDataItem[] = []

  for (const item of children) {
    if (typeof item === "string") {
      const project = projects.find((p) => p.uri === item)
      if (!project) continue
      const treeDataItem = {
        id: project.uri,
        name: project.name,
        type: "PROJECT" as const,
        icon: FolderDot,
        parent: parentId,
        children: project.children
          ? getRepoStuff(project.uri, projects, project.children)
          : undefined
      }
      data.push(treeDataItem)
      continue
    }
    if (item.type === "DOCUMENT") continue
    const treeDataItem = {
      id: item.uri,
      name: item.name,
      type: item.type,
      parent: parentId,
      children: item.children
        ? getRepoStuff(item.uri, projects, item.children)
        : undefined
    }
    data.push(treeDataItem)
  }
  return data.length > 0 ? data : undefined
}

const getRepoStuffProject = async (
  parentId: string,
  session: string,
  children: (ProjectRepository | ProjectDocument | string)[]
) => {
  const promises: Promise<TreeDataItem | undefined>[] = []

  for (const item of children) {
    if (typeof item === "string") {
      const id = item.split("/").pop()

      // eslint-disable-next-line no-async-promise-executor
      const treeDataItem = (async () => {
        try {
          const project = await getProject(session, id || "")
          if (!project.result) return
          return {
            id: project.result.uri,
            name: project.result.name,
            type: "PROJECT" as const,
            icon: project.result.children ? FolderDot : Workflow,
            parent: parentId,
            children: project.result.children
              ? await getRepoStuffProject(
                  project.result.uri,
                  session,
                  project.result.children
                )
              : undefined
          }
        } catch {
          return {
            id: "ERROR_" + id,
            name: `ERROR Loading Project ${id}`,
            type: "PROJECT" as const,
            icon: Workflow,
            parent: parentId,
            children: undefined
          }
        }
      })()
      promises.push(treeDataItem)

      continue
    }
    if (item.type === "DOCUMENT") continue
    const treeDataItem = {
      id: item.uri,
      name: item.name,
      type: item.type,
      parent: parentId,
      children: item.children
        ? await getRepoStuffProject(item.uri, session, item.children)
        : undefined
    }
    promises.push(Promise.resolve(treeDataItem))
  }
  const data = (await Promise.all(promises)).filter((v) => v != undefined)
  return data.length > 0 ? data : undefined
}
const findItemInTree = (
  id: string,
  data: TreeDataItem[]
): TreeDataItem | undefined => {
  for (const item of data) {
    if (item.id === id) {
      return item
    }
    if (item.children) {
      if (item.children instanceof Promise) {
        continue
      }
      if (!item.children) continue
      const res = findItemInTree(id, item.children)
      if (res) return res
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const findItemInTreeAndUpdate = async (
  id: string,
  data: TreeDataItem[],
  appendChild: TreeDataItem
): Promise<TreeDataItem | undefined> => {
  for (const item of data) {
    if (item.id === id) {
      if (item.children instanceof Promise) {
        item.children = await item.children
      }
      if (!item.children) item.children = []
      item.children.push(appendChild)
      return item
    }
    if (item.children) {
      if (item.children instanceof Promise) {
        item.children = await item.children
      }
      if (!item.children) continue
      const res = findItemInTreeAndUpdate(id, await item.children, appendChild)
      if (res) return res
    }
  }
}

export const RepoTree = ({
  rootProject,
  onSelectChange
}: {
  rootProject: string
  onSelectChange: (item: TreeDataItem | undefined) => void
}) => {
  const { session } = useUser()
  const [treeData, setTreeData] = useState<TreeDataItem[]>([])
  const [selectedItem, setSelectedItem] = useState<TreeDataItem | undefined>()
  useEffect(() => {
    if (!session) return
    updateTreeData("root", true)
  }, [session, rootProject])

  //FIXME: Please rewrite at some point
  const updateTreeData = async (repository: string, reset?: boolean) => {
    if (!session) return
    let newTreeData: TreeDataItem[] = []
    if (!reset) newTreeData = [...treeData]

    const existingItem = findItemInTree(repository, newTreeData)
    if (existingItem) {
      if (existingItem.children === undefined) return
      if (existingItem.children instanceof Promise) return
      if (existingItem.children.length > 0) return
    }

    if (reset) {
      const project = await getProject(session, rootProject)
      if (!project.result) return
      const treeDataItem = {
        id: project.result.uri,
        name: project.result.name,
        type: "PROJECT" as const,
        icon: project.result.children ? FolderDot : Workflow,
        children: project.result.children
          ? getRepoStuffProject(
              project.result.uri,
              session,
              project.result.children
            )
          : undefined
      }
      console.log(treeDataItem)
      newTreeData.push(treeDataItem)
    }

    console.log(newTreeData)
    setTreeData(newTreeData)
    return newTreeData
  }

  const treeItemSelect = (item: TreeDataItem | undefined) => {
    if (!item || !item.id) return
    if (!session) return
    if (item.type === "REPOSITORY" || item.type === "PROJECT") {
      updateTreeData(item.id)
    }
    setSelectedItem(item)
    onSelectChange(item)
  }

  return (
    <RepoContextMenuTree
      targets={() => selectedItem?.id}
      parent={selectedItem?.parent}
      asChild
    >
      <Tree
        data={treeData}
        className="flex-shrink-0 w-[100%] h-[60vh] border-[1px]"
        onSelectChange={treeItemSelect}
        folderIcon={Folder}
        itemIcon={Workflow}
      />
    </RepoContextMenuTree>
  )
}
