import { useDocumentStore } from "@/zustand/useDocument"
import { useUser } from "@/zustand/useUser"
import { ReactNode, createContext, useEffect, useState } from "react"
import { toast } from "sonner"

export interface WebSocketContextType {
  annoSocketPromise: Promise<WebSocket>
}

export const WebSocketContext = createContext<WebSocketContextType>({
  annoSocketPromise: Promise.resolve(null) as any
})

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { annoSocket, getAnnotationSocket, subscribeToWebSocket } =
    useDocumentStore()
  const { session } = useUser()

  const [annoSocketPromise, setAnnoSocket] = useState<Promise<WebSocket>>(
    new Promise(() => {})
  )

  useEffect(() => {
    if (session === null) return
    const socket = annoSocket
      ? new Promise<WebSocket>(() => annoSocket)
      : getAnnotationSocket()
    // if our socket resolved
    socket.then(async (resolvedSocket) => {
      // establish the session
      resolvedSocket.send(
        JSON.stringify({
          cmd: "session",
          data: { session: session }
        })
      )
      // wait for the session to respond
      new Promise((resolve) => {
        subscribeToWebSocket(
          "session",
          () => {
            resolve(true)
          },
          "auth"
        )
      }).then(() => {
        subscribeToWebSocket("msg", (msg) => {
          if (msg.data.text != "Document has been successfully saved!") {
            toast.error("Error", {
              description: msg.data.text,
              duration: Infinity,
              closeButton: true
            })
          }
        })
        const pingSocket = () => {
          resolvedSocket.send(
            JSON.stringify({
              cmd: "ping",
              data: {}
            })
          )
        }
        setInterval(pingSocket, 30000)
        setAnnoSocket(socket)
      })
    })
  }, [session, annoSocket])

  return (
    <WebSocketContext.Provider value={{ annoSocketPromise: annoSocketPromise }}>
      {children}
    </WebSocketContext.Provider>
  )
}
