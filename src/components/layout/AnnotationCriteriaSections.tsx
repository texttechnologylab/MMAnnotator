import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/shadcn/ui/card"
import { CriteriaFieldRenderer } from "@/components/inputs/CriteriaFieldRenderer"
import type { CriteriaButton, CriteriaSection } from "@/lib/criteriaForm"
import type { Control, FieldValues } from "react-hook-form"

type AnnotationCriteriaSectionsProps<T extends FieldValues> = {
  sections: CriteriaSection[]
  control: Control<T>
  buttons: CriteriaButton[]
  loading: boolean
  userName?: string | null
}

export function AnnotationCriteriaSections<T extends FieldValues>({
  sections,
  control,
  buttons,
  loading,
  userName
}: AnnotationCriteriaSectionsProps<T>) {
  return (
    <>
      {sections.map((section, index) => (
        <Card
          key={section.title}
          style={{ opacity: loading ? "0.5" : "1" }}
          className={index === 0 ? undefined : "mt-2"}
        >
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {index === 0 && userName && (
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor=":r385:-form-item"
              >
                <p>
                  User: <strong className={"ml-1"}>{userName}</strong>{" "}
                  <span className={"ml-2 text-muted-foreground small"}>
                    (will be filled in automatically)
                  </span>
                </p>
              </label>
            )}
            {section.fields.map((field) => (
              <CriteriaFieldRenderer
                key={field.id}
                field={field}
                control={control}
                buttons={buttons}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </>
  )
}
