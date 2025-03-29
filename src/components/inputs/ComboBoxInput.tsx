import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "../shadcn/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "../shadcn/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator
} from "../shadcn/ui/command"
import { cn } from "@/lib/utils"
import { Control, FieldPath, FieldValues } from "react-hook-form"
import { InputLabel } from "./common"
import { CommandList } from "cmdk"
import { FormField, FormItem } from "../shadcn/ui/form"

export interface ComboboxInputProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
  disabled?: boolean
  optional?: boolean
  groupedOptions: Record<
    string,
    {
      value: string
      label: string
    }[]
  >
  className?: string
}

export function ComboboxInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  optional,
  groupedOptions,
  className
}: ComboboxInputProps<T>) {
  const [open, setOpen] = useState(false)
  return (
    <FormField
      control={control}
      name={name}
      rules={{ required: optional ? undefined : "This field is required" }}
      render={({ field: { value, onChange } }) => (
        <FormItem className={className}>
          <Popover open={open} onOpenChange={setOpen}>
            <InputLabel label={label} description={description} />
            <div>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  disabled={disabled}
                  className="w-[100%] justify-between"
                >
                  {value
                    ? Object.values(groupedOptions)
                        .flat()
                        .find((option) => option.value === value)?.label
                    : "Select Option..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
            </div>
            <PopoverContent className="w-[100%] p-0">
              <Command>
                <CommandInput placeholder="Select..." />
                <CommandList className="max-h-[20vh] overflow-scroll">
                  <CommandEmpty>No option found.</CommandEmpty>
                  {Object.entries(groupedOptions).map(([key, values]) => {
                    return (
                      <div key={key}>
                        <CommandGroup heading={key.toUpperCase()}>
                          {values.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.label}
                              onSelect={(_currentValue) => {
                                onChange(
                                  option.value === value ? "" : option.value
                                )
                                setOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  value === option.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {option.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandSeparator />
                      </div>
                    )
                  })}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />
  )
}

export function ComboboxInputMult<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  optional,
  groupedOptions
}: ComboboxInputProps<T>) {
  const [open, setOpen] = useState(false)

  return (
    <FormField
      control={control}
      name={name}
      rules={{ required: optional ? undefined : "This field is required" }}
      render={({ field: { value, onChange } }) => (
        <FormItem>
          <Popover open={open} onOpenChange={setOpen}>
            <InputLabel label={label} description={description} />
            <div>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  disabled={disabled}
                  className="w-[100%] justify-between"
                >
                  {value.length > 0
                    ? Object.values(groupedOptions)
                        .flat()
                        .filter((option) => value.includes(option.value))
                        .map((option) => option.label)
                        .join(", ")
                    : "Select Option..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
            </div>
            <PopoverContent className="w-[100%] p-0">
              <Command>
                <CommandInput placeholder="Select..." />
                <CommandList className="max-h-[20vh] overflow-scroll">
                  <CommandEmpty>No option found.</CommandEmpty>
                  {Object.entries(groupedOptions).map(([key, values]) => {
                    return (
                      <div key={key}>
                        <CommandGroup heading={key.toUpperCase()}>
                          {values
                            .sort((value1, value2) =>
                              value.includes(value1.value) <
                              value.includes(value2.value)
                                ? 1
                                : -1
                            )
                            .map((option) => (
                              <CommandItem
                                key={option.value}
                                value={option.label}
                                onSelect={(_currentValue) => {
                                  onChange(
                                    value.includes(option.value)
                                      ? value.filter(
                                          (entry: any) => entry != option.value
                                        )
                                      : [...value, option.value]
                                  )
                                  setOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    value.includes(option.value)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {option.label}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                      </div>
                    )
                  })}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />
  )
}
