import { Control, Controller, FieldPath, FieldValues } from "react-hook-form"
import { Switch } from "../shadcn/ui/switch"

export function SwitchInput<T extends FieldValues>({
  control,
  name
}: {
  control: Control<T>
  name: FieldPath<T>
}) {
  return (
    <Controller
      name={name}
      render={({ field }) => {
        return (
          <Switch
            checked={field.value == "true"}
            onCheckedChange={(checked) => field.onChange(checked.toString())}
          />
        )
      }}
      control={control}
    />
  )
}
