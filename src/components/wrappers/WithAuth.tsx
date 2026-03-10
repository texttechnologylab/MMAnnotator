import { type ReactElement, useEffect } from "react"
import { useUser } from "../../zustand/useUser"
import { useNavigate, useLocation } from "react-router-dom"
import { checkLogin } from "@/lib/annotator/login"

export default function WithAuth({
  children
}: {
  children: ReactElement[] | ReactElement
}) {
  const { userName, session } = useUser()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const redirectToLogin = () =>
      navigate("/user", {
        state: { returnTo: location.pathname + location.search }
      })

    if (!session) {
      redirectToLogin()
      return
    }
    checkLogin().then((valid) => {
      if (!valid) redirectToLogin()
    })
  }, [userName, navigate, session, location])

  return <>{userName && { ...children }}</>
}
