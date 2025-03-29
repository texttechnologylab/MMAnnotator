"use client"

import {
  ColumnDef,
  SortingState,
  Table,
  VisibilityState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table"

import { createContext, useEffect, useState } from "react"

export interface DataTableProps<TData, TValue>
  extends Omit<DataTableContextProps<TData, TValue>, "table"> {
  children: React.ReactNode
}
export interface DataTableContextProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[] // TODO: Promise<TData[]>
  table: Table<TData> | null
  headerDescription?: Record<string, string>
  refData?: React.MutableRefObject<Table<TData> | undefined>
  columnVisibility?: VisibilityState
  setColumnVisibility?: React.Dispatch<React.SetStateAction<VisibilityState>>
  onRowSelectionChanged?: () => void
}

export const DataTableContext = createContext<DataTableContextProps<any, any>>({
  columns: [],
  data: [],
  table: null
})

export function DataTable<TData, TValue>({
  columns,
  data,
  children,
  refData,
  headerDescription,
  columnVisibility,
  setColumnVisibility,
  onRowSelectionChanged
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})

  useEffect(() => {
    if (onRowSelectionChanged) onRowSelectionChanged()
  }, [onRowSelectionChanged, rowSelection])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection
    }
  })
  if (refData) refData.current = table

  return (
    <DataTableContext.Provider
      value={{
        columns,
        data,
        table,
        headerDescription,
        refData,
        columnVisibility,
        setColumnVisibility
      }}
    >
      {children}
    </DataTableContext.Provider>
  )
}
