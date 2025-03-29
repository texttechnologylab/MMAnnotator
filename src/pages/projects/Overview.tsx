import { useLocation, useNavigate } from "react-router-dom"
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDashedIcon,
  FilterIcon,
  FilterXIcon,
  LockKeyhole,
  LockKeyholeOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useProjectStats } from "@/hooks/useProjectStats"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@/components/shadcn/ui/hover-card"
import { useProjectId } from "@/hooks/useProjectId"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/shadcn/ui/table"
import { Spinner } from "@/components/shadcn/ui/spinner"
import { Button } from "@/components/shadcn/ui/button"
import { Container, Row } from "react-bootstrap"
import { Progress } from "@/components/shadcn/ui/progress"
import { useContext, useEffect, useState } from "react"
import { WebSocketContext } from "@/components/wrappers/WebSocketProvider"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/shadcn/ui/drawer"
import {
  LoadingButton,
  LoadingState
} from "@/components/shadcn/ui/loading-button"
import { useDocumentStore } from "@/zustand/useDocument"
import { toast } from "sonner"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/shadcn/ui/collapsible"
import { Separator } from "@/components/shadcn/ui/separator"
import { Card, CardContent, CardTitle } from "@/components/shadcn/ui/card"
import WithAuth from "@/components/wrappers/WithAuth"
import { getAccessPermissionsForTargets } from "@/lib/resources/permissions"
import { useUser } from "@/zustand/useUser"

export default function Overview() {
  return (
    <WithAuth>
      <OverviewContainer />
    </WithAuth>
  )
}

