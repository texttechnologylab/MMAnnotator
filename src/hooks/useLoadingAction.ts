import { useCallback, useState } from "react"
import { LoadingState } from "@/components/shadcn/ui/loading-button"

export const useLoadingAction = <TArgs extends unknown[]>(
  action: (...args: TArgs) => Promise<unknown>,
  successResetMs = 1200
) => {
  const [loading, setLoading] = useState<LoadingState>(LoadingState.NEUTRAL)

  const run = useCallback(
    async (...args: TArgs) => {
      setLoading(LoadingState.LOADING)
      try {
        await action(...args)
        setLoading(LoadingState.SUCCESS)
      } catch {
        setLoading(LoadingState.ERROR)
      } finally {
        if (successResetMs > 0) {
          window.setTimeout(
            () => setLoading(LoadingState.NEUTRAL),
            successResetMs
          )
        }
      }
    },
    [action, successResetMs]
  )

  return { run, loading, setLoading }
}
