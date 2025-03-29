import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Container } from "react-bootstrap"
import { useUser } from "../zustand/useUser"

export default function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userName, session } = useUser()

  // This is not a good way to do this but it works for now
  useEffect(() => {
    if (location.pathname !== "/") return
    if (!userName || !session) navigate("/user")
    else if (userName) navigate("/projects")
  }, [userName, navigate, location, session])

  return <Container></Container>
}
