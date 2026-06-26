import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Form } from "@/components/shadcn/ui/form"
import { Button } from "@/components/shadcn/ui/button"
import {
  LoadingButton,
  type LoadingState
} from "@/components/shadcn/ui/loading-button"
import type { FieldValues, UseFormReturn } from "react-hook-form"

type RegionProps = {
  children: ReactNode
  className?: string
}

export function AnnotationPage({ children, className }: RegionProps) {
  return <div className={cn("w-full px-4", className)}>{children}</div>
}

export function AnnotationPageBody({ children, className }: RegionProps) {
  return (
    <div className={cn("flex flex-col lg:flex-row gap-4", className)}>
      {children}
    </div>
  )
}

export function AnnotationPageLeft({ children, className }: RegionProps) {
  return <div className={cn("w-full lg:w-1/2", className)}>{children}</div>
}

export function AnnotationPageRight({ children, className }: RegionProps) {
  return <div className={cn("w-full lg:w-1/2", className)}>{children}</div>
}

type AnnotationPageFormProps<T extends FieldValues> = {
  form: UseFormReturn<T>
  onSubmit: (data: T) => void
  loading: boolean
  saveState: LoadingState
  onBack: () => void
  children: ReactNode
  saveLabel?: string
  backLabel?: string
  formClassName?: string
  actionsClassName?: string
}

export function AnnotationPageForm<T extends FieldValues>({
  form,
  onSubmit,
  loading,
  saveState,
  onBack,
  children,
  saveLabel = "Save",
  backLabel = "Back",
  formClassName,
  actionsClassName
}: AnnotationPageFormProps<T>) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        hidden={loading}
        className={formClassName}
      >
        {children}
        <div className={cn("mt-3 mb-4", actionsClassName)}>
          <LoadingButton
            type="submit"
            loading={saveState}
            style={{ float: "right" }}
          >
            {saveLabel}
          </LoadingButton>
          <Button type="button" variant={"outline"} onClick={onBack}>
            {backLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
