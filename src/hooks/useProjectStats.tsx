import { useANNO } from "@/lib/annotator/AnnoLib"
import { useDocumentStore } from "@/zustand/useDocument"
import { ProjectStatsReturn, useProjectStore } from "@/zustand/useProjectStats"
import { useUser } from "@/zustand/useUser"
import { useEffect } from "react"

import { createViewFromUserName } from "@/lib/helpers"
import {
  ProjectDocument,
  ProjectRepository,
  ResourceProject
} from "@/lib/resources/repository"

// TODO: Force update vs. use Cache
export const useProjectStats = (
  projectId: string | null,
  minAccessLevel?: number
) => {
  // open Project stats
  const { openProjectStats, annoSocketPromise } = useANNO()
  const { subscribeToWebSocket } = useDocumentStore()
  const { userName } = useUser()

  const {
    setCompleted,
    setRaw,
    setProjectDocuments,
    completed: completedStore,
    raw: rawStore,
    projectDocuments: projectDocumentsStore
  } = useProjectStore()

  const getDocument = async () => {
    if (!userName || !projectId) return
    await annoSocketPromise
    openProjectStats(projectId, createViewFromUserName(userName))
  }

  const onProjectStats = (msg: ProjectStatsReturn) => {
    if (!userName || !projectId) return
    // Make sure we only "listen" to the correct response we care about
    if (
      msg.project_data.success &&
      msg.project_data.result.id !== Number(projectId)
    )
      return
    setRaw(projectId, msg)
    const stats = msg.stats.personal
    const completed: string[] = []
    for (const [document, viewStats] of Object.entries(stats)) {
      if (createViewFromUserName(userName) in viewStats)
        completed.push(document)
    }
    setCompleted(projectId, completed)
    if (msg.project_data.success)
      setProjectDocuments(
        projectId,
        getProjectDocuments(msg.project_data.result, minAccessLevel)
      )
  }

  useEffect(() => {
    getDocument()
    subscribeToWebSocket("list_project_stats", onProjectStats, "stats")
  }, [projectId, annoSocketPromise])

  // FIXME:
  const completed =
    projectId && projectId in completedStore
      ? completedStore[projectId] ?? []
      : []
  const raw =
    projectId && projectId in rawStore ? rawStore[projectId] ?? null : null
  const projectDocuments =
    projectId && projectId in projectDocumentsStore
      ? projectDocumentsStore[projectId] ?? []
      : []

  return { completed, raw, projectDocuments }
}

const getProjectDocuments = (
  project: ResourceProject,
  minAccessLevel: number = 0
) => {
  const documents: ProjectDocument[] = []
  const getDocuments = (
    project: ProjectRepository | ProjectDocument | ResourceProject
  ) => {
    if ("children" in project) {
      project.children.forEach((child) =>
        typeof child !== "string" ? getDocuments(child) : null
      )
    } else if (
      project.type === "DOCUMENT" &&
      project.access >= minAccessLevel
    ) {
      documents.push(project)
    }
  }
  getDocuments(project)
  return documents
}
