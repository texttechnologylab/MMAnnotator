import { useEffect, useState } from "react"
import { CASDocument, useDocumentStore } from "../zustand/useDocument"
import { useANNO } from "../lib/annotator/AnnoLib"
import { useUser } from "../zustand/useUser"
import { BasicFormValues, createViewFromUserName } from "../lib/helpers"

export const useProjectCas = (projectId: string) => {
  const {
    addCreateToQueue,
    annoSocketPromise,
    addEditToQueue,
    startQueue,
    openCASDocument,
    saveCASDocument,
    openView,
    openTool,
    openProject
  } = useANNO()
  const { getById, getProjectCasId, subscribeToWebSocket, clearListeners } =
    useDocumentStore()
  const { userName } = useUser()

  const [document, setDocument] = useState<CASDocument | null>(null)

  const documentChanged = () => {
    const document = getById(getProjectCasId())
    if (!document || !userName) return
    openView(document, createViewFromUserName(userName))
  }

  const getDocument = async () => {
    if (!userName) return
    await annoSocketPromise
    openProject(projectId, createViewFromUserName(userName))
  }

  const openCas = async (_msg: any) => {
    openCASDocument(_msg.data.casId)
  }

  const openViewCallback = (_msg: any) => {
    const document = getById(getProjectCasId())
    if (!document) return
    openTool(document, "Time")
  }

  const openToolCallback = (_msg: any) => {
    const document = getById(getProjectCasId())
    if (!document) return
    setDocument(document)
  }

  const changeCasCallback = (_msg: any) => {
    const document = getById(getProjectCasId())
    if (!document) return
    saveCASDocument(document)
  }

  const submitChanges = (data: BasicFormValues) => {
    if (!document) return
    for (const [key, value] of Object.entries(data)) {
      if (value.addr) {
        addEditToQueue(document, value.addr, {
          begin: 0,
          end: document.text.length,
          key: key,
          value: value.value
        })
      } else {
        addCreateToQueue(document, value.type, {
          begin: 0,
          end: document.text.length,
          key: key,
          value: value.value
        })
      }
    }
    startQueue(document)
  }

  useEffect(() => {
    if (userName != null) {
      clearListeners(projectId)
      subscribeToWebSocket("open_project", openCas, projectId)
      subscribeToWebSocket("open_cas", documentChanged, projectId)
      subscribeToWebSocket("open_view", openViewCallback, projectId)
      subscribeToWebSocket("open_tool", openToolCallback, projectId)
      subscribeToWebSocket("change_cas", changeCasCallback, projectId)
      getDocument()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName, annoSocketPromise])

  return { document, getDocument, submitChanges, subscribeToWebSocket }
}
