import { useEffect, useState, useRef } from "react"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { Row, Col } from "react-bootstrap"
import { LoadingButton, LoadingState } from "./shadcn/ui/loading-button"
import { useDocumentStore } from "@/zustand/useDocument"
import { SubmitHandler, useForm } from "react-hook-form"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "./shadcn/ui/resizable"
import { Textarea } from "./shadcn/ui/textarea"

type ChatMessage = {
  timestamp: number
  role: "user" | "assistant" | "system"
  text: string
}

type UCESubCommands = "message_update" | "message" | "open"
type UCERagCommandMessageUpdate = {
  data: {
    message: string
    done?: boolean
  }
}
type UCERagCommandOpen = {
  data: {
    message: string
    chatId?: string
  }
}
type UCERagCommandMessage = {
  data: {
    message: string
    casId?: string
  }
}

export type UCERagCommand<SUBCMD extends UCESubCommands> =
  (SUBCMD extends "message_update"
    ? UCERagCommandMessageUpdate
    : SUBCMD extends "open"
      ? UCERagCommandOpen
      : SUBCMD extends "message"
        ? UCERagCommandMessage
        : never) & {
    cmd: "uce_rag"
    subcmd: SUBCMD
  }

const enhanceMessage = (message: any) => {
  // try to split <think> tags
  // TODO nicer styling?
  // TODO toggle visibility of think parts for the user
  return message.replace(
    /<think>([\s\S]*?)<\/think>/g,
    (_match: any, content: any) => {
      const randomId = Math.random().toString(36).substring(2, 15)
      const escapedContent = `&lt;think&gt;<br/>${content}<br/>&lt;/think&gt;`
      return `<div class="text-muted mb-1 small" id="${randomId}">${escapedContent}</div>`
    }
  )
}

const renderMessage = (message: string) => {
  const final_message = enhanceMessage(message)
  // console.log("final_message", final_message)

  return <Markdown rehypePlugins={[rehypeRaw]}>{final_message}</Markdown>
}

const recommendedModels: Record<string, string> = {
  core_student_rating: "ollama/qwen3:8b-q4_K_M",
  core_b04_classification: "ollama/qwen2.5vl:7b-q4_K_M"
}

