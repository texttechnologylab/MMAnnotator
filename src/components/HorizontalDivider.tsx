import { ReactNode } from "react"
import { Col, Row } from "react-bootstrap"

export const HorizontalDivider = ({ children }: { children: ReactNode }) => {
  return (
    <Row>
      <Col>
        <hr />
      </Col>
      <Col xs="auto">{children}</Col>
      <Col>
        <hr />
      </Col>
    </Row>
  )
}