function OverviewContainer() {
  const navigate = useNavigate()
  const { subscribeToWebSocket, clearListeners } = useDocumentStore()
  const { annoSocketPromise } = useContext(WebSocketContext)
  const { projectId } = useProjectId()
  const { session } = useUser()
  const { completed, raw, projectDocuments } = useProjectStats(projectId, 2)
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.NEUTRAL
  )
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [collapsibleOpen, setCollapsibleOpen] = useState(false)
  const [filtered, setFiltered] = useState(false)
  const [accessMap, setAccessMap] = useState<Map<string, string[]>>()

  const project = raw?.project_data.success
    ? (raw?.project_data.result ?? null)
    : null
  const isAdmin = raw?.project_data.success
    ? raw.project_data.result.access >= 4
    : false

  const getFirstRepo = () => {
    if (raw?.project_data.success) {
      for (const child of raw.project_data.result.children) {
        if (typeof child !== "string" && child.type === "REPOSITORY")
          return child
      }
    }
    return null
  }

  useEffect(() => {
    if (raw && raw.project_data.success === false) {
      toast.error(raw.project_data.message)
    }
  }, [raw])

  useEffect(() => {
    if (!annoSocketPromise || !projectId) return
    clearListeners(projectId)
    subscribeToWebSocket(
      "export",
      (_data) => {
        setLoadingState(LoadingState.SUCCESS)
        toast.success("Success", {
          description: "Exported successfully",
          closeButton: true
        })
      },
      projectId
    )
    subscribeToWebSocket(
      "export_progress",
      (dataIn) => {
        const data = dataIn.data
        setProgress(data.progress)
        setTotal(data.total)
      },
      projectId
    )
    subscribeToWebSocket(
      "msg",
      (msg) => {
        if (msg.data.text) {
          setLoadingState(LoadingState.ERROR)
        }
      },
      projectId
    )
  }, [annoSocketPromise])

  useEffect(() => {
    if (isAdmin) {
      getAccessPermissions()
    }
  }, [project])

  console.log(accessMap)

  const getAnnnotators = (mongoid?: string) => {
    if (mongoid) {
      if (raw && mongoid in raw.stats.admin) {
        const doc = raw.stats.admin[mongoid]
        return Object.keys(doc).filter((key) => key.startsWith("view_user"))
      }
    }
    return []
  }

  const getTotalAnnotations = () => {
    let count = 0
    if (!raw) return count
    for (const doc of Object.values(raw.stats.admin)) {
      if (
        Object.keys(doc).filter((key) => key.startsWith("view_user")).length > 0
      )
        count++
    }
    return count
  }

  const getAccessPermissions = () => {
    const documents = projectDocuments.map((doc) => doc.uri)

    getAccessPermissionsForTargets(session!, documents, "USER").then(
      (access) => {
        const accessMap = new Map<string, string[]>()
        for (const entry of access) {
          if (accessMap.has(entry.object)) {
            if (accessMap.get(entry.object)?.includes(entry.authority.label))
              continue
            accessMap.get(entry.object)?.push(entry.authority.label)
          } else {
            accessMap.set(entry.object, [entry.authority.label])
          }
        }
        setAccessMap(accessMap)
      }
    )
  }

  const exportData = () => {
    setLoadingState(LoadingState.LOADING)
    annoSocketPromise.then((socket) => {
      socket.send(
        JSON.stringify({
          cmd: "export",
          // TODO: Ideally we can specify the project instead of the repository...
          data: {
            repository: getFirstRepo()?.id,
            type: "category",
            view: ""
          }
        })
      )
    })
  }

  const { search } = useLocation()
  const limitReasoningContexts = new URLSearchParams(search).get("rc") || ""
  const limitReasoningContextsUrlPart = (() => {
    const rc = new URLSearchParams(search).get("rc") || null
    if (rc) {
      return `rc=${rc}&`
    }
    return ""
  })()

  const showDescriptionInTable =
    new URLSearchParams(search).get("d") == "1" || false

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Card>
          <CardContent className="p-0 pb-4 max-h-[80vh] overflow-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Website</TableHead>
                  {showDescriptionInTable && <TableHead>Kontexte</TableHead>}
                  <TableHead>Annotations</TableHead>
                  <TableHead></TableHead>
                  <TableHead>
                    <div className="float-left">Status</div>
                    {filtered ? (
                      <FilterIcon
                        className="cursor-pointer"
                        onClick={() => setFiltered((state) => !state)}
                      />
                    ) : (
                      <FilterXIcon
                        className="cursor-pointer"
                        onClick={() => setFiltered((state) => !state)}
                      />
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!project && (
                  <TableRow className={"text-center align-middle h-52"}>
                    <TableCell colSpan={3} className={"w-full"}>
                      <Spinner />
                    </TableCell>
                  </TableRow>
                )}
                {projectDocuments
                  .filter((task) =>
                    filtered ? true : !completed.includes(task.mongoid ?? "")
                  )
                  .filter((task) => {
                    if (limitReasoningContexts) {
                      return task.description.includes(
                        limitReasoningContexts.toUpperCase()
                      )
                    }
                    return true
                  })
                  .sort((item) =>
                    completed.includes(item.mongoid ?? "") ? 1 : -1
                  )
                  .map((task, index) => {
                    return (
                      <TableRow key={"projects-big-list-a-" + index}>
                        <TableCell className="w-[60%] overflow-ellipsis">
                          <a
                            href={`${projectId}/Task?${limitReasoningContextsUrlPart}id=${task.id}`}
                            style={{
                              color: "blue",
                              textDecoration: "underline"
                            }}
                          >
                            {task.name}
                          </a>
                        </TableCell>
                        {showDescriptionInTable && (
                          <TableCell>{task.description}</TableCell>
                        )}
                        <TableCell>
                          <HoverCard>
                            <HoverCardTrigger style={{ cursor: "pointer" }}>
                              <span>
                                {getAnnnotators(task.mongoid).length}{" "}
                                Annotation(s)
                              </span>
                            </HoverCardTrigger>
                            <HoverCardContent
                              className={cn("max-h-[20vh] overflow-scroll")}
                            >
                              <ul>
                                {getAnnnotators(task.mongoid).map(
                                  (annotator, index) => {
                                    return (
                                      <li
                                        key={"projects-big-list-b-" + index}
                                        style={{ listStyleType: "circle" }}
                                      >
                                        {annotator.replace("view_user_", "")}
                                      </li>
                                    )
                                  }
                                )}
                                {isAdmin && (
                                  <div className="flex">
                                    <span className="text-nowrap text-lg underline flex gap-2 m-auto">
                                      Access
                                    </span>
                                  </div>
                                )}
                                {isAdmin &&
                                  accessMap &&
                                  accessMap
                                    .get(task.uri)
                                    ?.filter((user) => user != "sysop")
                                    .map((user) => {
                                      return (
                                        <li
                                          key={"projects-big-list-c-" + user}
                                          style={{ listStyleType: "circle" }}
                                        >
                                          {user}
                                        </li>
                                      )
                                    })}
                              </ul>
                            </HoverCardContent>
                          </HoverCard>
                        </TableCell>
                        <TableCell>
                          <div>
                            <Button
                              onClick={() => {
                                navigate(
                                  `Task?${limitReasoningContextsUrlPart}id=${task.id}`
                                )
                              }}
                            >
                              Annotate
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {completed.includes(task.mongoid ?? "") ? (
                              <CheckCircle2 />
                            ) : (
                              <CircleDashedIcon />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </CardContent>
          <CardContent>
            <div className="flex">
              <Separator className="mt-3 mr-2 h-1 w-[44%]" />
              <span className="text-nowrap text-lg flex gap-2">
                Admin Panel{isAdmin ? <LockKeyholeOpen /> : <LockKeyhole />}
              </span>
              <Separator className="mt-3 ml-2 h-1 w-[44%]" />
            </div>
            <Collapsible disabled={!isAdmin} onOpenChange={setCollapsibleOpen}>
              <CollapsibleTrigger className="w-100">
                <div className={!isAdmin ? "text-gray-200" : ""}>
                  {collapsibleOpen ? (
                    <ChevronUp className="m-auto" />
                  ) : (
                    <ChevronDown className="m-auto" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="w-[100%]">
                <CardTitle>Overall Progress</CardTitle>
                <br />
                <div>
                  <Progress
                    value={
                      (getTotalAnnotations() / projectDocuments.length) * 100
                    }
                  />
                  <div className="m-auto text-center text-lg">
                    {getTotalAnnotations()}/{projectDocuments.length}
                  </div>
                </div>
                <Drawer>
                  <DrawerTrigger className="w-[100%] mt-2" asChild>
                    <Button>Export</Button>
                  </DrawerTrigger>
                  <DrawerContent className="h-80">
                    <DrawerHeader>
                      <DrawerTitle>Export</DrawerTitle>
                      <DrawerDescription>
                        Creates a CSV File with all the annotations.
                      </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                      <Progress
                        value={total !== 0 ? (100 * progress) / total : 0}
                      />

                      <LoadingButton
                        className=""
                        loading={loadingState}
                        onClick={() => exportData()}
                      >
                        Start
                      </LoadingButton>
                      <DrawerClose>
                        <Button variant="outline">Close</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </Row>
    </Container>
  )
}
