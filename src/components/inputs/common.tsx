import { BsInfoCircle } from "react-icons/bs"
import { Popover, PopoverContent, PopoverTrigger } from "../shadcn/ui/popover"
import { Card, CardDescription, CardHeader } from "../shadcn/ui/card"
import { FormLabel } from "../shadcn/ui/form"
import { cn } from "@/lib/utils"
import { memo, ReactNode } from "react"

export const InputLabel = memo(
  ({ label, description }: { label: string; description?: ReactNode }) => {
    return (
      <FormLabel>
        <Popover>
          <div className={cn("flex flex-row")}>
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor=":r385:-form-item"
            >
              {label}
            </label>
            <PopoverTrigger hidden={!description} className={cn("mx-1")}>
              <BsInfoCircle />
            </PopoverTrigger>
          </div>
          <PopoverContent className="w-auto p-0" align="start">
            <Card className={cn("w-[380px]")}>
              <CardHeader>
                <CardDescription className="whitespace-pre-wrap">
                  {description}
                </CardDescription>
              </CardHeader>
            </Card>
          </PopoverContent>
        </Popover>
      </FormLabel>
    )
  }
)
