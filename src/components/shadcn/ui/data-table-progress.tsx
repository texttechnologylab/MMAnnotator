import { Progress } from "@/components/shadcn/ui/progress"

type DataTableProgressProps = {
  total: number
  completed: number
  label?: string
  className?: string
}

export function DataTableProgress({
  total,
  completed,
  className
}: DataTableProgressProps) {
  const safeCompleted = Math.max(0, Math.min(completed, total))
  const percent = total > 0 ? (safeCompleted / total) * 100 : 0

  return (
    <div className={className}>
      <Progress className="h-1" value={percent} />
    </div>
  )
}
