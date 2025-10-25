"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import type { ItemsPromise } from "@/server/database/items/get/items"
import type { getItemStats } from "@/server/database/items/get/item-stats"
import { useReactTable, getCoreRowModel } from "@tanstack/react-table"
import { getItemsAction } from "@/server/actions/get/items"
import { useDataTableFilters } from "@/hooks/use-data-table-filters"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableFilters } from "@/components/data-table/data-table-filters"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { itemsColumns } from "./items-columns"
import { itemsFilterConfigs } from "./items-filter-config"
import { ItemsStats } from "./items-stats"

interface ItemsDashboardProps {
  initialData: ItemsPromise[]
  initialPagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
  stats: Awaited<ReturnType<typeof getItemStats>>
}

export default function ItemsDashboard({ initialData, initialPagination, stats }: ItemsDashboardProps) {
  const {
    data,
    searchQuery,
    setSearchQuery,
    filters,
    isLoading,
    pagination,
    setPagination,
    totalCount,
    handleSearch,
    handleFilterChange,
    handlePaginationChange,
    clearAllFilters,
    removeFilter,
    hasActiveFilters,
    activeFilterCount,
  } = useDataTableFilters({
    initialData,
    initialPagination,
    filterConfigs: itemsFilterConfigs,
    fetchData: async ({ page, pageSize, search, filters }) => {
      const result = await getItemsAction({
        page,
        pageSize,
        search,
        category: filters.category,
        location: filters.location,
        quantityRange: filters.quantityRange,
        status: filters.status,
      })
      return result
    },
    urlParamMapping: {
      search: "Search_Term",
      page: "page",
      pageSize: "per_page",
      category: "Category_ID",
      location: "Location_ID",
      status: "Status_ID",
    },
  })

  const table = useReactTable({
    data,
    columns: itemsColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  })

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Items</h1>
          <p className="text-muted-foreground">Manage your inventory items</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <ItemsStats stats={stats} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>Search and filter your inventory</CardDescription>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTableFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={handleSearch}
            filters={filters}
            filterConfigs={itemsFilterConfigs}
            onFilterChange={handleFilterChange}
            onRemoveFilter={removeFilter}
            onClearAll={clearAllFilters}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={activeFilterCount}
            isLoading={isLoading}
            searchPlaceholder="Search by name, SKU, or ID..."
          />

          <div className="mt-6">
            <DataTable
              table={table}
              columns={itemsColumns.length}
              isLoading={isLoading}
              emptyMessage="No items found."
            />
          </div>

          <DataTablePagination
            table={table}
            totalCount={totalCount}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            onPageChange={handlePaginationChange}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}