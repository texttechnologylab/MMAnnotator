import { Control, FieldPath, FieldValues } from "react-hook-form"

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "../shadcn/ui/form"
import { InputLabel } from "./common"
import { Input } from "../shadcn/ui/input"
import { Textarea } from "../shadcn/ui/textarea"

export interface ITextInputProps<T extends FieldValues, I extends HTMLElement> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  info?: string
  description?: string
  disabled?: boolean
  optional?: boolean
  inputProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<I>, I>
}

export function NumberInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  optional,
  inputProps
}: ITextInputProps<T, HTMLInputElement>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={{ required: optional ? undefined : "This field is required" }}
      render={({ field }) => (
        <FormItem className={"mt-3"}>
          <InputLabel label={label} description={description} />
          <FormControl>
            <Input
              {...field}
              type="number"
              className="form-input"
              disabled={disabled}
              {...inputProps}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function TextInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  optional,
  inputProps
}: ITextInputProps<T, HTMLInputElement>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={{ required: optional ? undefined : "This field is required" }}
      render={({ field }) => (
        <FormItem className={"mt-3"}>
          <InputLabel label={label} description={description} />
          <FormControl>
            <Input
              {...field}
              type="text"
              className="form-input"
              disabled={disabled}
              {...inputProps}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function TextAreaInput<T extends FieldValues>({
  control,
  name,
  label,
  info,
  description,
  disabled,
  optional,
  inputProps
}: ITextInputProps<T, HTMLTextAreaElement>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={{ required: optional ? undefined : "This field is required" }}
      render={({ field }) => (
        <FormItem className={"mt-3"}>
          <InputLabel label={label} description={description} />
          {info && (
            <small>
              <br />
              {info}
              <br />
            </small>
          )}
          <FormControl>
            <Textarea {...field} disabled={disabled} {...inputProps} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
