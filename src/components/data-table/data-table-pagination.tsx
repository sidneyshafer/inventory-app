"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import type { Table } from "@tanstack/react-table"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  totalCount: number
  pageIndex: number
  pageSize: number
  onPageChange: (pageIndex: number) => void
  isLoading?: boolean
}

export function DataTablePagination<TData>({
  table,
  totalCount,
  pageIndex,
  pageSize,
  onPageChange,
  isLoading,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between gap-2 pt-4">
      <div className="text-sm text-muted-foreground">
        Showing {pageIndex * pageSize + 1} to {Math.min((pageIndex + 1) * pageSize, totalCount)} of {totalCount} items
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(0)}
          disabled={!table.getCanPreviousPage() || isLoading}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!table.getCanPreviousPage() || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          <span className="text-sm">
            Page {pageIndex + 1} of {table.getPageCount()}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!table.getCanNextPage() || isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage() || isLoading}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}