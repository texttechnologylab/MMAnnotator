import { useEffect, useState } from "react"
import { Col, Container, Row } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { SelectInput } from "../../../components/inputs/SelectInput"
import { useUser } from "../../../zustand/useUser"
import WithAuth from "../../../components/wrappers/WithAuth"
import { Form } from "@/components/shadcn/ui/form"
import { Button } from "@/components/shadcn/ui/button"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/shadcn/ui/card"
import {
  LoadingButton,
  LoadingState
} from "@/components/shadcn/ui/loading-button"
import { useLocation, useNavigate } from "react-router-dom"
import {
  DefaultFormCategory,
  getDocumentText,
  getRawToolElements,
  updateForm
} from "@/lib/helpers"
import { useDocumentStore } from "@/zustand/useDocument"
import { DynamicImageList } from "@/components/display/ImageList"
import { LoadingStateDrawer } from "@/components/display/LoadingStateDrawer"
import { useProjectId } from "@/hooks/useProjectId"
import { useCasSeg } from "@/hooks/useCasSeg"
import { RagBot } from "@/components/RagBot.tsx"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/shadcn/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { ButtonInput } from "@/components/inputs/ButtonInput"
import { NumberInput } from "@/components/inputs/CustomInput"

const defaultValues = {
  K1: DefaultFormCategory,
  K2: DefaultFormCategory,
  K4: DefaultFormCategory,
  K11: DefaultFormCategory,
  K16: DefaultFormCategory,
  K17: DefaultFormCategory,
  A3: DefaultFormCategory,
  A4: DefaultFormCategory,
  C1: DefaultFormCategory,
  X1: DefaultFormCategory
}

type FormValues = typeof defaultValues

const buttons = [
  {
    label: "Ja",
    style: "dark",
    value: "yes"
  },
  {
    label: "Nein",
    style: "dark",
    value: "no"
  }
]

const sourceNumberInputProps = {
  min: 0,
  step: 1,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur()
}
const yesNoValues = ["yes", "no"]
const criteriaDescriptionsShort: Record<
  string,
  { label: string; values: string[] | number[] }
> = {
  K1: {
    label: "K1 Was the task completed according to the instructions?",
    values: yesNoValues
  },
  K2: {
    label: "K2 Green sauce contains borage as a critical ingredient.",
    values: yesNoValues
  },
  K4: {
    label: "K4 There may be effects on health.",
    values: yesNoValues
  },
  K11: {
    label:
      "K11 Task Fulfillment\n" +
      "0 - Topic missed, the answer deals with the general context but misses the question.\n" +
      "1 - The answer addresses the topic but does not reach a conclusion as required by the task.\n" +
      "2 - The task was answered as required by the question.",
    values: [0, 1, 2]
  },
  K16: {
    label:
      "K16 Number of sources with a traceable connection to a specific content relevant to the statement (argument, information, etc.)",
    values: ["<number>"]
  },
  K17: {
    label:
      "K17 Coherence\n" +
      "0 - The statement is not coherent at all. It contains only unrelated statements/information or is so short that no connections can be made.\n" +
      "1 - The statement is hardly coherent. It contains partially connected statements/information, but also unrelated elements or internal contradictions.\n" +
      "2 - The statement is largely coherent. The transitions between individual statements/information are mostly connected, but there are some repetitions and/or possible leaps in thought.\n" +
      "3 - The statement is coherent. It has a consistently logical structure, with the presented information/arguments building on each other.",
    values: [0, 1, 2, 3]
  },
  A3: {
    label:
      "A3 Type of Source\n" +
      " * 1 - Article from an online news medium\n" +
      " * 2 - Scientific journal article\n" +
      " * 3 - Entry in a scientific database (Pubmed, Amboss)\n" +
      " * 4 - Company website (commercial, e.g., also health insurance as a special case)\n" +
      " * 5 - Website of (political) interest groups/associations (e.g., Federal Association for Wind Energy, employer or employee associations, trade unions, parties, NGOs, politicians)\n" +
      " * 6 - Website of authorities (e.g., Federal Office for Radiation Protection, RKI)\n" +
      " * 7 - Entry in an online encyclopedia (e.g., Wikipedia)\n" +
      " * 8 - User contribution (e.g., in forums, letters to the editor, blogs by private individuals)\n" +
      " * 99 - Other source",
    values: [1, 2, 3, 4, 5, 6, 7, 8, 99]
  },
  A4: {
    label:
      "A4 Visual Elements\n" +
      " * 0 - No image/graphic present\n" +
      " * 1 - Photograph/illustration\n" +
      " * 2 - (Info-)graphic\n" +
      " * 3 - Both (photograph/illustration and infographic)",
    values: [0, 1, 2, 3]
  },
  C1: {
    label:
      "C1 Objectivity\n" +
      " * 1 - Clear objective language\n" +
      " * 2 - Rather objective language\n" +
      " * 3 - Objective and emotional language about equally weighted\n" +
      " * 4 - Rather emotional language\n" +
      " * 5 - Clear emotional language",
    values: [1, 2, 3, 4, 5]
  },
  X1: {
    label:
      "X1 The student's response is partially based on the source visible in the image.",
    values: yesNoValues
  }
}

