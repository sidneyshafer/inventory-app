"use client"

import * as React from "react"
import { type Table as TanStackTable, flexRender, type Row } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTablePagination } from "@/components/Table/data-table-pagination"
import { SearchX } from "lucide-react"

interface DataTableProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
  table: TanStackTable<TData>
  columns?: number // optional, used for simple loading/empty states
  isLoading?: boolean
  emptyMessage?: string
  floatingBar?: React.ReactNode | null
  rowClicked?: (row: Row<TData>) => void
  count: number
  height?: string
}

export function DataTable<TData>({
  table,
  columns,
  isLoading,
  emptyMessage = "No data found.",
  floatingBar = null,
  rowClicked,
  count,
  height,
  className,
  children,
  ...props
}: DataTableProps<TData>) {
  const colCount = columns ?? table.getAllColumns().length

  return (
    <div className={cn("flex flex-col w-full h-full space-y-2", className)} {...props}>
      {children}
      <div className={cn("relative border rounded-xs overflow-y-auto")}>
        <div className="min-w-max">
          <Table className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap p-2 text-sm font-medium">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={colCount} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => rowClicked?.(row)}
                    className={cn("h-8")}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap p-2.5 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={colCount} className="h-40 text-center align-middle">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <SearchX className="h-8 w-8 text-muted-foreground/70" />
                      <p className="text-sm font-medium">{emptyMessage}</p>
                      <p className="text-xs">Try adjusting your filters or search</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination + optional floating bar */}
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} count={count} />
        {table.getFilteredSelectedRowModel().rows.length > 0 && floatingBar}
      </div>
    </div>
  )
}
