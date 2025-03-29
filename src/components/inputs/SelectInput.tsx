import { Control, FieldPath, FieldValues } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../shadcn/ui/select"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "../shadcn/ui/form"
import { InputLabel } from "./common"
import { memo } from "react"

export interface SelectInputProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
  disabled?: boolean
  optional?: boolean
  options: {
    value: string
    label: string
  }[]
}

export function SelectInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  optional,
  options
}: SelectInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={{ required: optional ? undefined : "This field is required" }}
      render={({ field }) => (
        <FormItem className={"mt-3"}>
          <InputLabel label={label} description={description} />
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={label} />
              </SelectTrigger>
            </FormControl>

            <SelectOptions options={options} />
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

const SelectOptions = memo(
  ({
    options
  }: {
    options: {
      value: string
      label: string
    }[]
  }) => {
    return (
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    )
  }
)
