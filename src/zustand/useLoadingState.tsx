import { useState } from "react"

export interface LoadingState {
  id: number
  name: string
  completed: boolean
}

export interface LoadingStateData {
  states: LoadingState[]
  steps: number
  currentStep: number
  percent: number
  completed: boolean
}

export const useLoadingState = (states: LoadingState[]) => {
  const [loadingState, setLoadingState] = useState<LoadingStateData>({
    states: states,
    steps: states.length,
    currentStep: 0,
    percent: 0,
    completed: false
  })

  const completeStep = (id: number) => {
    const index = loadingState.states.findIndex((state) => state.id === id)
    if (index === -1) return
    const newState = loadingState.states
    for (let i = 0; i <= index; i++) {
      newState[i].completed = true
    }
    setLoadingState({
      states: newState,
      currentStep: index,
      steps: loadingState.steps,
      percent: ((index + 1) / loadingState.steps) * 100,
      completed: index + 1 === loadingState.steps
    })
  }

  return { loadingState, completeStep }
}
