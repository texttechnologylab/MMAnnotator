import { LoadingStateData } from "@/zustand/useLoadingState"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from "../shadcn/ui/drawer"
import { Progress } from "../shadcn/ui/progress"

export const LoadingStateDrawer = ({ state }: { state: LoadingStateData }) => {
  return (
    <Drawer open={!state.completed}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Opening Document...</DrawerTitle>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerDescription>
            Current Step: <b>{state.states[state.currentStep].name}</b>
          </DrawerDescription>
          <Progress value={state.percent} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
