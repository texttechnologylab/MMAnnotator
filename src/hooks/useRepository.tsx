import {
  RepositoryData,
  Response,
  getRepositories
} from "@/lib/resources/repository"
import { useUser } from "@/zustand/useUser"
import { useEffect, useState } from "react"

export const useRepository = (node: string = "root") => {
  const [repositories, setRepositories] = useState<RepositoryData[]>([])
  const { session } = useUser()

  useEffect(() => {
    if (!session) return
    getRepositories(session, node).then((data: Response<RepositoryData>) =>
      setRepositories(data.data)
    )
  }, [session])

  return { repositories }
}
