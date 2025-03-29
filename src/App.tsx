import { Navigate, Route, Routes } from "react-router-dom"
import "bootstrap/dist/css/bootstrap.min.css"
import "./App.css"
import NavBar from "./components/NavBar"
import HelpPage from "./pages/HelpPage"
import ProjectsPage from "./pages/ProjectsPage"
import LandingPage from "./pages/LandingPage"
import { Toaster } from "@/components/shadcn/ui/sonner"
import LoginPage from "./pages/LoginPage"
import Overview from "./pages/projects/Overview"
import { WebSocketProvider } from "./components/wrappers/WebSocketProvider"
import { UploadPage } from "./pages/admin/Upload"
import LegalNotice from "./pages/LegalNotice"
import { DemoRouteImages } from "./pages/projects/demo/DemoImage"

export default function App() {
  return (
    <>
      <WebSocketProvider>
        <div className="App">
          <NavBar />
        </div>

        <Routes>
          <Route path="/" element={<LandingPage />} />.
          <Route path="/legal" element={<LegalNotice />} />
          <Route path="projects">
            <Route path="" element={<ProjectsPage />} />
            <Route path="34926">
              <Route path="Task" element={<DemoRouteImages />} />
              <Route path="" element={<Overview />} />
              <Route path="*" element={<Navigate to="" replace />} />
            </Route>
          </Route>
          <Route path="admin">
            <Route path="upload" element={<UploadPage />} />
          </Route>
          <Route path="/user" element={<LoginPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
        <Toaster />
      </WebSocketProvider>
    </>
  )
}
