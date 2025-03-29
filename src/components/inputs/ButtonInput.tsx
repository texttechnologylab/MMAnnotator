import { Control, FieldPath, FieldValues } from "react-hook-form"

import { FormField, FormItem } from "../shadcn/ui/form"
import { InputLabel } from "./common"
import { Button, ButtonGroup } from "react-bootstrap"
import { ButtonVariant, Variant } from "react-bootstrap/esm/types"

export interface ITextInputProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  info?: string
  buttons: {
    label: string
    style: Variant
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
          <br />
          {info && (
            <small>
              {info}
              <br />
            </small>
          )}
          <ButtonGroup>
            {buttons.map((button) => (
              <Button
                type="button"
                variant={getVariantByStyle(button.style, value == button.value)}
                onClick={() => onChange(button.value)}
                key={button.label}
                disabled={disabled}
              >
                {button.label}
              </Button>
            ))}
          </ButtonGroup>
        </FormItem>
      )}
    />
  )
}

function getVariantByStyle(style: Variant, primary: boolean): ButtonVariant {
  switch (style) {
    case "secondary":
      return primary ? "secondary" : "outline-secondary"
    case "danger":
      return primary ? "danger" : "outline-danger"
    case "warning":
      return primary ? "warning" : "outline-warning"
    case "dark":
      return primary ? "dark" : "outline-dark"
    case "light":
      return primary ? "light" : "outline-light"
    case "info":
      return primary ? "info" : "outline-info"
    default:
      return primary ? "primary" : "outline-primary"
  }
}
