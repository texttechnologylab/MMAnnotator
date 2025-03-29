import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export const Histogram = ({ data, buckets } : {data: number[], buckets: number}) => {
  // Calculate histogram data
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min
  const bucketSize = range / buckets

  const bucketCounts = new Array(buckets).fill(0)
  data.forEach((value: number) => {
    const bucketIndex = Math.min(
      Math.floor((value - min) / bucketSize),
      buckets - 1
    )
    bucketCounts[bucketIndex]++
  })

  // Create labels for the buckets
  const labels = bucketCounts.map((_, index) => {
    const start = min + index * bucketSize
    const end = start + bucketSize
    return `${start.toFixed(2)} - ${end.toFixed(2)}`
  })

  // Chart.js data object
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Frequency",
        data: bucketCounts,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      }
    ]
  }

  // Chart.js options object
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const
      }
    },
    maintainAspectRatio: false,
    aspectRatio: 5
  }
  return <Bar data={chartData} options={options} />
}
