import { useEffect, useState } from "react"
import { Placeholder, PlaceholderProps } from "react-bootstrap"

// TODO: Properly do row calculations
export const DynamicPlaceholder = ({
  rows,
  props
}: {
  rows: number
  props: PlaceholderProps
}) => {
  // Create array of numbers that add up to max size
  const [sizes, setSizes] = useState<number[]>([])

  useEffect(() => {
    const maxSize = rows * 12
    const sizes = []
    let i = 0

    while (i < maxSize) {
      let j = 0
      while (j < 12) {
        const size = 2 + Math.floor(Math.random() * 6)
        if (j + size > 12) break
        sizes.push(size)
        j += size
      }
      i += 12
    }
    setSizes(sizes)
  }, [rows])
  return (
    <Placeholder {...props} animation="glow">
      {sizes.map((size, i) => (
        <>
          <Placeholder xs={size} key={i} />{" "}
        </>
      ))}
    </Placeholder>
  )
}
