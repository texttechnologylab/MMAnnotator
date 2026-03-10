import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@/components/shadcn/ui/navigation-menu"
import { useProjectStore } from "../zustand/useProject"
import { projectStatusColor } from "../lib/helpers"
import { useUser } from "../zustand/useUser"
import { useProjectId } from "@/hooks/useProjectId"
import { useProjectStats } from "@/hooks/useProjectStats"
import { Edit, Menu, X } from "lucide-react"
import { Button } from "@/components/shadcn/ui/button"
import { useState } from "react"

export default function NavBar() {
  const { userName } = useUser()
  const { projectId } = useProjectId()
  const { completed, raw, projectDocuments } = useProjectStats(projectId)

  const { currentProject, projectList, setCurrentProject } = useProjectStore()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="flex items-center justify-between bg-muted/50 border-b px-4 py-2 mb-3">
      <a href="/" className="text-muted-foreground font-semibold shrink-0">
        TTLab TextAnnotator CORE
      </a>

      <span className="ml-5 flex-[0.62] font-semibold">
        {raw?.project_data.success && raw?.project_data.result?.name}
      </span>

      {raw?.project_data.success && (
        <span className="flex-1">
          Your annotations: <b>{completed.length}</b> out of{" "}
          <b>{projectDocuments.length}</b>
        </span>
      )}

      {/* Offcanvas toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Offcanvas-style side panel */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-80 bg-background border-l shadow-xl z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold text-lg">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 justify-start gap-4 overflow-y-auto flex-1">
              <NavigationMenu
                orientation="vertical"
                className="max-w-full [&>div]:w-full"
              >
                <NavigationMenuList className="flex-col items-start space-y-1 w-full">
                  <NavigationMenuItem className="w-full">
                    <NavigationMenuTrigger className="w-full justify-between">
                      {currentProject ? (
                        <span>
                          Project: <strong>{currentProject.name}</strong>
                        </span>
                      ) : (
                        "Select Project"
                      )}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="w-full">
                      <ul className="flex flex-col gap-1 p-2 w-64">
                        {projectList.map((task, index) => (
                          <li key={"project-list-item-" + index}>
                            <NavigationMenuLink asChild>
                              <a
                                href={"/" + task.url}
                                onClick={() => setCurrentProject(task)}
                                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm"
                              >
                                <span className="text-muted-foreground">
                                  #{index + 1}
                                </span>
                                <span>{task.name}</span>
                                <span
                                  className={`ml-auto text-xs px-1.5 py-0.5 rounded-full bg-${projectStatusColor(task.status)}`}
                                >
                                  {task.status}
                                </span>
                              </a>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              <a
                href="/user"
                className="flex items-center gap-1 mt-3 hover:underline"
              >
                User: <strong>{userName || "?"}</strong>
                <Edit className="h-4 w-4" />
              </a>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
