import { UseFormGetValues, UseFormReset } from "react-hook-form"
import { CASDocument, ToolEntry } from "../zustand/useDocument"

export function projectStatusColor(status: string | null) {
  switch (status) {
    case "PREVIEW":
      return "warning"
    case "OPEN":
      return "success"
    case "CLOSED":
      return "danger"
    default:
      return "secondary"
  }
}

export function getCookie(key: string) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${key}=`)
  if (parts.length === 2) return parts.pop()!.split(";").shift()
}

export function setCookie(
  key: string,
  value: string,
  sameSite: boolean = false
) {
  if (sameSite) document.cookie = `${key}=${value}; path=/;`
  else document.cookie = `${key}=${value}; path=/;SameSite=Strict;`
}

/*
  BEGIN: DOCUMENT STUFF
*/

export function getDocumentText(document: CASDocument, entry: ToolEntry) {
  return document.text.slice(entry.features.begin, entry.features.end)
}

export function getSelectedTexts(
  document: CASDocument | undefined,
  type: string
): string[] {
  if (!document || !document.text) return []
  const text = document.text
  const data = []
  const elements = getRawToolElements(document, type)
  for (const element of elements) {
    data.push(text.slice(element.features.begin, element.features.end))
  }
  return data
}

export function getRawToolElements(
  document: CASDocument | undefined,
  type: string
): ToolEntry[] {
  if (!document || !document.text) return []
  if (!(type in document.toolElements)) {
    return []
  }
  const elements = document.toolElements[type]
  return Object.values(elements)
}

/*
 END: DOCUMENT STUFF
*/

/*
  BEGIN: FORM STUFF
*/

export type FormCASTypes = "org.texttechnologylab.annotation.core.Category"

export type BasicFormValue = {
  value: string
  type: FormCASTypes
  addr?: number
}

export type BasicFormValues = {
  [key: string]: BasicFormValue
}

export const DefaultFormCategory: BasicFormValue = {
  value: "",
  type: "org.texttechnologylab.annotation.core.Category"
}

export const updateForm = <FV extends BasicFormValues>(
  document: CASDocument,
  getValues: UseFormGetValues<FV>,
  reset: UseFormReset<FV>
) => {
  const entries = getRawToolElements(
    document,
    "org.texttechnologylab.annotation.core.Category"
  )
  const resetWith = {} as BasicFormValues
  for (const entry of entries) {
    resetWith[entry.features.key] = {
      value: entry.features.value ?? "",
      type: "org.texttechnologylab.annotation.core.Category",
      addr: entry._addr
    }
  }

  const currentValues = getValues()

  const newValues = {} as FV
  for (const key of Object.keys(currentValues)) {
    const value = currentValues[key]
    if (value.value != "") (newValues as BasicFormValues)[key] = value
  }

  reset({ ...currentValues, ...resetWith, ...newValues })
}
/*
 END: FORM STUFF
*/

export function createViewFromUserName(userName: string) {
  return `view_user_${userName}`
}

export function containsAll<T>(a1: T[], a2: T[]) {
  return a2.every((v) => a1.includes(v))
}

export function sameElements<T>(a1: T[], a2: T[]) {
  return containsAll(a2, a1) && containsAll(a1, a2)
}

export function chunkArray<T>(a1: T[], chunkSize: number) {
  const chunks = []
  for (let i = 0; i < a1.length; i += chunkSize) {
    chunks.push(a1.slice(i, i + chunkSize))
  }
  return chunks
}
