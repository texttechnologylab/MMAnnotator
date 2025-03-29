import { useEffect, useState } from "react"
import { Col, Container, Row } from "react-bootstrap"
import { useForm, useWatch } from "react-hook-form"
import { SelectInput } from "../../../components/inputs/SelectInput"
import WithAuth from "../../../components/wrappers/WithAuth"
import { DateInput } from "@/components/inputs/DateInput"
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
import { SwitchInput } from "@/components/inputs/SwitchInput"
import { useDependentField } from "@/hooks/useDependentField"

const defaultValues = {
  A1: DefaultFormCategory,
  A2: DefaultFormCategory,
  A3: DefaultFormCategory,
  A4: DefaultFormCategory,
  A5: DefaultFormCategory,
  NOT_CODE: DefaultFormCategory
}

type FormValues = typeof defaultValues

export function Page() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const { projectId } = useProjectId()
  const [loading, setLoading] = useState(true)
  const [saveButtonState, setSaveButtonState] = useState<LoadingState>(
    LoadingState.NEUTRAL
  )

  const form = useForm<FormValues>({
    defaultValues: defaultValues
  })
  const { control, handleSubmit, reset, getValues } = form

  const { annoSocket } = useDocumentStore()

  const casId = new URLSearchParams(search).get("id") || ""

  const { document, submitChanges, subscribeToWebSocket, loadingState } =
    useCasSeg(casId)

  // TODO: Create a wrapper for this stuff in useCas
  useEffect(() => {
    subscribeToWebSocket("msg", messageCallback, casId)
    subscribeToWebSocket("open_tool", openToolCallback, casId)
    subscribeToWebSocket("on_close", () =>
      setSaveButtonState(LoadingState.ERROR)
    )
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
      toast.success("Success", {
        description: _msg.data.text,
        closeButton: true
      })
    } else if (_msg.data.text) {
      setSaveButtonState(LoadingState.ERROR)
    }
  }

  const onSubmit = (data: FormValues) => {
    setSaveButtonState(LoadingState.LOADING)
    submitChanges(data)
  }

  const { optional: A4Optional } = useDependentField(
    form,
    "A3.value",
    "A4.value"
  )

  const notCodable = useWatch({ control, name: "NOT_CODE.value" })

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
      if (answer.features.description) {
        // Fix: We cant change CAS so we store answer changes/fixes in the description here
        return answer.features.description
      }
      const text = getDocumentText(document, answer)
      if (text == "-99" || text == "-66") {
        return "[Field was not filled out]"
      }
      if (text == "1") {
        return "No."
      }
      if (text == "6") {
        return "Yes, the following:"
      }
      return text
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
        <Col sm={12} lg={6} style={{ height: "75vh" }}>
          <Card style={{ opacity: loading ? "0.5" : "1" }} className={"mb-3"}>
            <CardHeader>
              <CardTitle>Website</CardTitle>
              <CardContent>
                <div className={"mt-2"}>
                  <em>Prompt:</em>
                </div>
                {findQuestionText("core_question_1")}
                <div className={"mt-2"}>
                  <em>Answer:</em>
                </div>
                <div
                  style={{ backgroundColor: "#f3f3f3" }}
                  className={"mt-1 px-3 py-2"}
                >
                  {findAnswerText("core_answer_1")}
                </div>
              </CardContent>
            </CardHeader>
          </Card>
          <DynamicImageList casId={casId} />
        </Col>
        <Col sm={12} lg={6} style={{ overflow: "scroll", height: "90vh" }}>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} hidden={loading}>
              <Card style={{ opacity: loading ? "0.5" : "1" }}>
                <CardHeader style={{ float: "right" }}>
                  <CardTitle>
                    Can't annotate{" "}
                    <SwitchInput name={"NOT_CODE.value"} control={control} />
                  </CardTitle>
                </CardHeader>
                <CardHeader>
                  <CardTitle>A) Categories</CardTitle>
                </CardHeader>
                {notCodable != "true" && (
                  <CardContent>
                    <DateInput
                      name="A1.value"
                      label="A1 Date of publication"
                      description="Here, the publication date of the website content or its last update is coded. The date refers to the creation date of the website content."
                      optional
                      {...{ control }}
                    />
                    <SelectInput
                      name="A2.value"
                      label="A2 Type of source"
                      description="Here, the type of online source (website or video) from which the contribution originates is coded."
                      options={[
                        {
                          label: "1 - Contribution from an online news medium",
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
                            "4 - Company website (commercial, e.g., special case also health insurance companies)",
                          value: "4"
                        },
                        {
                          label:
                            "5 - Website of (political) interest groups/associations (e.g., Federal Association of Wind Energy, employer or employee associations, unions, parties, NGOs, politicians)",
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
                      name="A3.value"
                      label="A3 Visual Elements"
                      description="Here, it is coded whether a website contains visual elements."
                      options={[
                        { label: "0 - No image/graphic present", value: "0" },
                        { label: "1 - Photography/Illustration", value: "1" },
                        { label: "2 - (Info)Graphic", value: "2" },
                        {
                          label:
                            "3 - Both (Photography/Illustration and Infographic)",
                          value: "3"
                        }
                      ]}
                      {...{ control }}
                    />
                    <SelectInput
                      name="A4.value"
                      label="A4 Relevance of Visual Elements"
                      description="If the website contains visual elements, are they relevant to the summary of the website."
                      options={[
                        {
                          label: "0 - No visual elements present",
                          value: "0"
                        },
                        {
                          label: "1 - No visual element is relevant",
                          value: "1"
                        },
                        {
                          label:
                            "2 - At least one visual element is relevant",
                          value: "2"
                        }
                      ]}
                      disabled={A4Optional}
                      optional={A4Optional}
                      {...{ control }}
                    />
                    <SelectInput
                      name="A5.value"
                      label="A5 The summary of the page is appropiate."
                      options={[
                        {
                          label: "0 - No",
                          value: "0"
                        },
                        {
                          label: "1 - Yes",
                          value: "1"
                        }
                      ]}
                      {...{ control }}
                    />
                  </CardContent>
                )}
              </Card>

              <div className={"mt-3 mb-4"}>
                <LoadingButton
                  type="submit"
                  loading={saveButtonState}
                  style={{ float: "right" }}
                >
                  Save
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

export const DemoRouteImages = () => <WithAuth children={<Page />} />
