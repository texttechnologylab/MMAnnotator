import { Badge, Button, Card, Col, Container, Row } from "react-bootstrap"
import { useProjectStore } from "../zustand/useProject"
import { projectStatusColor } from "../lib/helpers"
import { useNavigate } from "react-router-dom"

export default function ProjectsPage() {
  const { projectList, setCurrentProject } = useProjectStore()

  const navigate = useNavigate()

  return (
    <Container>
      <Row className="justify-content-md-center">
        {projectList.map((task, index) => {
          return (
            <Col md={4} className={"mb-4"} key={"projects-big-list-" + index}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {task.name}
                    <Badge
                      className={"float-end"}
                      bg={projectStatusColor(task.status)}
                    >
                      {task.status}
                    </Badge>
                  </Card.Title>
                  <Card.Text>{task.description}</Card.Text>
                  <br />
                  <Button
                    variant={"primary"}
                    onClick={() => {
                      setCurrentProject(task)
                      navigate(`/${task.url}`)
                    }}
                  >
                    Select
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          )
        })}
      </Row>
    </Container>
  )
}
