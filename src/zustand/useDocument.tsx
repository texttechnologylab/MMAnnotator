import { create } from "zustand"
import { getUsernameFromURIShort } from "../lib/annotator/AnnoApi"
import { subscribeWithSelector } from "zustand/middleware"
import { toast } from "sonner"

export interface Tool {
  [key: string]: ToolEntry
}

export interface ToolEntry {
  _addr: number
  _type: string
  features: Record<string, any>
}

type KeysWithValsOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: P
} &
  keyof T

export type RecommendationCommand = {
  cmd: "recommendation"
  data: {
    bid: string
    addr: string
    recommendation_decision: string
  }
}

export type EditCommand = {
  cmd: "edit"
  data: {
    bid: string
    addr: string
    features: Record<string, any>
  }
}

export type CreateCommand = {
  cmd: "create"
  data: {
    bid: string
    _type: string
    features: Record<string, any>
  }
}

export type RemoveCommand = {
  cmd: "remove"
  data: {
    bid: string
    addr: string
  }
}

export type AppendCommand = {
  cmd: "append_array"
  data: {
    bid: string
    addr: string
    featureAddr: string
    featureName: string
  }
}

export type Command =
  | RecommendationCommand
  | CreateCommand
  | RemoveCommand
  | EditCommand
  | AppendCommand

export interface ICASDocument {
  id: string | null
  typesystem: string | null
  text: string
  name: string
  textElements: object
  toolElements: Record<string, Tool>
  toolElementsCompare: Record<string, Tool>
  recommendation: object
  currentTool: string | null
  currentViewURI: string | null
  currentViewName: string | null
  users: string[]
  workercount: number
  undoSize: number
  permission: number
  redoSize: number
  private: boolean
  isLocked: boolean
  cmdQueue: Command[]
  iaa: number
  iaas: number[]
  iaaValuesDependency: any[]
  views: any[]
  classes: any[]
  predefined: any[]
  currentEdit: string
  perspective: string
  setCurrentView: (viewName: string) => void
  getCurrentView: () => string | null
  addFeatureStructure: (
    type: string,
    address: string,
    features: ToolEntry,
    scope?: KeysWithValsOfType<ICASDocument, Record<string, Tool>>
  ) => void
  removeFeatureStructure: (
    address: any,
    scope?: KeysWithValsOfType<ICASDocument, Record<string, Tool>>
  ) => void
}

export class CASDocument implements ICASDocument {
  id: string | null
  typesystem: string | null
  text: string
  name: string
  textElements: object
  toolElements: Record<string, Tool>
  toolElementsCompare: Record<string, Tool>
  recommendation: object
  currentTool: string | null
  currentViewURI: string | null
  currentViewName: string | null
  users: string[]
  workercount: number
  undoSize: number
  permission: number
  redoSize: number
  private: boolean
  isLocked: boolean
  cmdQueue: Command[]
  iaa: number
  iaas: number[]
  iaaValuesDependency: any[]
  views: any[]
  classes: any[]
  predefined: any[]
  currentEdit: string
  perspective: string

  constructor(document?: Partial<ICASDocument>) {
    //FIXME: This is awful
    this.id = document?.id ?? null
    this.typesystem = document?.typesystem ?? null
    this.text = document?.text ?? ""
    this.name = document?.name ?? "unnamed"
    this.textElements = document?.textElements ?? {}
    this.toolElements = document?.toolElements ?? {}
    this.toolElementsCompare = document?.toolElementsCompare ?? {}
    this.recommendation = document?.recommendation ?? {}
    this.currentTool = document?.currentTool ?? null
    this.currentViewURI = document?.currentViewURI ?? null
    this.currentViewName = document?.currentViewName ?? null
    this.users = document?.users ?? []
    this.workercount = document?.workercount ?? 0
    this.undoSize = document?.undoSize ?? 0
    this.permission = document?.permission ?? 0
    this.redoSize = document?.redoSize ?? 0
    this.private = document?.private ?? false
    this.isLocked = document?.isLocked ?? false
    this.cmdQueue = document?.cmdQueue ?? []
    this.iaa = document?.iaa ?? 0
    this.iaas = document?.iaas ?? []
    this.iaaValuesDependency = document?.iaaValuesDependency ?? []
    this.views = document?.views ?? []
    this.classes = document?.classes ?? []
    this.predefined = document?.predefined ?? []
    this.currentEdit = document?.currentEdit ?? "toolElements"
    this.perspective = document?.perspective ?? "default"
  }

