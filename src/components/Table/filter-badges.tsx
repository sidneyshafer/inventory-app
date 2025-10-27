"use client"

import React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { DataTableFilterField } from "@/types"

interface FilterBadgesProps<TData> {
  filterFields: DataTableFilterField<TData>[]
  maxVisible?: number
  tableId?: string
}

export default function FilterBadges<TData>({
  filterFields,
  maxVisible = 5,
  tableId = "table",
}: FilterBadgesProps<TData>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeFilters = React.useMemo(() => {
    const filters: Array<{ key: string; label: string; value: string; displayValue: string }> = []

    filterFields.forEach((field) => {
      const paramValue = searchParams.get(field.value as string)
      if (paramValue) {
        // Handle multi-select filters (values separated by dots)
        if (field.options && paramValue.includes(".")) {
          const values = paramValue.split(".")
          const displayValues = values.map((v) => field.options?.find((opt) => opt.value === v)?.label || v).join(", ")
          filters.push({
            key: field.value as string,
            label: field.label,
            value: paramValue,
            displayValue: `${field.label}: ${displayValues}`,
          })
        } else if (field.options) {
          // Single select filter
          const option = field.options.find((opt) => opt.value === paramValue)
          filters.push({
            key: field.value as string,
            label: field.label,
            value: paramValue,
            displayValue: `${field.label}: ${option?.label || paramValue}`,
          })
        } else {
          // Search filter
          filters.push({
            key: field.value as string,
            label: field.label,
            value: paramValue,
            displayValue: `${field.label}: ${paramValue}`,
          })
        }
      }
    })

    return filters
  }, [filterFields, searchParams])

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  if (activeFilters.length === 0) return null

  const visibleFilters = activeFilters.slice(0, maxVisible)
  const hiddenCount = activeFilters.length - maxVisible

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {visibleFilters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="gap-2 pl-3 pr-1.5 py-1.5 rounded-full border border-border/50 bg-secondary/50 hover:bg-secondary/80 transition-colors duration-200 shadow-sm"
        >
          <span className="text-xs font-medium text-foreground">{filter.displayValue}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors duration-200 flex items-center justify-center"
            onClick={() => removeFilter(filter.key)}
          >
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">Remove {filter.label} filter</span>
          </Button>
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <Badge
          variant="outline"
          className="text-xs font-medium px-3 py-1.5 rounded-full border-border/50 bg-muted/30 text-muted-foreground"
        >
          +{hiddenCount} more
        </Badge>
      )}
    </div>
  )
}
