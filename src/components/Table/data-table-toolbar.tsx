"use client"

import React, { useEffect, useMemo, useState } from "react"
import type { DataTableFilterField } from "@/types"
import type { Table } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X, SlidersHorizontal, Funnel } from "lucide-react"
import FilterBadges from "./filter-badges"
import { useSearchParams } from "@/hooks/useSearchParams"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filterFields?: DataTableFilterField<TData>[]
  heightProps?: string
  isLoading?: boolean
  filterBadges?: boolean
  children?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  filterFields = [],
  heightProps,
  isLoading,
  filterBadges = true,
  children,
}: DataTableToolbarProps<TData>) {
  const { getAllParams, setParam, removeParams, clearParams } = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)

  const { searchableColumns, filterableColumns } = useMemo(
    () => ({
      searchableColumns: filterFields.filter((f) => !f.options && !f.isSlider),
      filterableColumns: filterFields.filter((f) => f.options || f.isSlider),
    }),
    [filterFields]
  )

  // --- Sync state with URL on load
  useEffect(() => {
    const params = getAllParams()
    const filters = Object.entries(params).map(([key, value]) => ({
      id: key,
      value,
    }))
    table.setColumnFilters(filters)
  }, [getAllParams, table])

  // --- Filter out pagination and search fields
  const activeFilters = table
    .getState()
    .columnFilters.filter((f) => {
        // Exclude "page" and empty/default filters
        if (f.id === "page" || f.value === "all" || !f.value) return false

        // Exclude search-type filters (no options and not slider)
        const isSearchFilter = searchableColumns.some((col) => col.value === f.id)
        return !isSearchFilter
    })

  const activeFiltersCount = activeFilters.length
  const hasActiveSearch = searchableColumns.some((col) => {
    const val = table.getColumn(String(col.value))?.getFilterValue()
    return val && val !== ""
  })

  const clearAllFilters = () => {
    table.resetColumnFilters()
    clearParams()
  }

  return (
    <div className={cn("w-full", heightProps)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {/* Search Inputs */}
        <div className="flex flex-1 flex-wrap items-center gap-4">
          {searchableColumns.map((column) => {
            const col = table.getColumn(String(column.value))
            if (!col) return null
            const val = (col.getFilterValue() as string) ?? ""

            return (
              <div key={String(column.value)} className="relative flex-1 w-full max-w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={column.placeholder || "Search..."}
                  value={val}
                  onChange={(e) => {
                    const value = e.target.value
                    col.setFilterValue(value)
                    setParam(String(column.value), value)
                  }}
                  onKeyDown={(e) => e.key === "Enter" && setParam(String(column.value), val)}
                  className="pl-9 pr-8 h-9"
                />
                {val && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
                    onClick={() => {
                      col.setFilterValue("")
                      setParam(String(column.value), null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )
          })}

          {/* Filters Button */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Funnel className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Filter Options</h4>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        clearAllFilters()
                        setFilterOpen(false)
                      }}
                      className="h-8 px-2 text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                <Separator />

                <div className="space-y-4">
                  {filterableColumns.map((config) => (
                    <div key={config.value as string} className="space-y-2">
                      <Label
                        htmlFor={`${String(config.value)}-filter`}
                        className="text-xs font-medium text-muted-foreground uppercase"
                      >
                        {config.label}
                      </Label>
                      <Select
                        value={
                            (table
                            .getState()
                            .columnFilters.find((f) => f.id === config.value)?.value as string) ?? undefined
                        }
                        onValueChange={(value: string) => {
                            table.setColumnFilters((prev) => {
                            const updated = prev.filter((f) => f.id !== config.value)
                                if (value) updated.push({ id: config.value as string, value })
                                return updated
                            })
                            setParam(String(config.value), value || null)
                        }}
                        >
                        <SelectTrigger id={`${String(config.value)}-filter`} className="h-9 w-[180px]">
                            <SelectValue placeholder={`All ${config.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All {config.label}</SelectItem>
                            {config.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">{children}</div>
      </div>

      <div className="flex justify-between mt-2">
        {filterBadges && activeFiltersCount > 0 && (
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
                <FilterBadges
                filterFields={filterFields.filter(
                    (f) =>
                    f.value !== "page" &&
                    !searchableColumns.some((col) => col.value === f.value)
                )}
                maxVisible={5}
                />
            </div>
        )}
        {filterBadges && activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
      </div>

      
    </div>
  )
}
