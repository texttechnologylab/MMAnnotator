import { useProjectStore } from "../zustand/useProject"
import { projectStatusColor } from "../lib/helpers"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/shadcn/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/shadcn/ui/card"
import { cn } from "@/lib/utils"

export default function ProjectsPage() {
  const { projectList, setCurrentProject } = useProjectStore()

  const navigate = useNavigate()

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projectList.map((task, index) => {
          return (
            <Card key={"projects-big-list-" + index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {task.name}
                  <span
                    className={cn(
                      `text-xs px-2 py-0.5 rounded-full bg-${projectStatusColor(task.status)} text-white`
                    )}
                  >
                    {task.status}
                  </span>
                </CardTitle>
                <CardDescription>{task.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => {
                    setCurrentProject(task)
                    navigate(`/${task.url}`)
                  }}
                >
                  Select
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
