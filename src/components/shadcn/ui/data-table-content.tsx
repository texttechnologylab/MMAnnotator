import { flexRender } from "@tanstack/react-table"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "./table"
import { useContext } from "react"
import { DataTableContext } from "./data-table"

export function DataTableContent() {
  const { table, columns, headerDescription } = useContext(DataTableContext)
  return (
    <Table>
      <TableHeader>
        {table?.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  <HoverCard>
                    <HoverCardTrigger style={{ cursor: "pointer" }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </HoverCardTrigger>
                    <HoverCardContent
                      hidden={
                        !(
                          headerDescription &&
                          header.column.id in headerDescription
                        )
                      }
                    >
                      {headerDescription &&
                      header.column.id in headerDescription
                        ? headerDescription[header.column.id]
                        : null}
                    </HoverCardContent>
                  </HoverCard>
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table?.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              onClick={row.getToggleSelectedHandler()}
              // Only select this row if it hasn't been selected
              onContextMenu={
                row.getIsSelected() ? undefined : row.getToggleSelectedHandler()
              }
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center"
              style={{ textAlign: "left" }}
            >
              No data.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
