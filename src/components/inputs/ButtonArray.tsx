import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues
} from "react-hook-form"
import { Button } from "../shadcn/ui/button"
import type { StyleVariant } from "./common"

export interface IButtonArrayProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  buttons: {
    label: string
    style: StyleVariant
    value: string
  }[]
}

export function ButtonArray<T extends FieldValues>({
  control,
  name,
  buttons
}: IButtonArrayProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <div className="inline-flex rounded-md shadow-sm">
          {buttons.map((button) => (
            <Button
              type="submit"
              variant={value == button.value ? button.style : "outline"}
              onClick={() => onChange(button.value)}
              key={button.label}
              className="rounded-none first:rounded-l-md last:rounded-r-md border-r-0 last:border-r"
            >
              {button.label}
            </Button>
          ))}
        </div>
      )}
    />
  )
}
