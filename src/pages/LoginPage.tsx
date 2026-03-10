import { useForm } from "react-hook-form"
import { useNavigate, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { useUser } from "../zustand/useUser"
import md5 from "md5"
import { loginPublic } from "@/lib/annotator/login"
import { Button } from "@/components/shadcn/ui/button"
import { Input } from "@/components/shadcn/ui/input"
import { Label } from "@/components/shadcn/ui/label"

interface AnnotatorForm {
  userName: string | null
  password: string | null
}

export default function LoginPage() {
  const { userName, update } = useUser()

  const { register, handleSubmit, setValue } = useForm<AnnotatorForm>({
    defaultValues: { userName: userName }
  })

  const navigate = useNavigate()
  const location = useLocation()
  const returnTo =
    (location.state as { returnTo?: string })?.returnTo || "/projects"

  useEffect(() => {
    setValue("userName", userName)
  }, [userName, setValue])

  const onSubmit = async (data: AnnotatorForm) => {
    const session = await loginPublic(data.userName!, md5(data.password!))
    if (!session) {
      return
    }
    update()
    navigate(returnTo, { replace: true })
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3 space-y-2">
              <Label>
                Please login using your <strong>MM-Annotator</strong> account
                credentials to continue:
              </Label>
              <Input
                type="text"
                placeholder="Username"
                required
                {...register("userName")}
              />
              <Input
                type="password"
                placeholder="Password"
                required
                {...register("password")}
              />
            </div>
            <Button type="submit">Login</Button>
          </form>
          <div className="text-muted-foreground mt-2">
            <small>
              If you don't have an account yet, or can't login, please contact
              the TTLab.
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}
