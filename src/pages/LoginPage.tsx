import { Button, Col, Container, Form, Row } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useUser } from "../zustand/useUser"
import md5 from "md5"
import { loginPublic } from "@/lib/annotator/login"
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

  useEffect(() => {
    setValue("userName", userName)
  }, [userName, setValue])

  const onSubmit = async (data: AnnotatorForm) => {
    const session = await loginPublic(data.userName!, md5(data.password!))
    if (!session) {
      return
    }
    update()
    navigate("/projects")
  }

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label className={"mb-2"}>
                Please login using your <strong>MM-Annotator</strong> account
                credentials to continue:
              </Form.Label>
              <Form.Control
                type="text"
                className={"mb-2"}
                placeholder="Username"
                required
                {...register("userName")}
              />
              <Form.Control
                type="password"
                placeholder="Password"
                required
                {...register("password")}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Login
            </Button>
          </Form>
          <div className="text-muted mt-2">
            <small>
              If you don't have an account yet, or can't login, please contact
              the TTLab.
            </small>
          </div>
        </Col>
      </Row>
    </Container>
  )
}
