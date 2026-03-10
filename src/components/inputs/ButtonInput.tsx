import type { Control, FieldPath, FieldValues } from "react-hook-form"

import { FormField, FormItem } from "../shadcn/ui/form"
import { InputLabel } from "./common"
import { Button } from "../shadcn/ui/button"

type StyleVariant =
  | "link"
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"

export interface ITextInputProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  info?: string
  buttons: {
    label: string
    style: StyleVariant
    value: string
  }[]
  description?: string
  disabled?: boolean
  optional?: boolean
}

export function ButtonInput<T extends FieldValues>({
  control,
  name,
  label,
  info,
  description,
  disabled,
  buttons,
  optional
}: ITextInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={{ required: optional ? undefined : "This field is required" }}
      render={({ field: { onChange, value } }) => (
        <FormItem>
          <InputLabel label={label} description={description} />
          {info && (
            <small>
              {info}
              <br />
            </small>
          )}
          <div className="inline-flex rounded-md shadow-sm mt-1">
            {buttons.map((button) => (
              <Button
                type="button"
                variant={value == button.value ? button.style : "outline"}
                onClick={() => onChange(button.value)}
                key={button.label}
                disabled={disabled}
                className="rounded-none first:rounded-l-md last:rounded-r-md border-r-0 last:border-r"
              >
                {button.label}
              </Button>
            ))}
          </div>
        </FormItem>
      )}
    />
  )
}
