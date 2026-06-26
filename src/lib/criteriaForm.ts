import type { InputHTMLAttributes } from "react"
import type { StyleVariant } from "@/components/inputs/common"
import type { BasicFormValue, BasicFormValues } from "@/lib/helpers"

export type CriteriaValueChoices = string[] | number[]

export type CriteriaOption = {
  label: string
  value: string
}

export type CriteriaButton = {
  label: string
  style: StyleVariant
  value: string
}

type CriteriaFieldBase = {
  id: string
  label: string
  description?: string
  ragLabel?: string
  ragValues?: CriteriaValueChoices
}

export type ButtonCriteriaField = CriteriaFieldBase & {
  type: "button"
}

export type SelectCriteriaField = CriteriaFieldBase & {
  type: "select"
  options: CriteriaOption[]
}

export type NumberCriteriaField = CriteriaFieldBase & {
  type: "number"
  inputProps?: InputHTMLAttributes<HTMLInputElement>
}

export type CriteriaField =
  | ButtonCriteriaField
  | SelectCriteriaField
  | NumberCriteriaField

export type CriteriaSection = {
  title: string
  fields: CriteriaField[]
}

export type CriteriaDescriptionMap = Record<
  string,
  { label: string; values: string[] | number[] }
>

export const flattenCriteriaFields = (sections: CriteriaSection[]) => {
  return sections.flatMap((section) => section.fields)
}

export const createDefaultValues = (
  sections: CriteriaSection[],
  defaultFormCategory: BasicFormValue
) => {
  const fields = flattenCriteriaFields(sections)

  return fields.reduce<BasicFormValues>((acc, field) => {
    acc[field.id] = defaultFormCategory
    return acc
  }, {})
}

const getFieldValues = (
  field: CriteriaField,
  defaultButtonValues: string[]
): string[] | number[] => {
  if (field.ragValues) {
    return field.ragValues
  }

  if (field.type === "select") {
    return field.options.map((option) => option.value)
  }

  if (field.type === "number") {
    return ["<number>"]
  }

  return defaultButtonValues
}

export const createCriteriaDescriptions = (
  sections: CriteriaSection[],
  defaultButtonValues: string[]
): CriteriaDescriptionMap => {
  const fields = flattenCriteriaFields(sections)

  return fields.reduce<CriteriaDescriptionMap>((acc, field) => {
    acc[field.id] = {
      label: field.ragLabel ?? field.label,
      values: getFieldValues(field, defaultButtonValues)
    }
    return acc
  }, {})
}
