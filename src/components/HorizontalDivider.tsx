import type { ReactNode } from "react"

export const HorizontalDivider = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex items-center gap-2">
      <hr className="flex-1" />
      <div className="shrink-0">{children}</div>
      <hr className="flex-1" />
    </div>
  )
}
