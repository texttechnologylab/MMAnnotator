"use client"

import React, { Suspense, use, useRef } from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { useResizeObserver } from "usehooks-ts"
import { cn } from "@/lib/utils"
import { ScrollArea } from "./scroll-area"
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult
} from "@hello-pangea/dnd"
import { Spinner } from "./spinner"

interface TreeDataItem {
  id: string
  name: string
  type: "PROJECT" | "REPOSITORY" | "DOCUMENT"
  icon?: LucideIcon
  children?: (TreeDataItem | Promise<TreeDataItem>)[]
  parent?: TreeDataItem
}

type TreeProps = React.HTMLAttributes<HTMLDivElement> & {
  data: (TreeDataItem | Promise<TreeDataItem>)[]
  initialSlelectedItemId?: string
  onSelectChange?: (item: TreeDataItem | undefined) => void
  expandAll?: boolean
  folderIcon?: LucideIcon
  itemIcon?: LucideIcon
}

const Tree = React.forwardRef<HTMLDivElement, TreeProps>(
  (
    {
      data,
      initialSlelectedItemId,
      onSelectChange,
      expandAll,
      folderIcon,
      itemIcon,
      className
    },
    ref
  ) => {
    const [selectedItemId, setSelectedItemId] = React.useState<
      string | undefined
    >(initialSlelectedItemId)

    const handleSelectChange = React.useCallback(
      (item: TreeDataItem | undefined) => {
        setSelectedItemId(item?.id)
        if (onSelectChange) {
          onSelectChange(item)
        }
      },
      [onSelectChange]
    )

    const expandedItemIds = React.useMemo(() => {
      if (!initialSlelectedItemId) {
        return [] as string[]
      }

      const ids: string[] = []

      function walkTreeItems(
        items: TreeDataItem[] | TreeDataItem,
        targetId: string
      ): boolean {
        if (items instanceof Array) {
          for (let i = 0; i < items.length; i++) {
            ids.push(items[i]!.id)
            if (walkTreeItems(items[i]!, targetId) && !expandAll) {
              return true
            }
            if (!expandAll) ids.pop()
          }
        } else if (!expandAll && items.id === targetId) {
          return true
        } else if (items.children) {
          // Only walk already-resolved children
          const syncChildren = items.children.filter(
            (c): c is TreeDataItem => !(c instanceof Promise)
          )
          if (syncChildren.length > 0) {
            return walkTreeItems(syncChildren, targetId)
          }
        }
        return false
      }

      // Filter to only sync items for initial expansion
      const syncData = data.filter(
        (c): c is TreeDataItem => !(c instanceof Promise)
      )
      if (syncData.length > 0) {
        walkTreeItems(syncData, initialSlelectedItemId)
      }
      return ids
    }, [data, expandAll, initialSlelectedItemId])

    const refRoot = useRef<HTMLDivElement>(null)
    const { width, height } = useResizeObserver({
      ref: refRoot as React.RefObject<HTMLElement>
    })

    const onDragEnd = (result: DropResult) => {
      if (!result.destination) {
        return
      }
      console.log(result)
    }

    return (
      <div ref={refRoot} className={cn("overflow-hidden", className)}>
        <ScrollArea style={{ width, height }}>
          <div className="relative p-2">
            <DragDropContext onDragEnd={onDragEnd}>
              <TreeItem
                data={data}
                ref={ref}
                selectedItemId={selectedItemId}
                handleSelectChange={handleSelectChange}
                expandedItemIds={expandedItemIds}
                FolderIcon={folderIcon}
                ItemIcon={itemIcon}
                index={0}
              />
            </DragDropContext>
          </div>
        </ScrollArea>
      </div>
    )
  }
)

/**
 * Renders a single resolved TreeDataItem as either a folder (with accordion) or a leaf.
 */
type TreeNodeContentProps = {
  item: TreeDataItem
  dataIndex: number
  selectedItemId?: string
  handleSelectChange: (item: TreeDataItem | undefined) => void
  expandedItemIds: string[]
  FolderIcon?: LucideIcon
  ItemIcon?: LucideIcon
  index: number
  totalSiblings: number
}

