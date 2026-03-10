import { LoadingState } from "@/components/shadcn/ui/loading-button"
import {
  CircleAlert,
  CircleCheck,
  CircleDashedIcon,
  Loader2
} from "lucide-react"

export const LoadingStateIcon = ({ loading }: { loading?: LoadingState }) => {
  return (
    <>
      {loading == LoadingState.LOADING && (
        <Loader2 className={"h-4 w-4 animate-spin"} />
      )}
      {loading == LoadingState.ERROR && (
        <CircleAlert className="h-4 w-4 mr-2" />
      )}
      {loading == LoadingState.SUCCESS && (
        <CircleCheck className="h-4 w-4 mr-2" />
      )}
      {loading == LoadingState.NEUTRAL && (
        <CircleDashedIcon className="h-4 w-4 mr-2" />
      )}
    </>
  )
}
