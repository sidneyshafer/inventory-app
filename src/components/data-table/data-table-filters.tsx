"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Search, X, SlidersHorizontal } from "lucide-react"
import { useState } from "react"
import type { FilterConfig } from "@/hooks/use-data-table-filters"

interface DataTableFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onSearch: () => void
  filters: Record<string, string>
  filterConfigs: FilterConfig[]
  onFilterChange: (key: string, value: string) => void
  onRemoveFilter: (key: string) => void
  onClearAll: () => void
  hasActiveFilters: boolean
  activeFilterCount: number
  isLoading?: boolean
  searchPlaceholder?: string
}

export function DataTableFilters({
  searchQuery,
  onSearchChange,
  onSearch,
  filters,
  filterConfigs,
  onFilterChange,
  onRemoveFilter,
  onClearAll,
  hasActiveFilters,
  activeFilterCount,
  isLoading,
  searchPlaceholder = "Search...",
}: DataTableFiltersProps) {
  const [filterOpen, setFilterOpen] = useState(false)

  const getFilterLabel = (config: FilterConfig, value: string) => {
    const option = config.options.find((opt) => opt.value === value)
    return `${config.label}: ${option?.label || value}`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={onSearch} disabled={isLoading} variant="secondary">
          Search
        </Button>

        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Filter Options</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClearAll()
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
                {filterConfigs.map((config) => (
                  <div key={config.key} className="space-y-2">
                    <Label
                      htmlFor={`${config.key}-filter`}
                      className="text-xs font-medium text-muted-foreground uppercase"
                    >
                      {config.label}
                    </Label>
                    <Select value={filters[config.key]} onValueChange={(value) => onFilterChange(config.key, value)}>
                      <SelectTrigger id={`${config.key}-filter`} className="h-9">
                        <SelectValue placeholder={`All ${config.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {config.options.map((option) => (
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

      {Object.entries(filters).some(([_, value]) => value !== "all") && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filterConfigs.map((config) => {
            const value = filters[config.key]
            if (value === "all") return null
            return (
              <Badge key={config.key} variant="secondary" className="gap-1 pr-1">
                {getFilterLabel(config, value)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => onRemoveFilter(config.key)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-7 text-xs">
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}