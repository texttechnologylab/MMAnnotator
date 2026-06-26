import { getProjects, type ResourceProject } from "@/lib/resources/repository"
import { create } from "zustand"

interface ProjectState {
  currentProject: ResourceProject | null
  projectList: ResourceProject[]
  setCurrentProject: (project: ResourceProject) => void
  fetchProjects: (session: string, depth?: number) => Promise<ResourceProject[]>
}

export type ProjectStatus = null | "PREVIEW" | "OPEN" | "CLOSED"

export const useProjectStore = create<ProjectState>((set, _get) => ({
  currentProject: null,
  projectList: [],
  setCurrentProject: (project: ResourceProject) => {
    set({ currentProject: project })
  },
  fetchProjects: async (session: string, depth?: number) => {
    return getProjects(session, depth).then((response) => {
      if (response.result) {
        set({ projectList: response.result })
        return response.result
      }
      return []
    })
  }
}))
