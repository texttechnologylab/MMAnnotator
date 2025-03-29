import { useEffect } from "react"
import {
  FieldPath,
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
  useWatch
} from "react-hook-form"

export function useDependentField<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  originField: FieldPath<TFieldValues>,
  dependentField: FieldPath<TFieldValues>,
  resetOnValue: string = "0",
  resetToValue: PathValue<TFieldValues, Path<TFieldValues>> = "" as PathValue<
    TFieldValues,
    Path<TFieldValues>
  >
) {
  const control = form.control
  const fieldValue = useWatch({ control, name: originField })

  useEffect(() => {
    if (fieldValue == resetOnValue) {
      form.setValue(dependentField, resetToValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldValue])

  const optional = !fieldValue || fieldValue === resetOnValue

  return { optional, fieldValue }
}
