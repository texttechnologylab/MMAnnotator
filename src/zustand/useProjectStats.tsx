import { ProjectDocument, ResourceProject } from "@/lib/resources/repository"
import { create } from "zustand"

export interface ProjectStats {
  raw: Record<string, ProjectStatsReturn | null>
  completed: Record<string, string[]>
  projectDocuments: Record<string, ProjectDocument[]>
  setRaw: (projectId: string, raw: ProjectStatsReturn) => void
  setCompleted: (projectId: string, completed: string[]) => void
  setProjectDocuments: (projectId: string, document: ProjectDocument[]) => void
}

export interface ProjectStatsReturn {
  stats: {
    personal: {
      [document: string]: {
        [view: string]: {
          [type: string]: {
            [userId: string]: number
          }
        }
      }
    }
    admin: {
      [document: string]: {
        [view: string]: {
          [type: string]: {
            [userId: string]: number
          }
        }
      }
    }
  }
  project_data:
    | {
        result: ResourceProject
        success: true
      }
    | {
        success: false
        message: string
      }
}

export const useProjectStore = create<ProjectStats>((set) => ({
  raw: {},
  completed: {},
  projectDocuments: {},
  setRaw: (projectId, raw) =>
    set((state) => ({ raw: { ...state.raw, [projectId]: raw } })),
  setCompleted: (projectId, completed) =>
    set((state) => ({
      completed: { ...state.completed, [projectId]: completed }
    })),
  setProjectDocuments: (projectId, document) =>
    set((state) => ({
      projectDocuments: { ...state.projectDocuments, [projectId]: document }
    }))
}))
