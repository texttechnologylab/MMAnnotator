"use client"

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/shadcn/ui/button"
import { Calendar } from "@/components/shadcn/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/shadcn/ui/popover"
import { FormField, FormItem, FormMessage } from "../shadcn/ui/form"
import { Control, FieldPath, FieldValues } from "react-hook-form"
import { InputLabel } from "./common"

export interface ITextInputProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  description?: string
  optional?: boolean
  label: string
}

export function DateInput<T extends FieldValues>({
  control,
  name,
  description,
  optional,
  label
}: ITextInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={{ required: optional ? undefined : "This field is required" }}
      render={({ field }) => (
        <FormItem className="flex flex-col mt-3">
          <InputLabel label={label} description={description} />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[100%] justify-start text-left font-normal",
                  !field.value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {field.value ? (
                  format(field.value, "PPP")
                ) : (
                  <span>{label}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