export const RagBot = ({
  casId,
  //TODO: Ideally we create a cache or a store to retrieve these properties
  ragMessage,
  selectedTask,
  proband,
  setCriteriaValue,
  criteriaDescriptions,
  casTextOrder,
  promptType
}: {
  casId: string
  ragMessage: (command: string, msg: Record<string, any>) => void
  selectedTask?: string
  proband?: string
  setCriteriaValue: any
  criteriaDescriptions: Record<
    string,
    { label: string; values: string[] | number[] }
  >
  casTextOrder?: any
  promptType: string
}) => {
  const baseRecommendedModel = "ollama/qwen3:8b-q4_K_M"
  const recommendedModel = recommendedModels[promptType] || baseRecommendedModel

  const [isOpen, setIsOpen] = useState<boolean>(false)

  const [chatModel, setChatModel] = useState(recommendedModel)
  const [chatId, setChatId] = useState<string | undefined>(undefined)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const [loading, setLoading] = useState<LoadingState>(LoadingState.NEUTRAL)

  const { subscribeToWebSocket, clearListeners } = useDocumentStore()
  // use refs as we do not want to resubscribe to websocket events everytime a prop changes
  const selectedTaskRef = useRef(selectedTask)
  const setCriteriaValueRef = useRef(setCriteriaValue)

  const scrollRef = useRef<HTMLLIElement>(null)

  const { register, handleSubmit, reset } = useForm<{ message: string }>()

  useEffect(() => {
    selectedTaskRef.current = selectedTask
  }, [selectedTask])

  useEffect(() => {
    setCriteriaValueRef.current = setCriteriaValue
  }, [setCriteriaValue])

  /*useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end"
      })
    }
  }, [messages])*/

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: "instant",
        block: "end"
      })
    }
  }, [isOpen])

  function parseMessage(
    message: string,
    is_streaming: boolean = false,
    is_last_message: boolean = true
  ) {
    let message_final: string = message

    // We have to differentiate if this is a streamed message. If so, we will update the current message object and
    // not create a new one, and we will skip the tool action handling.
    if (is_last_message) {
      // We might want to change the message before showing to the user...
      let tool_action = false

      // console.log("message", message)

      // TODO better handle this in the regex
      // remove code blocks if the model returns them
      message_final = message_final.replace(/```json/g, "")
      message_final = message_final.replace(/```/g, "")

      // does the message contain a "tool action"?
      if (message.includes("{") && message.includes("}")) {
        // get all possible json blocks
        // NOTE we assume here, that this is a simple json object with exactly one pair of curly braces
        const jsonRegex = /{[\s\S]*?}/g
        const matches = [...message.matchAll(jsonRegex)]
        for (const match of matches) {
          const jsonString = match[0]
          try {
            // try to parse part of the message as JSON
            const jsonData = JSON.parse(jsonString)

            // find begin and end of JSON object
            // const jsonStart = message.indexOf("{")
            // const jsonEnd = message.lastIndexOf("}")
            // const jsonString = message.substring(jsonStart, jsonEnd + 1)
            // console.log("json data", jsonString)
            // const jsonData = JSON.parse(jsonString)
            if ("command" in jsonData && jsonData.command === "edit_field") {
              const currentSelectedTask = selectedTaskRef.current
              const currentSetCriteriaValue = setCriteriaValueRef.current

              // TODO for now we just append the context info ourselves to keep the system prompt simpler
              // TODO this must be configurable, for now, 2 methods
              // TODO handle disabled criteria?
              let criteria_id = null
              if (currentSelectedTask) {
                // A02 ratings, e.g. "conclusion_f.value"
                criteria_id =
                  jsonData.criteria_id.toLowerCase() +
                  "_" +
                  currentSelectedTask +
                  ".value"
              } else {
                // B04 categories, e.g. "A4.value"
                criteria_id = jsonData.criteria_id + ".value"
              }

              const criteria_value = jsonData.value.toString().toLowerCase()
              // console.log("setting criteria value", criteria_id, criteria_value)
              currentSetCriteriaValue(criteria_id, criteria_value)

              // message_final = message.slice(0, jsonStart) + message.slice(jsonEnd)
              message_final = message_final.replace(jsonString, "")
              if (!tool_action) {
                message_final += `<ul class="mt-2 list-group small">`
                tool_action = true
              }
              message_final += `<li class="list-group-item list-group-item-success"><input class="form-check-input me-1" type="checkbox" checked="checked" disabled="disabled"> Setting criteria <strong>${criteria_id}</strong> to <strong>${criteria_value}</strong></li>`
              // console.log("final message", message_final)
            }
          } catch (e) {
            // TODO handle case where there seems to be json but it fails to parse
            console.error(e)
          }
        }
      }
      if (tool_action) {
        message_final += `</ul>`
      }
      const msg = {
        timestamp: Date.now(),
        role: "assistant",
        text: message_final
      } as ChatMessage
      if (is_streaming) {
        setMessages((prevState) => {
          const newMessages = [...prevState]
          newMessages[newMessages.length - 1] = msg
          return newMessages
        })
      } else {
        setMessages((prevState) => [...prevState, msg])
      }
    } else {
      // get last message and update text
      let msg = messages[messages.length - 1]
      if (msg) {
        msg.text = message_final
      } else {
        msg = {
          timestamp: Date.now(),
          role: "assistant",
          text: message_final
        } as ChatMessage
      }
      setMessages((prevState) => {
        const newMessages = [...prevState]
        newMessages[newMessages.length - 1] = msg
        return newMessages
      })
    }
  }

  function handleRagMessage(response: UCERagCommand<UCESubCommands>) {
    // console.log("handleRagMessage", response)
    if ("subcmd" in response) {
      switch (response.subcmd) {
        case "open": {
          const openResponse = response as UCERagCommand<"open">
          setChatId(openResponse.data.chatId)
          parseMessage(openResponse.data.message)
          setLoading(LoadingState.NEUTRAL)
          break
        }
        case "message": {
          parseMessage(response.data.message)
          setLoading(LoadingState.NEUTRAL)
          break
        }
        case "message_update": {
          const messageUpdatedResponse =
            response as UCERagCommand<"message_update">
          // message updates are being received as a stream, only run the tools and update loading if this is the last message
          const is_last_message = messageUpdatedResponse.data.done
          parseMessage(
            messageUpdatedResponse.data.message,
            true,
            is_last_message
          )
          if (is_last_message) {
            setLoading(LoadingState.NEUTRAL)
          }
          break
        }
        default: {
          console.error("Unknown uce_rag subcmd", response.subcmd)
          setLoading(LoadingState.ERROR)
        }
      }
    }
  }

  useEffect(() => {
    setMessages([]) // reset messages when casId changes
    setChatId(undefined) // reset chatId when casId changes
    setLoading(LoadingState.NEUTRAL)
  }, [selectedTask])

  useEffect(() => {
    clearListeners("ragBot")
    subscribeToWebSocket("uce_rag", handleRagMessage, "ragBot")
  }, [])

  const onSubmit: SubmitHandler<{ message: string }> = (formData) => {
    const streaming = true
    setLoading(LoadingState.LOADING)

    const next_messages: ChatMessage[] = [
      {
        timestamp: Date.now(),
        role: "user",
        text: formData.message
      }
    ]
    ragMessage("message", {
      chatId: chatId,
      message: formData.message,
      extraId: selectedTask,
      stream: streaming
    })
    if (streaming) {
      next_messages.push({
        timestamp: Date.now(),
        role: "assistant",
        text: ""
      })
    }

    setMessages((prevState) => [...prevState, ...next_messages])
    reset()
  }

  return (
    <div>
      {!isOpen && casId && (
        <div>
          <button
            onClick={(e) => {
              setIsOpen(true)
              e.preventDefault()
            }}
            className={
              "btn btn-primary text-center right-3 bottom-2 position-fixed d-flex flex-column align-items-center justify-content-center"
            }
            style={{
              borderRadius: "100%",
              border: "2px solid white",
              width: "65px",
              height: "65px",
              boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.2)",
              zIndex: 2000
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
              />
            </svg>
            Bot
          </button>
        </div>
      )}
      {isOpen && casId && (
        <ResizablePanelGroup
          direction="horizontal"
          className="fixed h-full border-r-4 z-10 top-0 mb-20  pointer-events-none"
        >
          <ResizablePanel
            minSize={2}
            defaultSize={50}
            className=" pointer-events-none"
          />
          <ResizableHandle withHandle className="mb-24 mt-1" />
          <ResizablePanel
            minSize={12}
            defaultSize={50}
            className="bg-slate-50 mb-20 p-3 border-solid border-gray-700 border rounded-md drop-shadow-xl pointer-events-auto"
          >
            <div
              className={
                "flex flex-row align-items-start z-20 border-b drop-shadow-md "
              }
            >
              <div>
                <strong>UCE</strong> RAG Bot
                <span className={"ml-2 text-muted small"}>
                  {proband && (
                    <span>
                      Proband <strong>{proband}</strong>
                    </span>
                  )}{" "}
                  {selectedTask && (
                    <span>
                      Kontext <strong>{selectedTask.toUpperCase()}</strong>
                    </span>
                  )}
                </span>
              </div>
              <button
                onClick={(e) => {
                  setIsOpen(false)
                  e.preventDefault()
                }}
                className={"btn btn-dark btn-sm ms-auto rounded"}
              >
                <span className={"font-bold"} style={{ fontSize: "110%" }}>
                  &times;
                </span>
              </button>
            </div>
            <div className="overflow-scroll overflow-x-hidden h-[100%] pb-10">
              {!chatId && casId && setCriteriaValue && (
                <Row>
                  <Col xs={6}>
                    {/* TODO load available models from UCE */}
                    <select
                      className="form-select"
                      value={chatModel}
                      onChange={(e) => setChatModel(e.target.value)}
                    >
                      <option value="ollama/qwen3:8b-q4_K_M">
                        Qwen 3 (8b) - recommended for text
                      </option>
                      <option value="ollama/qwen2.5vl:7b-q4_K_M">
                        Qwen 2.5 VL (7b) - recommended for text and images
                      </option>
                    </select>
                  </Col>
                  <Col xs={6}>
                    <LoadingButton
                      loading={loading}
                      className={"btn btn-primary"}
                      onClick={() => {
                        // TODO get from project
                        // const systemPrompt = ""
                        // TODO get from project
                        // const systemMessage = ""
                        setLoading(LoadingState.LOADING)
                        ragMessage("open", {
                          modelName: chatModel,
                          criteriaDescription: criteriaDescriptions,
                          casTextOrder: casTextOrder,
                          extraId: selectedTask,
                          promptType: promptType
                        })
                      }}
                    >
                      Start Chat
                    </LoadingButton>
                  </Col>
                </Row>
              )}
              <ul>
                {messages.map((message, index) => {
                  return (
                    <li
                      key={
                        "uce_rag_bot_" +
                        message.role +
                        "_" +
                        message.timestamp +
                        "_" +
                        index
                      }
                      className={
                        (message.role === "user"
                          ? "ms-auto text-end"
                          : "text-start") + " card mt-2"
                      }
                      style={{
                        width: "80%"
                      }}
                    >
                      <div className={"card-body p-2"}>
                        <div className={"card-title"}>
                          <span className={"text-muted small"}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                          <br />
                        </div>
                        <div className={"card-text"}>
                          {renderMessage(message.text)}
                        </div>
                      </div>
                    </li>
                  )
                })}
                <li ref={scrollRef}></li>
              </ul>
              {chatId && (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className={"ms-auto mt-4 row justify-content-end"}>
                    <div className={"col-auto"}>
                      <Textarea
                        className="w-[500px]"
                        spellCheck
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.shiftKey) {
                            e.preventDefault()
                            handleSubmit(onSubmit)(e)
                          }
                        }}
                        {...register("message")}
                      />
                      <div
                        className="text-gray-400"
                        style={{
                          textAlign: "right",
                          fontSize: "65%"
                        }}
                      >
                        Hint: Submit with <code>Shift+Enter</code>
                      </div>
                    </div>

                    <div className={"col-auto"}>
                      <LoadingButton loading={loading} type="submit">
                        Send
                      </LoadingButton>
                    </div>
                  </div>
                </form>
              )}
              {chatId && (
                <div className={"ms-auto mt-1 text-muted text-xs text-center"}>
                  <a
                    href="#"
                    onClick={(e) => {
                      setIsOpen(false)
                      e.preventDefault()
                    }}
                    className={"btn btn-link btn-sm"}
                    style={{
                      fontSize: "80%"
                    }}
                  >
                    Close chat window
                  </a>
                  <a
                    href="#"
                    onClick={(e) => {
                      setMessages([])
                      setChatId(undefined)
                      setLoading(LoadingState.NEUTRAL)
                      e.preventDefault()
                    }}
                    className={"btn btn-link btn-sm"}
                    style={{
                      fontSize: "80%"
                    }}
                    title={"UCE session: " + chatId}
                  >
                    Start a new chat
                  </a>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  )
}
