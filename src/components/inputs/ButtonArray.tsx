import { Button, ButtonGroup } from "react-bootstrap"
import { ButtonVariant, Variant } from "react-bootstrap/esm/types"
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form"

export interface IButtonArrayProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  buttons: {
    label: string
    style: Variant
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
        <ButtonGroup>
          {buttons.map((button) => (
            <Button
              type="submit"
              variant={getVariantByStyle(button.style, value == button.value)}
              onClick={() => onChange(button.value)}
              key={button.label}
            >
              {button.label}
            </Button>
          ))}
        </ButtonGroup>
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
