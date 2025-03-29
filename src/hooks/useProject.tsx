import {
  ResourceProject,
  getProject,
  getProjects
} from "@/lib/resources/repository"
import { useUser } from "@/zustand/useUser"
import { useEffect, useState } from "react"

export const useProjects = () => {
  const [projects, setProjects] = useState<ResourceProject[]>([])
  const { session } = useUser()

  useEffect(() => {
    if (!session) return
    getProjects(session).then((data) => setProjects(data.result))
  }, [session])

  return { projects }
}

export const useProject = (projectId: string) => {
  const [project, setProject] = useState<ResourceProject>()
  const { session } = useUser()

  useEffect(() => {
    if (!session || !projectId) return
    getProject(session, projectId).then((data) => setProject(data.result))
  }, [session, projectId])

  return { project }
}
