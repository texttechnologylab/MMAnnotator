import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useUser } from "../zustand/useUser"
import { Button } from "@/components/shadcn/ui/button"
import { Input } from "@/components/shadcn/ui/input"
import { Label } from "@/components/shadcn/ui/label"

interface AnnotatorForm {
  annotator: string | null
}

export default function AnnotatorPage() {
  const { userName, setUserName } = useUser()

  const { register, handleSubmit, setValue } = useForm<AnnotatorForm>({
    defaultValues: { annotator: userName }
  })

  const navigate = useNavigate()

  useEffect(() => {
    setValue("annotator", userName)
  }, [userName, setValue])

  const onSubmit = (data: AnnotatorForm) => {
    setUserName(data.annotator)
    navigate("/projects")
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3 space-y-2">
              <Label>Please enter your name to continue</Label>
              <Input
                type="text"
                placeholder="Name"
                {...register("annotator")}
              />
            </div>
            <Button type="submit">OK</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
