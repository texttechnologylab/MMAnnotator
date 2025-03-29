import {
  Control,
  Controller,
  FieldPathByValue,
  FieldValues
} from "react-hook-form"
import { Checkbox } from "../shadcn/ui/checkbox"

export function CheckBoxInput<T extends FieldValues>({
  control,
  name
}: {
  control: Control<T>
  name: FieldPathByValue<T, boolean>
}) {
  return (
    <Controller
      name={name}
      render={({ field }) => {
        return (
          <Checkbox
            checked={field.value}
            onCheckedChange={(checked) => field.onChange(checked)}
          />
        )
      }}
      control={control}
    />
  )
}
