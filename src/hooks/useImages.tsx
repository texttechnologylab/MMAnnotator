import { useANNO } from "@/lib/annotator/AnnoLib"
import { getRawToolElements } from "@/lib/helpers"
import { ToolEntry, useDocumentStore } from "@/zustand/useDocument"
import { useEffect, useState } from "react"

export const useImages = (casId: string, pageSize?: number) => {
  const { openToolSeg } = useANNO()
  const { getById, subscribeToWebSocket, clearListeners } = useDocumentStore()

  const [page, setPage] = useState(1)
  const [reachedEnd, setReachedEnd] = useState(false)
  const nextImages = () => {
    const document = getById(casId)
    if (!document || reachedEnd) return
    openToolSeg(document, "Time", page, pageSize)
    setPage(page + 1)
  }

  const [images, setImages] = useState<ToolEntry[]>([])

  const onTool = (msg: any) => {
    if (
      Object.keys(
        msg.data.toolElements[
          "org.texttechnologylab.annotation.AnnotationComment"
        ]
      ).length < (pageSize ?? 10)
    ) {
      setReachedEnd(true)
    }
    updateImages()
  }

  const updateImages = () => {
    const document = getById(casId)
    if (document == null) return

    const indicesMap = getRawToolElements(
      document,
      "org.texttechnologylab.annotation.AnnotationComment"
    )
      .filter((c) => c.features.key === "core_image_index")
      .reduce(
        (map, obj) => {
          map[obj.features.reference] = Number(obj.features.value)
          return map
        },
        {} as Record<string, number>
      )

    const images = getRawToolElements(
      document,
      "org.texttechnologylab.annotation.AnnotationComment"
    )
      .filter((c) => c.features.key === "core_image_image/png")
      .sort((a, b) => {
        return indicesMap[a._addr] - indicesMap[b._addr]
      })

    setImages(images)
  }

  useEffect(() => {
    updateImages()
    clearListeners("images" + casId)
    subscribeToWebSocket("open_tool", onTool, "images" + casId)
    subscribeToWebSocket("open_tool_seg", onTool, "images" + casId)
  }, [])

  return { nextImages, images, reachedEnd }
}
