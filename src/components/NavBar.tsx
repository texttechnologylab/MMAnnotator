import {
  Badge,
  Container,
  Nav,
  NavDropdown,
  Navbar,
  Offcanvas,
  Stack
} from "react-bootstrap"
import { useProjectStore } from "../zustand/useProject"
import { projectStatusColor } from "../lib/helpers"
import { useUser } from "../zustand/useUser"
import { useProjectId } from "@/hooks/useProjectId"
import { useProjectStats } from "@/hooks/useProjectStats"
import { Edit } from "lucide-react"

export default function NavBar() {
  const { userName } = useUser()
  const { projectId } = useProjectId()
  const { completed, raw, projectDocuments } = useProjectStats(projectId)

  const { currentProject, projectList, setCurrentProject } = useProjectStore()

  return (
    <Navbar
      key="AppNavbar"
      expand={false}
      collapseOnSelect={true}
      className="bg-body-tertiary mb-3"
    >
      <Container fluid>
        <Navbar.Brand href="/" style={{ float: "left" }}>
          <span className={"text-muted"}>TTLab TextAnnotator CORE</span>
        </Navbar.Brand>
        <Navbar.Brand style={{ float: "left", flex: "0.62" }}>
          <span style={{ marginLeft: "20px" }}>
            {raw?.project_data.success && raw?.project_data.result?.name}
          </span>
        </Navbar.Brand>
        {raw?.project_data.success && (
          <Nav.Item style={{ flex: 1 }}>
            Your annotations: <b>{completed.length}</b> out of{" "}
            <b>{projectDocuments.length}</b>
          </Nav.Item>
        )}

        <Navbar.Toggle aria-controls={`offcanvasNavbar-expand`} />
        <Navbar.Offcanvas
          id={`offcanvasNavbar-expand`}
          aria-labelledby={`offcanvasNavbarLabel-expand`}
          placement="end"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id={`offcanvasNavbarLabel-expand`}>
              Menu
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3">
              <NavDropdown
                title={
                  currentProject ? (
                    <span>
                      Project:{" "}
                      <strong>
                        {currentProject !== null ? currentProject!["name"] : ""}
                      </strong>
                    </span>
                  ) : (
                    "Select Project"
                  )
                }
                id={`offcanvasNavbarDropdown-expand`}
              >
                {projectList.map((task, index) => {
                  return (
                    <NavDropdown.Item
                      key={"project-list-item-" + index}
                      onClick={() => setCurrentProject(task)}
                      href={"/" + task["url"]}
                    >
                      <Stack direction="horizontal" gap={2}>
                        <span className={"text-muted"}>#{index + 1}</span>
                        {task["name"]}
                        <Badge bg={projectStatusColor(task["status"])}>
                          {task["status"]}
                        </Badge>
                      </Stack>
                    </NavDropdown.Item>
                  )
                })}
              </NavDropdown>
              <Nav.Link className={"mt-3"} href={"/user"}>
                <div className="float flex">
                  User: <strong>{userName || "?"}</strong>
                  <Edit />
                </div>
              </Nav.Link>
              {/*<Nav.Link href={"/legal"}>
                <div className="float flex mt-10">
                  Contact
                  <Contact />
                </div>
              </Nav.Link>
              <Nav.Link href={"/legal"}>
                <div className="float flex">
                  Legal Information
                  <BookMarked />
                </div>
              </Nav.Link>*/}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  )
}
