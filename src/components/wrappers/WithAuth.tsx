import { ReactElement, useEffect } from "react"
import { useUser } from "../../zustand/useUser"
import { useNavigate } from "react-router-dom"
import { checkLogin } from "@/lib/annotator/login"

export default function WithAuth({
  children
}: {
  children: ReactElement[] | ReactElement
}) {
  const { userName, session } = useUser()
  const navigate = useNavigate()
  useEffect(() => {
    if (!session) navigate("/user")
    checkLogin().then((valid) => {
      if (!valid) navigate("/user")
    })
  }, [userName, navigate, session])

  return <>{userName && { ...children }}</>
}
