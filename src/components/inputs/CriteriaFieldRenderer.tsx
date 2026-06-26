import type { Control, FieldPath, FieldValues } from "react-hook-form"
import { ButtonInput } from "@/components/inputs/ButtonInput"
import { SelectInput } from "@/components/inputs/SelectInput"
import { NumberInput } from "@/components/inputs/CustomInput"
import type { CriteriaButton, CriteriaField } from "@/lib/criteriaForm"

type CriteriaFieldRendererProps<T extends FieldValues> = {
  field: CriteriaField
  control: Control<T>
  buttons: CriteriaButton[]
}

export function CriteriaFieldRenderer<T extends FieldValues>({
  field,
  control,
  buttons
}: CriteriaFieldRendererProps<T>) {
  const name = `${field.id}.value` as FieldPath<T>

  if (field.type === "button") {
    return (
      <ButtonInput
        name={name}
        label={field.label}
        description={field.description}
        control={control}
        buttons={buttons}
      />
    )
  }

  if (field.type === "number") {
    return (
      <NumberInput
        name={name}
        label={field.label}
        description={field.description}
        control={control}
        inputProps={field.inputProps}
      />
    )
  }

  return (
    <SelectInput
      name={name}
      label={field.label}
      description={field.description}
      options={field.options}
      control={control}
    />
  )
}
