"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import type { PurchaseOrdersPromise } from "@/server/database/purchase-orders/get/purchase-orders"
import type { getPurchaseOrderStats } from "@/server/database/purchase-orders/get/purchase-order-stats"
import { useReactTable, getCoreRowModel } from "@tanstack/react-table"
import { getPurchaseOrdersAction } from "@/server/actions/purchase-orders/get/purchase-orders"
import { useDataTableFilters } from "@/hooks/use-data-table-filters"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableFilters } from "@/components/data-table/data-table-filters"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { purchaseOrdersColumns } from "./purchase-orders-columns"
import { purchaseOrderFilterConfigs } from "./purchase-orders-filter-config"
import { PurchaseOrderStats } from "./purchase-orders-stats"
import { FilterOption } from "@/types"

interface PurchaseOrderDashboardProps {
  initialData: PurchaseOrdersPromise[]
  initialPagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
  stats: Awaited<ReturnType<typeof getPurchaseOrderStats>>
  suppliers: FilterOption[]
  statuses: FilterOption[]
  priorities: FilterOption[]
}

export default function PurchaseOrderDashboard({ 
  initialData, 
  initialPagination, 
  stats, 
  suppliers,
  statuses,
  priorities
}: PurchaseOrderDashboardProps) {
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
    clearSearch,
    removeFilter,
    hasActiveSearch,
    hasActiveFilters,
    activeFilterCount,
  } = useDataTableFilters({
    initialData,
    initialPagination,
    filterConfigs: purchaseOrderFilterConfigs({ suppliers, statuses, priorities }),
    fetchData: async ({ page, pageSize, search, filters }) => {
      const result = await getPurchaseOrdersAction({
        page,
        pageSize,
        search,
        supplier: filters.supplier,
        status: filters.status,
        priority: filters.priority,
      })
      return result
    },
    urlParamMapping: {
      search: "Search_Term",
      page: "page",
      pageSize: "per_page",
      supplier: "Supplier_ID",
      priority: "Priority_ID",
      status: "Status_ID",
    },
  })

  const table = useReactTable({
    data,
    columns: purchaseOrdersColumns,
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
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage and track purchase orders</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      </div>

      <PurchaseOrderStats stats={stats} />

      <Card className="rounded-md shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Purchase Orders</CardTitle>
              <CardDescription>View and manage all purchase orders</CardDescription>
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
            onClearSearch={clearSearch}
            filters={filters}
            filterConfigs={purchaseOrderFilterConfigs({ suppliers, statuses, priorities })}
            onFilterChange={handleFilterChange}
            onRemoveFilter={removeFilter}
            onClearAll={clearAllFilters}
            hasActiveSearch={hasActiveSearch}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={activeFilterCount}
            isLoading={isLoading}
            searchPlaceholder="Search by order ID or supplier..."
          />

          <div className="mt-6">
            <DataTable
              table={table}
              columns={purchaseOrdersColumns.length}
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