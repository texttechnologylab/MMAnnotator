import type { ReactNode } from "react"
import { CardContent } from "@/components/shadcn/ui/card"
import { cn } from "@/lib/utils"

type QuestionAnswerProps = {
  question?: ReactNode
  answer?: ReactNode
  answerLabel: string
  className?: string
  answerClassName?: string
}

export function QuestionAnswer({
  question,
  answer,
  answerLabel,
  className,
  answerClassName
}: QuestionAnswerProps) {
  return (
    <CardContent className={className}>
      {question}
      <div className="mt-2">
        <em>{answerLabel}</em>
      </div>
      <div className={cn("mt-1 px-3 py-2 italic", answerClassName)}>
        {answer}
      </div>
    </CardContent>
  )
}
