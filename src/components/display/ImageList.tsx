import { ToolEntry } from "@/zustand/useDocument"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger
} from "../shadcn/ui/dialog"
import { Virtuoso } from "react-virtuoso"
import { useImages } from "@/hooks/useImages"
import { Spinner } from "../shadcn/ui/spinner"

export const ImageList = ({ images }: { images?: ToolEntry[] }) => {
  return (
    <Virtuoso
      data={images}
      totalCount={images?.length || 0}
      itemContent={(index) => (
        <div className={"my-1"} key={images![index]._addr}>
          <Dialog>
            <DialogTrigger>
              <img
                className={
                  "m-auto border-solid border rounded-sm border-slate-800 cursor-zoom-in drop-shadow-md"
                }
                src={"data:image/png;base64," + images![index].features.value}
              />
            </DialogTrigger>
            <ImageDialog
              image={"data:image/png;base64," + images![index].features.value}
            />
          </Dialog>
        </div>
      )}
    />
  )
}

export const DynamicImageList = ({ casId }: { casId: string }) => {
  const { images, nextImages, reachedEnd } = useImages(casId)

  return (
    <Virtuoso
      data={images}
      totalCount={images?.length || 0}
      endReached={nextImages}
      increaseViewportBy={100}
      itemContent={(index) => (
        <div className={"my-1"} key={images![index]._addr}>
          <Dialog>
            <DialogTrigger>
              <img
                className={
                  "m-auto border-solid border rounded-sm border-slate-800 cursor-zoom-in drop-shadow-md"
                }
                src={"data:image/png;base64," + images![index].features.value}
              />
            </DialogTrigger>
            <ImageDialog
              image={"data:image/png;base64," + images![index].features.value}
            />
          </Dialog>
        </div>
      )}
      components={{ Footer: () => (reachedEnd ? <></> : <Spinner />) }}
    />
  )
}

export function ImageDialog({ image }: { image: string }) {
  return (
    <DialogContent className={"w-[100%]"}>
      <DialogClose>
        <img className={"w-[100%] cursor-zoom-out"} src={image} />
      </DialogClose>
    </DialogContent>
  )
}
