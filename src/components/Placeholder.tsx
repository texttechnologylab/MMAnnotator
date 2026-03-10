import { useMemo } from "react"

// TODO: Properly do row calculations
export const DynamicPlaceholder = ({
  rows
}: {
  rows: number
  props?: Record<string, unknown>
}) => {
  // Create array of numbers that add up to max size

  const sizes = useMemo(() => {
    const maxSize = rows * 12
    const sizes = []
    let i = 0

    while (i < maxSize) {
      let j = 0
      while (j < 12) {
        // eslint-disable-next-line react-hooks/purity
        const size = 2 + Math.floor(Math.random() * 6)
        if (j + size > 12) break
        sizes.push(size)
        j += size
      }
      i += 12
    }
    return sizes
  }, [rows])
  return (
    <div className="animate-pulse space-y-2">
      <div className="flex flex-wrap gap-1">
        {sizes.map((size, i) => (
          <div
            key={i}
            className="h-4 rounded bg-muted"
            style={{ width: `${(size / 12) * 100}%` }}
          />
        ))}
      </div>
    </div>
  )
}
