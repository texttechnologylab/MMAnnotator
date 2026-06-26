import {
  findToolElementByKey,
  getDocumentText,
  getRawToolElements
} from "@/lib/helpers"
import type { CASDocument, ToolEntry } from "@/zustand/useDocument"

const ANSWER_TYPE = "org.texttechnologylab.annotation.core.Answer"
const QUESTION_TYPE = "org.texttechnologylab.annotation.core.Question"

export const getDemoImageQaElements = (document: CASDocument | undefined) => ({
  answers: getRawToolElements(document, ANSWER_TYPE),
  questions: getRawToolElements(document, QUESTION_TYPE)
})

export const getQuestionTextByKey = (
  document: CASDocument | undefined,
  questions: ToolEntry[],
  key: string
) => {
  if (!document) return undefined
  const question = findToolElementByKey(questions, key)
  if (!question) return undefined
  return getDocumentText(document, question)
}

export const getAnswerHtmlByKey = (
  document: CASDocument | undefined,
  answers: ToolEntry[],
  key: string
) => {
  if (!document) return undefined
  const answer = findToolElementByKey(answers, key)
  if (!answer) return undefined
  return getDocumentText(document, answer)
}
