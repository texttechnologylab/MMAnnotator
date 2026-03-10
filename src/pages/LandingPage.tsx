import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "../zustand/useUser"

export default function LandingPage() {
  const navigate = useNavigate()
  const { userName, session } = useUser()

  useEffect(() => {
    navigate(userName && session ? "/projects" : "/user", { replace: true })
  }, [userName, session, navigate])

  return null
}