export type PageProps = {
  options?: Record<string, unknown>
}

const casTextOrder: any = [
  {
    type: "org.texttechnologylab.annotation.core.Question",
    key: "question_scenario_text",
    prefix: "Szenario: "
  },
  {
    type: "org.texttechnologylab.annotation.core.Question",
    key: "Question1",
    prefix: "Frage: "
  },
  {
    type: "org.texttechnologylab.annotation.core.Answer",
    key: "Answer1",
    prefix: "Antwort: "
  },
  {
    type: "org.texttechnologylab.annotation.core.Question",
    key: "Question2",
    prefix: "Frage: "
  },
  {
    type: "org.texttechnologylab.annotation.core.Answer",
    key: "Answer2",
    prefix: "Antwort: "
  },
  {
    type: "org.texttechnologylab.annotation.core.Question",
    key: "Question3",
    prefix: "Frage: "
  },
  {
    type: "org.texttechnologylab.annotation.core.Answer",
    key: "Answer3",
    prefix: "Antwort: "
  },
  {
    type: "org.texttechnologylab.annotation.AnnotationComment",
    key: "core_image_image/png"
  },
  {
    type: "text",
    text:
      "Die URL für die zu sehenden Bilder ist: https://www.ndr.de/ratgeber/kochen/zutaten/Borretsch,zutat1348.html \n" +
      "Die Antwort des Studenten ist textlich vorgegeben. Die Bilder enthalten nicht die Antwort des Studenten."
  }
]

