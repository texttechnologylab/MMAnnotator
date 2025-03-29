import { useLocation } from "react-router-dom"

export const useProjectId = () => {
  const { pathname } = useLocation()
  const match = pathname.match(/projects\/([^/]+)/)
  return { projectId: match ? match[1] : null }
}