  setCurrentView(viewName: string) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    if (viewName.startsWith("http")) {
      this.currentViewURI = viewName
      getUsernameFromURIShort(viewName, function (res: string | null) {
        that.currentViewName = res
      })
    } else this.currentViewName = viewName
  }

  getCurrentView() {
    return this.currentViewURI ?? this.currentViewName
  }

  addFeatureStructure(
    type: string,
    address: string,
    features: ToolEntry,
    scope: KeysWithValsOfType<
      ICASDocument,
      Record<string, Tool>
    > = "toolElements"
  ) {
    this.addFeatureStructureScope(type, address, features, scope)
  }

  addFeatureStructureScope(
    type: string,
    address: string,
    features: ToolEntry,
    scope: KeysWithValsOfType<ICASDocument, Record<string, Tool>>
  ) {
    const fss = this[scope]
    if (typeof fss[type] === "undefined") {
      fss[type] = {}
    }
    fss[type][address] = features
  }

  removeFeatureStructure(
    address: string,
    scope: KeysWithValsOfType<
      ICASDocument,
      Record<string, Tool>
    > = "toolElements"
  ) {
    this.removeFeatureStructureScope(address, scope)
  }

  removeFeatureStructureScope(
    address: string,
    scope: KeysWithValsOfType<ICASDocument, Record<string, Tool>>
  ) {
    const fss = this[scope]
    for (const typeKey in fss) {
      const fSAddresses = fss[typeKey]
      delete fSAddresses[address]
    }
  }

  removeFeatureStructureScopeAll(
    scope: KeysWithValsOfType<ICASDocument, Record<string, Tool>>
  ) {
    const fss = this[scope]
    for (const typeKey in fss) {
      const fSAddresses = fss[typeKey]
      for (const fsAddress in fSAddresses) {
        delete fSAddresses[fsAddress]
      }
    }
  }
}

export type WebSocketMessageType =
  | "create_db_cas"
  | "create_db_cas_fast"
  | "list_project_stats"
  | "open_project"
  | "open_cas"
  | "open_schema"
  | "change_cas"
  | "recommendation"
  | "open_tool"
  | "open_tool_seg"
  | "modify_tool"
  | "copy_view"
  | "remove_view"
  | "open_view"
  | "session"
  | "export"
  | "export_progress"
  | "error"
  | "close_cas"
  | "close_schema"
  | "close_tool"
  | "close_view"
  | "close_session"
  | "msg"
  | "on_close"

export type DocumentStore = {
  documents: Map<string, CASDocument>
  projectCasId: string
  annoSocket: WebSocket | null
  getAnnotationSocket: () => Promise<WebSocket>
  initSocket: () => Promise<WebSocket>
  subscribeToWebSocket: (
    type: WebSocketMessageType,
    callback: (msg: any) => void,
    group?: string
  ) => () => void
  callListeners: (type: WebSocketMessageType, msg: any, group?: string) => void
  clearListeners: (group?: string) => void
  webSocketListeners: Map<
    string,
    Map<WebSocketMessageType, Set<(msg: any) => void>>
  >
  setDocumentById: (id: string, document: CASDocument) => void
  setProjectCasId: (id: string) => void
  getProjectCasId: () => string
  getById: (id: string) => CASDocument | null
  remove: (id: string) => void
  removeAll: () => void
}

