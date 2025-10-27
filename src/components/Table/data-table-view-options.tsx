"use client"

import { useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
  columnLabels?: Record<string, string>
  columnGroups?: Record<string, string>
}

export function DataTableViewOptions<TData>({
  table,
  columnLabels = {},
  columnGroups = {},
}: DataTableViewOptionsProps<TData>) {
  const [search, setSearch] = useState("")

  const allColumns = table.getAllColumns().filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide())

  const groupedColumns = allColumns.reduce<Record<string, typeof allColumns>>((groups, col) => {
    const group = columnGroups[col.id] || "Other"
    if (!groups[group]) groups[group] = []
    groups[group].push(col)
    return groups
  }, {})

  return (
    <Popover>
    <PopoverTrigger asChild>
        <Button variant="outline" className="bg-transparent">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Columns
        </Button>
    </PopoverTrigger>

    <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
        <div className="space-y-1">
            <Label htmlFor="column-search">Search Columns</Label>
            <Input
                id="column-search"
                placeholder="Type to filter..."
                value={search}
                onChange={(e) => setSearch(e.target.value.toLowerCase())}
            />
        </div>

        <ScrollArea className="h-[300px] pr-2">
            {Object.entries(groupedColumns).map(([group, cols]) => {
            const filtered = cols.filter((c) => c.id.toLowerCase().includes(search))
            if (filtered.length === 0) return null

            return (
                <div key={group} className="mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">{group}</p>
                {filtered.map((column) => (
                    <label key={column.id} className="flex items-center space-x-2 py-1 cursor-pointer">
                    <Checkbox
                        checked={column.getIsVisible()}
                        onCheckedChange={(checked) => column.toggleVisibility(!!checked)}
                    />
                    <span className="capitalize text-sm">{columnLabels[column.id] ?? column.id}</span>
                    </label>
                ))}
                <Separator className="my-2" />
                </div>
            )
            })}
        </ScrollArea>
        </div>
    </PopoverContent>
    </Popover>
  )
}
