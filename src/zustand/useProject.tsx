import { create } from "zustand"

interface ProjectState {
  currentProject: Project | null
  projectList: Project[]
  setCurrentProject: (project: Project) => void
  fetchProjects: (status?: ProjectStatus) => Promise<Project[]>
}

export type ProjectStatus = null | "PREVIEW" | "OPEN" | "CLOSED"

export interface Project {
  key: string
  name: string
  url: string
  description: string
  languages: string[]
  authors: string[]
  status: ProjectStatus
  start_at: string
  end_at: string
  group?: string
}

export const useProjectStore = create<ProjectState>((set, _get) => ({
  currentProject: null,
  projectList: [
    {
      key: "rag_eval_chatbot_images",
      name: "Evaluation",
      url: "projects/37269",
      description: "Evaluation",
      languages: ["de"],
      authors: ["Patrick"],
      status: "OPEN",
      start_at: "2021-06-01T00:00:00Z",
      end_at: "2025-06-30T00:00:00Z"
    }
  ],
  setCurrentProject: (project: Project) => {
    set({ currentProject: project })
  },
  fetchProjects: async () => {
    return []
  }
}))
