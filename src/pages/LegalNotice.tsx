import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/shadcn/ui/card"
import { Container } from "react-bootstrap"

export default function LegalNotice() {
  return (
    <Container>
      <Card>
        <CardHeader>
          <CardTitle>Legal Notice</CardTitle>
        </CardHeader>
        <CardContent>
          Information is given according to § 5 of the German Teleservices Act.
        </CardContent>
        <CardHeader>
          <CardTitle>Service provider</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Goethe-University</p>
          <p>Theodor-W.-Adorno-Platz 1</p>
          <p>60323 Frankfurt am Main, Germany</p>
          <p>Phone: +49-69-798-0 | Telefax: +49-69-798-18383</p>
          <p>WWW: www.uni-frankfurt.de</p>

          <p>
            Legal representative: the president of the Goethe-University, Prof.
            Dr. Enrico Schleiff
          </p>
          <p>
            Legal supervision: Hessian Ministry of Science and Art, Rheinstr.
            23-25, 65185 Wiesbaden, Germany.
          </p>
          <p>Place of jurisdiction: Frankfurt am Main</p>
          <p>Value added tax identification number (VAT No.): DE 114 110 511</p>
          <p>Tax number: 04 522 658 002</p>
        </CardContent>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Daniel Baumartz</p>
          <p>FB 12 Computer Science and Mathematics</p>
          <p>Robert-Mayer-Straße 10</p>
          <p>60325 Frankfurt am Main, Germany</p>
          <p>E-mail: baumartz@em.uni-frankfurt.de</p>
          <p>Phone: +49-69-798-28926</p>
        </CardContent>
        <CardHeader>
          <CardTitle>Collection of Data</CardTitle>
        </CardHeader>
        <CardContent className="ml-4">
          <CardTitle>Access Data/Server Log Files</CardTitle>
          When accessing the pages of this web server, the following data is
          generally stored in the server log files This data is used solely for
          the purpose of checking functionality, security and troubleshooting.
          <ol className="list-decimal ml-10">
            <li>IP address</li>
            <li>Date and time</li>
            <li>Type of Client Browser</li>
            <li>URL of the called page</li>
            <li>Optionally, the error message for the error that occurred</li>
            <li>Optionally, the requesting provider</li>
          </ol>
          This use is based on EU DSGVO Article 6 paragraph 1 f). All log files
          are automatically deleted or made anonymous after 7 days at the
          latest.
          <CardTitle>Cookies</CardTitle>
          Cookies are small files that allow us to store specific information
          about your device on your access device (PC, smartphone, etc.). They
          serve on the one hand the user friendliness of web pages (e.g. storage
          of login data). You can influence the use of cookies. Most browsers
          have an option with which the storage of cookies can be restricted or
          completely prevented. However, it is pointed out that the use and in
          particular the comfort of use without cookies can be restricted.
          Cookies are mandatory for using the login-secured pages. They serve to
          determine the access authorization and are deleted after the end of
          the session.
          <CardTitle>Contacting</CardTitle>
          In order to contact members of the Goethe University (e.g. via contact
          form or e-mail), your details will be stored for the purpose of
          processing the enquiry and in the event that follow-up questions
          arise. After processing your request or after fulfilment of the legal
          obligation or the service used, the data will be deleted, unless the
          storage of the data is necessary for the implementation of legitimate
          interests of Goethe University or due to a statutory provision (e.g.
          law, ordinance, statutes of Goethe University etc.).
        </CardContent>
      </Card>
    </Container>
  )
}
