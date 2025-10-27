"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useDataTable } from "@/hooks/useDataTable"
import { DataTable } from "../Table/data-table"
import { DataTableToolbar } from "../Table/data-table-toolbar"
import { DataTableViewOptions } from "../Table/data-table-view-options"
import { purchaseOrdersColumns } from "./columns"
import { PurchaseOrderStats } from "./purchase-orders-stats"
import type { FilterOption } from "@/types"
import { useRouter } from "next/navigation"
import { TableFiltersContextProvider } from "@/context/table-filters-context"
import { columnLabels, columnGroups } from "./column-labels-groups"
import { PurchaseOrdersPromise } from "@/server/database/purchase-orders/get/purchase-orders"
import { getPurchaseOrderStats } from "@/server/database/purchase-orders/get/purchase-order-stats"
import { purchaseOrderFilterFields } from "./filter-config"

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
  priorities,
}: PurchaseOrderDashboardProps) {
  const router = useRouter()

  const { table } = useDataTable({
    data: initialData,
    columns: purchaseOrdersColumns,
    pageCount: initialPagination.totalPages,
    defaultPerPage: initialPagination.pageSize,
    filterFields: purchaseOrderFilterFields({ suppliers, statuses, priorities }),
  })

  return (
    <TableFiltersContextProvider
        initialFilters={{
          "purchaseOrdersTable": {
            suppliers,
            statuses,
            priorities
          }
        }}
      >
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage and track purchase orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push(`/purchase-orders/create`)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        </div>
      </div>

      <PurchaseOrderStats stats={stats} />

      <Card className="rounded-md shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
           <div>
              <CardTitle>All Purchase Orders</CardTitle>
              <CardDescription>View and manage all purchase orders</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable table={table} count={initialPagination.totalCount}>
            <DataTableToolbar
              table={table}
              filterFields={purchaseOrderFilterFields({ suppliers, statuses, priorities })}
              heightProps="h-auto"
            >
              <DataTableViewOptions 
                table={table} 
                columnGroups={columnGroups} 
                columnLabels={columnLabels} 
              />
            </DataTableToolbar>
          </DataTable>
        </CardContent>
      </Card>
    </div>
    </TableFiltersContextProvider>
  )
}
