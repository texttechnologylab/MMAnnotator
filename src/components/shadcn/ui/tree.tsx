"use client"

import React, { useEffect } from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronRight, type LucideIcon } from "lucide-react"
import useResizeObserver from "use-resize-observer"
import { cn } from "@/lib/utils"
import { ScrollArea } from "./scroll-area"
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult
} from "@hello-pangea/dnd"
import { Spinner } from "./spinner"

interface TreeDataItem {
  id: string
  name: string
  type: "PROJECT" | "REPOSITORY" | "DOCUMENT"
  icon?: LucideIcon
  children?: Promise<TreeDataItem[] | undefined> | TreeDataItem[] // TODO: Ideally we'd have Promise<TreeDataItem>[]
  parent?: string // TODO: Ideall TreeDataItem
}

type TreeProps = React.HTMLAttributes<HTMLDivElement> & {
  data:
    | TreeDataItem[]
    | TreeDataItem
    | Promise<TreeDataItem[] | TreeDataItem | undefined>
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
      className,
      ...props
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

      async function walkTreeItems(
        items:
          | TreeDataItem[]
          | TreeDataItem
          | Promise<TreeDataItem[] | TreeDataItem | undefined>,
        targetId: string
      ) {
        if (items instanceof Promise) {
          const itemsRes = await items
          if (itemsRes) return walkTreeItems(itemsRes, targetId)
        } else if (items instanceof Array) {
          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          for (let i = 0; i < items.length; i++) {
            ids.push(items[i]!.id)
            if ((await walkTreeItems(items[i]!, targetId)) && !expandAll) {
              return true
            }
            if (!expandAll) ids.pop()
          }
        } else if (!expandAll && items.id === targetId) {
          return true
        } else if (items.children) {
          const children = await items.children
          if (children) return walkTreeItems(children, targetId)
        }
      }

      walkTreeItems(data, initialSlelectedItemId)
      return ids
    }, [data, initialSlelectedItemId])

    const { ref: refRoot, width, height } = useResizeObserver()

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
                {...props}
              />
            </DragDropContext>
          </div>
        </ScrollArea>
      </div>
    )
  }
)

type TreeItemProps = TreeProps & {
  selectedItemId?: string
  handleSelectChange: (item: TreeDataItem | undefined) => void
  expandedItemIds: string[]
  FolderIcon?: LucideIcon
  ItemIcon?: LucideIcon
  index: number
}

const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
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
    const [resolvedData, setResolvedData] = React.useState<
      TreeDataItem[] | TreeDataItem
    >()
    useEffect(() => {
      setResolvedData(undefined)
      if (data instanceof Promise) {
        data.then((resolvedData) => setResolvedData(resolvedData))
      } else if (data instanceof Array) {
        setResolvedData(data)
      }
    }, [data])

    if (!resolvedData) return <Spinner />
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
                {resolvedData instanceof Array ? (
                  resolvedData.map((item, dataIndex) => (
                    <li key={item.id}>
                      {item.children ? (
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
                                      "px-2 hover:before:opacity-100 before:absolute before:left-0 before:w-full before:opacity-0 before:bg-muted/80 before:h-[1.75rem] before:-z-10",
                                      selectedItemId === item.id &&
                                        "before:opacity-100 before:bg-accent text-accent-foreground before:border-l-2 before:border-l-accent-foreground/50 dark:before:border-0"
                                    )}
                                    onClick={() => handleSelectChange(item)}
                                    onContextMenu={() =>
                                      handleSelectChange(item)
                                    }
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
                                    <span className="text-sm truncate">
                                      {item.name}
                                    </span>
                                  </AccordionTrigger>

                                  <AccordionContent className="pl-6">
                                    <TreeItem
                                      data={
                                        item.children ? item.children : item
                                      }
                                      selectedItemId={selectedItemId}
                                      handleSelectChange={handleSelectChange}
                                      expandedItemIds={expandedItemIds}
                                      FolderIcon={FolderIcon}
                                      ItemIcon={ItemIcon}
                                      index={
                                        index +
                                        1 +
                                        dataIndex +
                                        resolvedData.length
                                      }
                                    />
                                  </AccordionContent>
                                </AccordionPrimitive.Item>
                              </AccordionPrimitive.Root>
                            </div>
                          )}
                        </Draggable>
                      ) : (
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
                      )}
                    </li>
                  ))
                ) : (
                  <Draggable draggableId={resolvedData.id} index={index}>
                    {(provided, _snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.dragHandleProps}
                        {...provided.draggableProps}
                        style={{
                          ...provided.draggableProps.style,
                          border: "1px solid blue"
                        }}
                      >
                        <li>
                          <Leaf
                            item={resolvedData}
                            isSelected={selectedItemId === resolvedData.id}
                            onClick={() => handleSelectChange(resolvedData)}
                            onContextMenu={() =>
                              handleSelectChange(resolvedData)
                            }
                            Icon={ItemIcon}
                          />
                        </li>
                      </div>
                    )}
                  </Draggable>
                )}
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
    item: TreeDataItem | Promise<TreeDataItem>
    isSelected?: boolean
    Icon?: LucideIcon
  }
>(({ className, item, isSelected, Icon, ...props }, ref) => {
  const [resolvedItem, setResolvedItem] = React.useState<TreeDataItem>()
  useEffect(() => {
    setResolvedItem(undefined)
    if (item instanceof Promise) {
      item.then((resolvedItem) => setResolvedItem(resolvedItem))
    } else {
      setResolvedItem(item)
    }
  }, [item])
  if (!resolvedItem) {
    //TODO: LOADING
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center py-2 px-2 cursor-pointer \
        hover:before:opacity-100 before:absolute before:left-0 before:right-1 before:w-full before:opacity-0 before:bg-muted/80 before:h-[1.75rem] before:-z-10",
          className,
          isSelected &&
            "before:opacity-100 before:bg-accent text-accent-foreground before:border-l-2 before:border-l-accent-foreground/50 dark:before:border-0"
        )}
        {...props}
      >
        {Icon && (
          <Icon
            className="h-4 w-4 shrink-0 mr-2 text-accent-foreground/50"
            aria-hidden="true"
          />
        )}
        <span className="flex-grow text-sm truncate">LOADING</span>
      </div>
    )
  }
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center py-2 px-2 cursor-pointer \
        hover:before:opacity-100 before:absolute before:left-0 before:right-1 before:w-full before:opacity-0 before:bg-muted/80 before:h-[1.75rem] before:-z-10",
        className,
        isSelected &&
          "before:opacity-100 before:bg-accent text-accent-foreground before:border-l-2 before:border-l-accent-foreground/50 dark:before:border-0"
      )}
      {...props}
    >
      {resolvedItem.icon && (
        <resolvedItem.icon
          className="h-4 w-4 shrink-0 mr-2 text-accent-foreground/50"
          aria-hidden="true"
        />
      )}
      {!resolvedItem.icon && Icon && (
        <Icon
          className="h-4 w-4 shrink-0 mr-2 text-accent-foreground/50"
          aria-hidden="true"
        />
      )}
      <span className="flex-grow text-sm truncate">{resolvedItem.name}</span>
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
