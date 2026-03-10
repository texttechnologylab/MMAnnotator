import { LoadingState } from "@/components/shadcn/ui/loading-button"
import type { DocumentData } from "@/lib/resources/repository"

export interface FileData {
  name: string
  description: string
  size: number
  type: string
  progress: LoadingState
  file: File
}

export type DocumentDataValid = DocumentData & { valid: LoadingState }

export interface UploadFormData {
  repository: string
  duplicates: boolean
}