const TreeNodeContent = ({
  item,
  dataIndex,
  selectedItemId,
  handleSelectChange,
  expandedItemIds,
  FolderIcon,
  ItemIcon,
  index,
  totalSiblings
}: TreeNodeContentProps) => {
  if (item.children && item.type == "PROJECT") {
    return (
      <Draggable
        key={item.id}
        draggableId={item.id}
        index={index + dataIndex + 1}
      >
        {(provided, _snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.dragHandleProps}
            {...provided.draggableProps}
            style={{
              ...provided.draggableProps.style
            }}
          >
            <AccordionPrimitive.Root
              type="multiple"
              defaultValue={expandedItemIds}
            >
              <AccordionPrimitive.Item value={item.id}>
                <AccordionTrigger
                  className={cn(
                    "px-2 hover:before:opacity-100 before:absolute before:left-0 before:w-full before:opacity-0 before:bg-muted/80 before:h-7 before:-z-10",
                    selectedItemId === item.id &&
                      "before:opacity-100 before:bg-accent text-accent-foreground before:border-l-2 before:border-l-accent-foreground/50 dark:before:border-0"
                  )}
                  onClick={() => handleSelectChange(item)}
                  onContextMenu={() => handleSelectChange(item)}
                >
                  {item.icon && (
                    <item.icon
                      className="h-4 w-4 shrink-0 mr-2 text-accent-foreground/50"
                      aria-hidden="true"
                    />
                  )}
                  {!item.icon && FolderIcon && (
                    <FolderIcon
                      className="h-4 w-4 shrink-0 mr-2 text-accent-foreground/50"
                      aria-hidden="true"
                    />
                  )}
                  <span className="text-sm truncate">{item.name}</span>
                </AccordionTrigger>

                <AccordionContent className="pl-6">
                  <TreeItem
                    data={item.children ?? []}
                    selectedItemId={selectedItemId}
                    handleSelectChange={handleSelectChange}
                    expandedItemIds={expandedItemIds}
                    FolderIcon={FolderIcon}
                    ItemIcon={ItemIcon}
                    index={index + 1 + dataIndex + totalSiblings}
                  />
                </AccordionContent>
              </AccordionPrimitive.Item>
            </AccordionPrimitive.Root>
          </div>
        )}
      </Draggable>
    )
  }

  return (
    <Draggable
      key={item.id}
      draggableId={item.id}
      index={index + dataIndex + 1}
    >
      {(provided, _snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.dragHandleProps}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style
          }}
        >
          <Leaf
            item={item}
            isSelected={selectedItemId === item.id}
            onClick={() => handleSelectChange(item)}
            onContextMenu={() => handleSelectChange(item)}
            Icon={ItemIcon}
          />
        </div>
      )}
    </Draggable>
  )
}

/**
 * Resolves a Promise<TreeDataItem> via React 19's `use()` hook,
 * then renders it as a TreeNodeContent.
 */
const AsyncTreeNode = ({
  promise,
  ...props
}: { promise: Promise<TreeDataItem> } & Omit<TreeNodeContentProps, "item">) => {
  const item = use(promise)
  return <TreeNodeContent item={item} {...props} />
}

const LoadingLeaf = () => (
  <div className="flex items-center py-2 px-2">
    <Spinner />
    <span className="grow text-sm truncate ml-2 text-muted-foreground">
      Loading…
    </span>
  </div>
)

type TreeItemInternalProps = {
  data: (TreeDataItem | Promise<TreeDataItem>)[]
  selectedItemId?: string
  handleSelectChange: (item: TreeDataItem | undefined) => void
  expandedItemIds: string[]
  FolderIcon?: LucideIcon
  ItemIcon?: LucideIcon
  index: number
  className?: string
}

const TreeItem = React.forwardRef<HTMLDivElement, TreeItemInternalProps>(
  (
    {
      className,
      data,
      selectedItemId,
      handleSelectChange,
      expandedItemIds,
      FolderIcon,
      ItemIcon,
      index,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} role="tree" className={className} {...props}>
        <ul>
          <Droppable
            droppableId={"droppable" + index}
            key={"droppable" + index}
            isDropDisabled={index == 0}
            isCombineEnabled={true}
            ignoreContainerClipping
          >
            {(provided, _snapshot) => (
              <div ref={provided.innerRef}>
                {data.map((itemOrPromise, dataIndex) => {
                  const sharedProps = {
                    dataIndex,
                    selectedItemId,
                    handleSelectChange,
                    expandedItemIds,
                    FolderIcon,
                    ItemIcon,
                    index,
                    totalSiblings: data.length
                  }

                  if (itemOrPromise instanceof Promise) {
                    return (
                      <li key={`async-${dataIndex}`}>
                        <Suspense fallback={<LoadingLeaf />}>
                          <AsyncTreeNode
                            promise={itemOrPromise}
                            {...sharedProps}
                          />
                        </Suspense>
                      </li>
                    )
                  }

                  return (
                    <li key={itemOrPromise.id}>
                      <TreeNodeContent item={itemOrPromise} {...sharedProps} />
                    </li>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </ul>
      </div>
    )
  }
)

const Leaf = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    item: TreeDataItem
    isSelected?: boolean
    Icon?: LucideIcon
  }
>(({ className, item, isSelected, Icon, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center py-2 px-2 cursor-pointer \
        hover:before:opacity-100 before:absolute before:left-0 before:right-1 before:w-full before:opacity-0 before:bg-muted/80 before:h-7 before:-z-10",
        className,
        isSelected &&
          "before:opacity-100 before:bg-accent text-accent-foreground before:border-l-2 before:border-l-accent-foreground/50 dark:before:border-0"
      )}
      {...props}
    >
      {item.icon && (
        <item.icon
          className="h-4 w-4 shrink-0 mr-2 text-accent-foreground/50"
          aria-hidden="true"
        />
      )}
      {!item.icon && Icon && (
        <Icon
          className="h-4 w-4 shrink-0 mr-2 text-accent-foreground/50"
          aria-hidden="true"
        />
      )}
      <span className="grow text-sm truncate">{item.name}</span>
    </div>
  )
})

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header>
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 w-full items-center py-2 transition-all last:[&[data-state=open]>svg]:rotate-90",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 text-accent-foreground/50 ml-auto" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    <div className="pb-1 pt-0">{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Tree, type TreeDataItem }
