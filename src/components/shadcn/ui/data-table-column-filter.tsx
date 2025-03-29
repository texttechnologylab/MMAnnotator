import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "./dropdown-menu"
import { Button } from "./button"
import { useContext } from "react"
import { DataTableContext } from "./data-table"

export function DataTableColumnFilter() {
  const { table } = useContext(DataTableContext)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="h-[20vh] overflow-scroll" align="end">
        {table
          ?.getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
