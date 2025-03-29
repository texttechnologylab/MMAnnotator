import { useForm } from "react-hook-form"
import {
  Highlighter,
  PopoverChildrentype,
  SelectionProvider,
  useSelections
} from "react-selection-highlighter"
import { Card, CardContent, CardHeader } from "./shadcn/ui/card"
import { Button } from "./shadcn/ui/button"
import { useEffect } from "react"
import { CardTitle } from "react-bootstrap"
import { Label } from "./shadcn/ui/label"

export interface Selection {
  start: number
  end: number
  comment: string
}

export const SelectableText = (props: {
  text: string
  existingSelections?: Selection[]
  onSelectionChanged?: (selection: Selection[]) => void
}) => {
  return (
    <SelectionProvider>
      <SelectionProviderContent {...props} />
    </SelectionProvider>
  )
}

const SelectionProviderContent = ({
  text,
  existingSelections,
  onSelectionChanged
}: {
  text: string
  existingSelections?: Selection[]
  onSelectionChanged?: (selection: Selection[]) => void
}) => {
  const { selections, setSelections } = useSelections()

  useEffect(() => {
    if (!existingSelections) return
    const updatedSelections = [...selections]
    for (const selection of existingSelections) {
      if (
        selections.find(
          (s) => s.text == text.substring(selection.start, selection.end)
        )
      )
        continue

      updatedSelections.push({
        meta: JSON.stringify({
          startOffset: selection.start,
          endOffset: selection.end,
          start: "/text()[1]",
          end: "/text()[1]"
        }),
        text: text.substring(selection.start, selection.end),
        comment: selection.comment,
        className: "bg-red-300 select-none relative",
        endContainerText: text.substring(selection.end, selection.end),
        startContainerText: text.substring(selection.start, selection.start),

        id: Math.random().toString(36).substring(7)
      })
    }
    setSelections(updatedSelections)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  useEffect(() => {
    const annoSelections = []
    for (const selection of selections) {
      const metaJson = JSON.parse(selection.meta)
      annoSelections.push({
        start: metaJson.startOffset,
        end: metaJson.endOffset,
        comment: selection.comment
      })
    }
    onSelectionChanged?.(annoSelections)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections])

  return (
    <Highlighter
      selectionWrapperClassName="bg-red-300 select-none relative"
      minSelectionLength={1}
      htmlString={text}
      PopoverChildren={SelectionPopOver}
      onSelection={(sel) => console.log(sel)}
    />
  )
}

interface SelectionForm {
  comment: string
}

const SelectionPopOver: PopoverChildrentype = ({
  selection,
  removeSelection,
  updateSelection
}) => {
  const { register, handleSubmit } = useForm<SelectionForm>({
    defaultValues: { comment: selection.comment }
  })

  const onDelete = () => {
    removeSelection(selection)
  }

  const onSubmit = (data: SelectionForm) => {
    updateSelection(selection.id, { ...selection, comment: data.comment })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selection</CardTitle>
        <p>"{selection.text}"</p>
      </CardHeader>
      <CardContent>
        <Label>Comment</Label>
        <textarea {...register("comment")}></textarea>
        <Button type="submit" onClick={handleSubmit(onSubmit)}>
          Save
        </Button>
        <Button variant="destructive" type="button" onClick={onDelete}>
          Delete
        </Button>
      </CardContent>
    </Card>
  )
}
