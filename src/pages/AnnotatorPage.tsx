import { Button, Col, Container, Form, Row } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useUser } from "../zustand/useUser"

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
    <Container>
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Please enter your name to continue</Form.Label>
              <Form.Control
                type="text"
                placeholder="Name"
                {...register("annotator")}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              OK
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}