export function Page(props: PageProps) {
  const additional_ta_options: Record<string, unknown> | undefined =
    "options" in props ? props["options"] : undefined

  const navigate = useNavigate()
  const { userName } = useUser()

  const { search } = useLocation()
  const { projectId } = useProjectId()
  const [loading, setLoading] = useState(true)
  const [saveButtonState, setSaveButtonState] = useState<LoadingState>(
    LoadingState.NEUTRAL
  )

  const form = useForm<FormValues>({
    defaultValues: defaultValues
  })
  const { control, handleSubmit, reset, getValues, setValue } = form

  const { annoSocket, setAdditionalOptionsById } = useDocumentStore()

  const casId = new URLSearchParams(search).get("id") || ""

  const {
    document,
    submitChanges,
    subscribeToWebSocket,
    ragMessage,
    loadingState
  } = useCasSeg(casId)

  // TODO: Create a wrapper for this stuff in useCas
  useEffect(() => {
    subscribeToWebSocket("msg", messageCallback, casId)
    subscribeToWebSocket("open_tool", openToolCallback, casId)
    subscribeToWebSocket("on_close", () =>
      setSaveButtonState(LoadingState.ERROR)
    )
    setAdditionalOptionsById(casId, {
      ...additional_ta_options
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annoSocket])

  useEffect(() => {
    if (!document) return
    updateForm(document, getValues, reset)
  }, [document, getValues, reset])

  const openToolCallback = (_msg: any) => {
    setLoading(false)
  }

  const messageCallback = (_msg: any) => {
    if (_msg.data.text == "Document has been successfully saved!") {
      setSaveButtonState(LoadingState.SUCCESS)
      toast.success("Document saved successfully!")
    } else if (_msg.data.text) {
      setSaveButtonState(LoadingState.ERROR)
    }
  }

  const onSubmit = (data: FormValues) => {
    // TODO add this before save already?
    setAdditionalOptionsById(casId, {
      ...additional_ta_options
    })

    setSaveButtonState(LoadingState.LOADING)
    submitChanges(data)
  }

  const rawAnswers = getRawToolElements(
    document == null ? undefined : document,
    "org.texttechnologylab.annotation.core.Answer"
  )

  const rawQuestions = getRawToolElements(
    document == null ? undefined : document,
    "org.texttechnologylab.annotation.core.Question"
  )

  const findAnswer = (key: string) => {
    return rawAnswers.find((answer) => answer.features.key === key)
  }

  const findAnswerText = (key: string) => {
    const answer = findAnswer(key)
    if (answer && document) {
      let text = getDocumentText(document, answer)
      if (text == "-9" || text == "-9.0") {
        text = "<span style='text-muted'><em>[nicht beantwortet]</em></span>"
      }
      if (text) {
        // replace "\n" with "<br />" for HTML rendering
        text = text.replace(/\n/g, "<br />")
      }
      return <div dangerouslySetInnerHTML={{ __html: text }}></div>
    }
  }

  const findQuestion = (key: string) => {
    return rawQuestions.find((question) => question.features.key === key)
  }

  const findQuestionText = (key: string) => {
    const question = findQuestion(key)
    if (question && document) {
      return getDocumentText(document, question)
    }
  }

  return (
    <Container fluid>
      <Row>
        {document && (
          <RagBot
            casId={casId}
            ragMessage={ragMessage}
            setCriteriaValue={setValue}
            criteriaDescriptions={criteriaDescriptionsShort}
            promptType={"core_b04_classification"}
            casTextOrder={casTextOrder}
          />
        )}
        <Col sm={12} lg={6} style={{ height: "75vh" }}>
          <Card style={{ opacity: loading ? "0.5" : "1" }} className={"mb-3"}>
            <CardContent>
              <SzenarioText
                value={findQuestionText("question_scenario_text")}
              />
              <CardContent>
                {findQuestionText("Question1")}
                <div className={"mt-2"}>
                  <em>Answer:</em>
                </div>
                <div
                  style={{ backgroundColor: "#f3f3f3" }}
                  className={"mt-1 px-3 py-2"}
                >
                  {findAnswerText("Answer1")}
                </div>
              </CardContent>
              <CardContent>
                {findQuestionText("Question2")}
                <div className={"mt-2"}>
                  <em>URLs:</em>
                </div>
                <div
                  style={{ backgroundColor: "#f3f3f3" }}
                  className={"mt-1 px-3 py-2"}
                >
                  {findAnswerText("Answer2")}
                </div>
              </CardContent>
              <CardContent className={"mt-2"}>
                {findQuestionText("Question3")}
                <div className={"mt-2"}>
                  <em>Criteria:</em>
                </div>
                <div
                  style={{ backgroundColor: "#f3f3f3" }}
                  className={"mt-1 px-3 py-2"}
                >
                  {findAnswerText("Answer3")}
                </div>
              </CardContent>
            </CardContent>
          </Card>
          <DynamicImageList casId={casId} />
        </Col>
        <Col sm={12} lg={6} style={{ overflow: "scroll", height: "90vh" }}>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} hidden={loading}>
              <Card style={{ opacity: loading ? "0.5" : "1" }}>
                <CardHeader>
                  <CardTitle>
                    Information in regards to the student answers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor=":r385:-form-item"
                  >
                    <p>
                      User: <strong className={"ml-1"}>{userName}</strong>{" "}
                      <span className={"ml-2 text-muted small"}>
                        (will be filled in automatically)
                      </span>
                    </p>
                  </label>
                  <ButtonInput
                    name="K1.value"
                    label="K1 Was the task completed according to the instructions?"
                    description="Was the question (at least in general) understood? Is the answer mostly clear and understandable?"
                    {...{ control, buttons }}
                  />
                  <ButtonInput
                    name="K2.value"
                    label="K2 Green sauce contains borage as a critical ingredient."
                    {...{ control, buttons }}
                  />
                  <ButtonInput
                    name="K4.value"
                    label="K4 There may be effects on health."
                    {...{ control, buttons }}
                  />
                  <SelectInput
                    name="K11.value"
                    label="K11 Task Fulfillment"
                    description="Here it is assessed whether an answer to the given question is provided. 'Should the consumption of green sauce be discouraged?'"
                    options={[
                      {
                        label:
                          "0 - Topic missed, the answer deals with the general context but misses the question.",
                        value: "0"
                      },
                      {
                        label:
                          "1 - The answer addresses the topic but does not reach a conclusion as required by the task.",
                        value: "1"
                      },
                      {
                        label:
                          "2 - The task was answered as required by the question.",
                        value: "2"
                      }
                    ]}
                    {...{ control }}
                  />
                  <NumberInput
                    name="K16.value"
                    label="K16 Number of sources with a traceable connection to a specific content relevant to the statement (argument, information, etc.)"
                    inputProps={sourceNumberInputProps}
                    {...{ control }}
                  />
                  <SelectInput
                    name="K17.value"
                    label="K17 Coherence"
                    description="Is there a logical, consistent, and contradiction-free argumentation?"
                    options={[
                      {
                        label:
                          "0 - The statement is not coherent at all. It contains only unrelated statements/information or is so short that no connections can be made.",
                        value: "0"
                      },
                      {
                        label:
                          "1 - The statement is hardly coherent. It contains partially connected statements/information, but also unrelated elements or internal contradictions.",
                        value: "1"
                      },
                      {
                        label:
                          "2 - The statement is largely coherent. The transitions between individual statements/information are mostly connected, but there are some repetitions and/or possible leaps in thought.",
                        value: "2"
                      },
                      {
                        label:
                          "3 - The statement is coherent. It has a consistently logical structure, with the presented information/arguments building on each other.",
                        value: "3"
                      }
                    ]}
                    {...{ control }}
                  />
                </CardContent>
              </Card>
              <Card
                style={{ opacity: loading ? "0.5" : "1" }}
                className={"mt-2"}
              >
                <CardHeader>
                  <CardTitle>Image Information</CardTitle>
                </CardHeader>

                <CardContent>
                  <SelectInput
                    name="A3.value"
                    label="A3 Type of Source"
                    description="Here, the type of online source (website or video) from which the contribution originates is coded (e.g., article from a news medium, a scientific publication, or an online encyclopedia). The source can usually be identified on the website or in the URL. If it is unclear which type of website a source belongs to, this can be researched online."
                    options={[
                      {
                        label: "1 - Article from an online news medium",
                        value: "1"
                      },
                      {
                        label: "2 - Scientific journal article",
                        value: "2"
                      },
                      {
                        label:
                          "3 - Entry in a scientific database (Pubmed, Amboss)",
                        value: "3"
                      },
                      {
                        label:
                          "4 - Company website (commercial, e.g., also health insurance as a special case)",
                        value: "4"
                      },
                      {
                        label:
                          "5 - Website of (political) interest groups/associations (e.g., Federal Association for Wind Energy, employer or employee associations, trade unions, parties, NGOs, politicians)",
                        value: "5"
                      },
                      {
                        label:
                          "6 - Website of authorities (e.g., Federal Office for Radiation Protection, RKI)",
                        value: "6"
                      },
                      {
                        label:
                          "7 - Entry in an online encyclopedia (e.g., Wikipedia)",
                        value: "7"
                      },
                      {
                        label:
                          "8 - User contribution (e.g., in forums, letters to the editor, blogs by private individuals)",
                        value: "8"
                      },
                      {
                        label: "99 - Other source",
                        value: "99"
                      }
                    ]}
                    {...{ control }}
                  />
                  <SelectInput
                    name="A4.value"
                    label="A4 Visual Elements"
                    description="Here it is coded whether a website contains visual elements. Visual elements are photographs, (info-)graphics, illustrations, etc. If a website contains several visual elements, the dominant type is recorded (e.g., three photos and one infographic: 'photograph' is coded). Advertisements and still images from videos are not counted as visual elements."
                    options={[
                      { label: "0 - No image/graphic present", value: "0" },
                      { label: "1 - Photograph/illustration", value: "1" },
                      { label: "2 - (Info-)graphic", value: "2" },
                      {
                        label:
                          "3 - Both (photograph/illustration and infographic)",
                        value: "3"
                      }
                    ]}
                    {...{ control }}
                  />
                  <SelectInput
                    name="C1.value"
                    label="C1 Objectivity"
                    description="Here it is coded whether the content of a website, regardless of the facts described, is written emotionally or objectively. Emotionality means that a fact is described with terms that convey feelings. Objectivity means that the author uses a sober language in the contribution, largely free of emotions. An indicator of emotional language is the direct addressing of feelings ('terrible disease'; 'that makes me angry'). In addition, emotions can also be conveyed indirectly through word choice ('macabre business with death'; 'the negotiations failed mercilessly'; 'killer radiation'). An indicator of objective language is the use of a descriptive, sober style without emotional embellishments ('The radiation from radio masts is generally harmless'; 'Spider bites can lead to circulatory problems')."
                    options={[
                      {
                        label: "1 - Clear objective language",
                        value: "1"
                      },
                      { label: "2 - Rather objective language", value: "2" },
                      {
                        label:
                          "3 - Objective and emotional language about equally weighted",
                        value: "3"
                      },
                      { label: "4 - Rather emotional language", value: "4" },
                      {
                        label: "5 - Clear emotional language",
                        value: "5"
                      }
                    ]}
                    {...{ control }}
                  />
                </CardContent>
              </Card>
              <Card
                style={{ opacity: loading ? "0.5" : "1" }}
                className={"mt-2"}
              >
                <CardHeader>
                  <CardTitle>Shared Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <ButtonInput
                    name="X1.value"
                    label="X1 The students response is partially based on the source visible in the image."
                    {...{ control, buttons }}
                  />
                </CardContent>
              </Card>
              <div className={"mt-3 mb-4"}>
                <LoadingButton
                  type="submit"
                  loading={saveButtonState}
                  style={{ float: "right" }}
                >
                  Save Ratings
                </LoadingButton>
                <Button
                  type="button"
                  variant={"outline"}
                  onClick={() => navigate(`/projects/${projectId}`)}
                >
                  Back to overview
                </Button>
              </div>
            </form>
          </Form>
        </Col>
      </Row>
      <LoadingStateDrawer state={loadingState} />
    </Container>
  )
}

const SzenarioText = ({ value }: { value?: string }) =>
  value ? (
    <CardContent>
      <Collapsible>
        <CollapsibleTrigger>
          <div className="flex">
            <strong>Scenario Text (click to expand)</strong>
            <ChevronDown className="h-5 w-5" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p className="whitespace-pre-wrap">{value}</p>
        </CollapsibleContent>
      </Collapsible>
    </CardContent>
  ) : null

export const DemoRouteImages = (props: PageProps) => (
  <WithAuth children={<Page {...props} />} />
)
