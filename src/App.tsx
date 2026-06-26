import { Navigate, Route, Routes } from "react-router-dom"
import "./App.css"
import NavBar from "./components/NavBar"
import HelpPage from "./pages/HelpPage"
import ProjectsPage from "./pages/ProjectsPage"
import LandingPage from "./pages/LandingPage"
import { Toaster } from "@/components/shadcn/ui/sonner"
import LoginPage from "./pages/LoginPage"
import DefaultOverview from "./pages/projects/Overview"
import { WebSocketProvider } from "./components/wrappers/WebSocketProvider"
import { UploadPage } from "./pages/admin/Upload"
import LegalNotice from "./pages/LegalNotice"
import { DemoRouteImages } from "./pages/projects/demo/DemoImage"
import { getCorpusConfig } from "./lib/temp"
import { DEFAULT_UCE_URL } from "./lib/constants"
import { ThemeProvider } from "./components/shadcn/theme-provider"

export default function App() {
  return (
    <>
      <ThemeProvider defaultTheme="system" storageKey="mm-annotator-theme">
        <WebSocketProvider>
          <div className="App">
            <NavBar />
          </div>

          <Routes>
            <Route path="/" element={<LandingPage />} />.
            <Route path="/legal" element={<LegalNotice />} />
            <Route path="projects">
              <Route path="" element={<ProjectsPage />} />
              <Route path=":projectId">
                <Route
                  path="Task"
                  element={
                    <DemoRouteImages
                      options={{
                        uce_hostname: window._env_?.UCE_URL || DEFAULT_UCE_URL,
                        uce_corpus_id: 1, // images annotation enabled
                        uce_corpus_config: getCorpusConfig("CORE-B04")
                      }}
                    />
                  }
                />
                <Route path="" element={<DefaultOverview />} />
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
      </ThemeProvider>
    </>
  )
}