export const useDocumentStore = create<DocumentStore>()(
  subscribeWithSelector(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore For some reason the ts language server struggles here quite often
    (set, get) => {
      return {
        documents: new Map<string, CASDocument>(),
        projectCasId: "-1",
        annoSocket: null,
        webSocketListeners: new Map<
          WebSocketMessageType,
          Set<(msg: any) => void>
        >(),
        getAnnotationSocket: async () => {
          if (get().annoSocket === null) {
            console.log(
              "The connection to the web service was interrupted. Please refresh the <b>TextAnnotator</b> (F5).",
              "Connection to the Webservice",
              "br"
            )
            return await get().initSocket()
          } else return get().annoSocket!
        },
        setProjectCasId: (id: string) => {
          set({ projectCasId: id })
        },
        getProjectCasId: () => {
          return get().projectCasId
        },
        setDocumentById: (id: string, document: CASDocument) => {
          set({ documents: get().documents.set(id, document) })
        },
        getById: (id: string) => {
          const doc = get().documents.get(id)
          return doc ?? null
        },
        remove: (id: string) => {
          const docs = get().documents
          docs.delete(id)
          set({ documents: docs })
        },
        removeAll: () => {
          set({ documents: new Map<string, CASDocument>() })
        },
        subscribeToWebSocket: (
          type: WebSocketMessageType,
          callback: (msg: any) => void,
          group: string = "default"
        ) => {
          const groupListeners =
            get().webSocketListeners.get(group) ??
            new Map<WebSocketMessageType, Set<(msg: any) => void>>()
          const listeners = groupListeners.get(type) ?? new Set()
          listeners.add(callback)
          groupListeners.set(type, listeners)
          get().webSocketListeners.set(group, groupListeners)
          return () =>
            get().webSocketListeners.get(group)?.get(type)?.delete(callback)
        },
        callListeners: (type: WebSocketMessageType, msg: any, group) => {
          if (group)
            get()
              .webSocketListeners.get(group)
              ?.get(type)
              ?.forEach((listener) => listener(msg))
          else
            get().webSocketListeners.forEach((groupListener) =>
              groupListener.get(type)?.forEach((listener) => listener(msg))
            )
        },
        clearListeners: (group) => {
          if (group) {
            const listeners = get().webSocketListeners
            listeners.delete(group)
            set({ webSocketListeners: listeners })
          } else {
            set({ webSocketListeners: new Map() })
          }
        },
        initSocket: function initSocket(): Promise<WebSocket> {
          return new Promise(function (resolve, reject) {
            //TODO: let webSocket = new WebSocket("ws://" + getAnnoServiceSmall() + "/uima")
            // local
            //"ws://" + "localhost:4567" + "/uima"
            // alba prod
            //"ws://annotator.core.texttechnologylab.org/uima"
            const webSocket = new WebSocket(
              "wss://textannotator.texttechnologylab.org/uima"
            )
            webSocket.onclose = (closeEvent) => {
              console.log(
                "The connection to the web service was closed.",
                "Connection to the Webservice",
                "br",
                closeEvent
              )
              toast.info("Web Service", {
                description:
                  "The connection the web service was closed. Please try to re-establish the connection by clicking 'Reconnect' or refreshing the page (F5).",
                action: {
                  onClick: () => {
                    set({ annoSocket: null })
                  },
                  label: "Reconnect"
                },
                closeButton: true,
                important: true,
                duration: Infinity
              })
              get().annoSocket = null
              get().callListeners("on_close", "closed")
              //TextAnnotator.app.getMainView().getController().closeAllAnnoSubs()
            }

            webSocket.onopen = () => {
              console.log(
                "Successfully connected to the web service. You can now start your annotation process.",
                "Connection to the Webservice",
                "br"
              )
              get().annoSocket = webSocket
              resolve(webSocket)
            }
            webSocket.onerror = (err) => {
              toast.error("Web Service", {
                description:
                  "An error occured. If issues persist please refresh the Page (F5).",
                closeButton: true,
                important: true,
                duration: Infinity
              })
              get().annoSocket?.close()
              console.error(err)
              reject(err)
            }

            webSocket.onmessage = (msg) => {
              if (msg.data instanceof Blob) {
                const blob = msg.data
                const a = document.createElement("a")
                a.download = "export.csv"
                a.href = URL.createObjectURL(blob)
                a.addEventListener("click", (_e: any) => {
                  setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000)
                })
                a.click()
                get().callListeners("export", { cmd: "export" })
                return
              }

              const response = JSON.parse(msg.data)

              console.log(response)
              switch (response.cmd as WebSocketMessageType) {
                case "session": {
                  break
                }
                case "open_cas": {
                  const casDocument = {
                    id: response.data.casId,
                    name: response.data.name,
                    text: response.data.text,
                    typesystem: response.data.typesystem,
                    views: response.data.views,
                    classes: response.data.classes,
                    predefined: response.data.predefined,
                    permission: response.data.permission
                  } satisfies Partial<ICASDocument>
                  const document = new CASDocument(casDocument)
                  get().setDocumentById(casDocument.id, document)

                  //TextAnnotator.app.getMainView().getController().openDocument(casDocument)
                  // ANNO.openView(casDocument, "https://authority.hucompute.org/user/0")
                  // Andy
                  // ANNO.openView(casDocument, "https://authority.hucompute.org/user/306614")
                  //ANNO.openGetParams("view")
                  break
                }
                case "open_schema": {
                  // TODO!
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  /*const casDocument = {
                    id: response.data.casId,
                    name: response.data.name,
                    text: response.data.text,
                    typesystem: response.data.typesystem,
                    views: response.data.views,
                    classes: response.data.classes,
                    predefined: response.data.predefined,
                    permission: response.data.permission
                  } satisfies Partial<CASDocument>*/
                  //TODO: TextAnnotator.app.getMainView().getController().openSchema(casDocument)
                  break
                }
                case "change_cas": {
                  const casDocument = get().getById(response.data.casId)
                  if (!casDocument) return
                  // TODO: casDocument.beginEdit()
                  casDocument.currentEdit = "toolElements"
                  const updates = response["data"]["updates"]
                  if (typeof updates !== "undefined") {
                    for (const typeKey in updates) {
                      const fSAddresses = updates[typeKey]
                      // console.log(fSAddresses)
                      for (const addressKey in fSAddresses) {
                        if (Object.keys(fSAddresses[addressKey]).length == 0) {
                          // console.log(addressKey)
                          casDocument.removeFeatureStructure(addressKey)
                        } else {
                          casDocument.addFeatureStructure(
                            typeKey,
                            addressKey,
                            fSAddresses[addressKey]
                          )
                        }
                      }
                    }
                  }
                  //TODO: casDocument.endEdit()
                  break
                }
                case "open_project":
                  get().setProjectCasId(response.data.casId)
                  break
                /*
                                
      
                case 'recommendation': {
                    let casDocument = TextAnnotator.getApplication().getCASDocumentsStore().getById(response.data.casId)
                    casDocument.setCurrentEdit("recommendation")
                    casDocument.beginEdit()
                    let updates = response['data']['recommendation']
      
                    // First, remove all existing recommendations, as the are newly loaded and may have changed
                    // TODO better send empty object to remove
                    casDocument.removeFeatureStructureScopeAll("recommendation")
      
                    if (typeof updates !== 'undefined') {
                        for (let typeKey in updates) {
                            if (!updates.hasOwnProperty(typeKey)) continue
                            let fSAddresses = updates[typeKey]
                            // console.log(fSAddresses)
                            for (let addressKey in fSAddresses) {
                                if (!fSAddresses.hasOwnProperty(addressKey)) continue
                                if (jQuery.isEmptyObject(fSAddresses[addressKey])) {
                                    // console.log(addressKey)
                                    casDocument.removeFeatureStructure(addressKey, "recommendation")
                                } else {
                                    // console.log(typeKey+ " "+addressKey)
                                    casDocument.addFeatureStructure(typeKey, addressKey, fSAddresses[addressKey], "recommendation")
                                }
                            }
                        }
                    }
                    casDocument.endEdit()
                    break
                }*/
                case "open_tool": {
                  const casDocument = get().getById(response.data.casId)
                  if (casDocument == null) break
                  casDocument.toolElements = response.data.toolElements
                  casDocument.toolElementsCompare =
                    response.data.toolElementsCompare
                  casDocument.currentTool = response.data.toolName
                  // // TODO
                  // if (response.data.toolName == "proppanel")
                  //     casDocument.set("currentTool", "semaf")
                  //     //casDocument.set("currentTool", response.data.toolName)
                  // else if (response.data.toolName == "timepanel")
                  //     casDocument.set("currentTool", "proppanel")
                  // else
                  //     casDocument.set("currentTool", response.data.toolName)
                  // openTool(casDocument, "depanno")
                  //TODO:
                  //casDocument.finish = response.data.finish
                  break
                }
                case "open_tool_seg": {
                  const casDocument = get().getById(response.data.casId)
                  if (casDocument == null) break
                  Object.entries(
                    response.data.toolElements as Record<string, Tool>
                  ).forEach(([key, value]) => {
                    casDocument.toolElements[key] = {
                      ...casDocument.toolElements[key],
                      ...value
                    }
                  })
                  break
                }
                /*case 'modify_tool': {
                    let casDocument = TextAnnotator.getApplication().getCASDocumentsStore().getById(response.data.casId)
                    casDocument.beginEdit()
                    if (response.data.toolElementsCompare != null) {
                        casDocument.set("toolElementsCompare", response.data.toolElementsCompare)
                    }
                    casDocument.endEdit()
      
                    break
                }
                case 'copy_view':
                case 'remove_view': {
                    let casDocument = TextAnnotator.getApplication().getCASDocumentsStore().getById(response.data.casId)
                    casDocument.set('views', response.data.views)
                    break
                }*/
                case "open_view": {
                  const casDocument = get().getById(response.data.casId)
                  if (!casDocument) break
                  casDocument.setCurrentView(response.data.view)

                  // ANNO.openTool(casDocument, "proppanel")
                  // ANNO.openTool(casDocument, "semaf")
                  break
                }
              }
              get().callListeners(response.cmd, response)
            }
          })
        }
      }
    }
  )
)
