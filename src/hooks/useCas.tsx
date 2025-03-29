import { useEffect, useState } from "react"
import { CASDocument, useDocumentStore } from "../zustand/useDocument"
import { useANNO } from "../lib/annotator/AnnoLib"
import { useUser } from "../zustand/useUser"
import { BasicFormValues, createViewFromUserName } from "@/lib/helpers"
import { useLoadingState } from "@/zustand/useLoadingState"

export type FormCASTypes = "org.texttechnologylab.annotation.core.Category"

export const useCas = (casId: string) => {
  const {
    annoSocketPromise,
    addCreateToQueue,
    addEditToQueue,
    startQueue,
    awaitSession,
    openCASDocument,
    saveCASDocument,
    openView,
    openTool
  } = useANNO()
  const { getById, subscribeToWebSocket, clearListeners } = useDocumentStore()
  const { userName } = useUser()

  const [document, setDocument] = useState<CASDocument | null>(null)

  const { loadingState, completeStep } = useLoadingState([
    { id: 1, name: "Open CAS Document", completed: false },
    { id: 2, name: "Open View", completed: false },
    { id: 3, name: "Open Tool", completed: false },
    { id: 4, name: "Completed", completed: false }
  ])

  const getDocument = async () => {
    await awaitSession()
    openCASDocument(casId)
    completeStep(1)
  }

  const openCasCallback = () => {
    const document = getById(casId)
    if (!document || !userName) return
    openView(document, createViewFromUserName(userName))
    completeStep(2)
  }

  const openViewCallback = (msg: any) => {
    // TODO: Maybe this should be stuff for the websocket subscription stuff?
    if (msg.data.casId !== casId) return
    const document = getById(casId)
    if (!document) return
    openTool(document, "Time")
    completeStep(3)
  }

  const openToolCallback = (msg: any) => {
    if (msg.data.casId !== casId) return
    const document = getById(casId)
    if (!document) return
    setDocument(document)
    completeStep(4)
  }

  const changeCasCallback = (msg: any) => {
    if (msg.data.casId !== casId) return
    const document = getById(casId)
    if (!document) return
    saveCASDocument(document)
  }

  const submitChanges = (data: BasicFormValues) => {
    const document = getById(casId)
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
    if (userName != null && casId != null) {
      clearListeners(casId)
      subscribeToWebSocket("open_cas", openCasCallback, casId)
      subscribeToWebSocket("open_view", openViewCallback, casId)
      subscribeToWebSocket("open_tool", openToolCallback, casId)
      subscribeToWebSocket("change_cas", changeCasCallback, casId)
      getDocument()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName, annoSocketPromise])

  return {
    document,
    getDocument,
    submitChanges,
    subscribeToWebSocket,
    loadingState
  }
}
