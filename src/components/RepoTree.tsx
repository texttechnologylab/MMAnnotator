import { useUser } from "@/zustand/useUser"
import { Tree, type TreeDataItem } from "./shadcn/ui/tree"
import { useEffect, useState } from "react"
import {
  type ProjectDocument,
  type ProjectRepository,
  getProject
} from "@/lib/resources/repository"
import { Folder, FolderDot, Workflow } from "lucide-react"
import { RepoContextMenuTree } from "./RepoContextMenuTree"

/**
 * Builds an array of tree items where each sub-project is a
 * Promise<TreeDataItem> (loads independently), and repositories
 * are synchronous TreeDataItem entries.
 */
const buildChildren = (
  parent: TreeDataItem,
  session: string,
  children: (ProjectRepository | ProjectDocument | string)[]
): (TreeDataItem | Promise<TreeDataItem>)[] => {
  const items: (TreeDataItem | Promise<TreeDataItem>)[] = []

  for (const child of children) {
    // Sub-project reference (string URI) → async load
    if (typeof child === "string") {
      const id = child.split("/").pop()
      const promise = (async (): Promise<TreeDataItem> => {
        try {
          const project = await getProject(session, id || "")
          if (!project.result) {
            return {
              id: "EMPTY_" + id,
              name: `Empty Project ${id}`,
              type: "PROJECT" as const,
              icon: Workflow,
              parent
            }
          }

          const treeItem: TreeDataItem = {
            id: project.result.uri,
            name: project.result.name,
            type: project.result.type,
            icon: project.result.type == "PROJECT" ? FolderDot : Workflow,
            parent
          }

          treeItem.children =
            project.result.type == "PROJECT"
              ? buildChildren(treeItem, session, project.result.children)
              : undefined
          return treeItem
        } catch {
          return {
            id: "ERROR_" + id,
            name: `ERROR Loading Project ${id}`,
            type: "PROJECT" as const,
            icon: Workflow,
            parent,
            children: undefined
          }
        }
      })()
      items.push(promise)
      continue
    }

    // Skip documents
    if (child.type === "DOCUMENT") continue

    // Repository → synchronous
    const treeItem: TreeDataItem = {
      id: child.uri,
      name: child.name,
      type: child.type,
      parent
    }
    treeItem.children = child.children
      ? buildChildren(treeItem, session, child.children)
      : undefined
    items.push(treeItem)
  }

  return items
}
const findItemInTree = (
  id: string,
  data: (TreeDataItem | Promise<TreeDataItem>)[]
): TreeDataItem | undefined => {
  for (const item of data) {
    if (item instanceof Promise) continue
    if (item.id === id) return item
    if (item.children) {
      const res = findItemInTree(id, item.children)
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
  const [treeData, setTreeData] = useState<
    (TreeDataItem | Promise<TreeDataItem>)[]
  >([])
  const [selectedItem, setSelectedItem] = useState<TreeDataItem | undefined>()

  const updateTreeData = async (repository: string, reset?: boolean) => {
    if (!session) return
    let newTreeData: (TreeDataItem | Promise<TreeDataItem>)[] = []
    if (!reset) newTreeData = [...treeData]

    const existingItem = findItemInTree(repository, newTreeData)
    if (existingItem) {
      if (existingItem.children === undefined) return
      if (existingItem.children.length > 0) return
    }

    if (reset) {
      const project = await getProject(session, rootProject)
      if (!project.result) return
      const treeDataItem: TreeDataItem = {
        id: project.result.uri,
        name: project.result.name,
        type: project.result.type,
        icon: project.result.type == "PROJECT" ? FolderDot : Workflow
      }

      treeDataItem.children =
        project.result.type == "PROJECT"
          ? buildChildren(treeDataItem, session, project.result.children)
          : undefined
      newTreeData.push(treeDataItem)
    }

    setTreeData(newTreeData)
    return newTreeData
  }

  useEffect(() => {
    if (!session) return
    // eslint-disable-next-line
    updateTreeData("root", true)
  }, [session, rootProject])

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
      parent={selectedItem?.parent?.id}
      asChild
    >
      <Tree
        data={treeData}
        className="w-full h-full border"
        onSelectChange={treeItemSelect}
        folderIcon={Folder}
        itemIcon={Workflow}
      />
    </RepoContextMenuTree>
  )
}
