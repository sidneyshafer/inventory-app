"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { ItemsPromise } from "@/server/database/items/getItems"
import type { getItemStats } from "@/server/database/items/getItemStats"
import { useDataTable } from "@/hooks/useDataTable"
import { DataTable } from "../Table/data-table"
import { DataTableToolbar } from "../Table/data-table-toolbar"
import { DataTableViewOptions } from "../Table/data-table-view-options"
import { itemsColumns } from "./columns"
import { itemsFilterFields } from "./filter-config"
import { ItemsStats } from "./items-stats"
import type { FilterOption } from "@/types"
import { TableFiltersContextProvider } from "@/context/table-filters-context"
import { columnLabels, columnGroups } from "./column-labels-groups"
import { useState } from "react"
import { DeleteItemModal } from "./modals/delete-item-modal"
import { EditItemModal } from "./modals/edit-item-modal"
import { ViewItemModal } from "./modals/view-item-modal"
import { AddItemModal } from "./modals/add-item-modal"

interface ItemsDashboardProps {
  initialData: ItemsPromise[]
  initialPagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
  stats: Awaited<ReturnType<typeof getItemStats>>
  locations: FilterOption[]
  statuses: FilterOption[]
  categories: FilterOption[]
  suppliers: FilterOption[]
}

export default function ItemsDashboard({
  initialData,
  initialPagination,
  stats,
  locations,
  statuses,
  categories,
  suppliers
}: ItemsDashboardProps) {

  const [selectedItem, setSelectedItem] = useState<(ItemsPromise)| undefined>()
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openDetailsModal, setOpenDetailsModal] = useState(false)

  const { table } = useDataTable({
    data: initialData,
    columns: itemsColumns({
      setSelectedItem,
      setOpenDeleteModal,
      setOpenEditModal,
      setOpenDetailsModal
    }),
    pageCount: initialPagination.totalPages,
    defaultPerPage: initialPagination.pageSize,
    filterFields: itemsFilterFields({ 
      locations, 
      statuses, 
      categories 
    }),
  })

  return (
    <TableFiltersContextProvider
        initialFilters={{
          "itemsTable": {
            locations,
            statuses,
            categories
          }
        }}
      >
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Items</h1>
          <p className="text-muted-foreground">Manage your inventory items</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setOpenCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <ItemsStats stats={stats} />

      <Card className="rounded-md shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>Search and filter your inventory</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable table={table} count={initialPagination.totalCount}>
            <DataTableToolbar
              table={table}
              filterFields={itemsFilterFields({ locations, statuses, categories })}
              heightProps="h-auto"
            >
              <DataTableViewOptions table={table} columnGroups={columnGroups} columnLabels={columnLabels} />
            </DataTableToolbar>
          </DataTable>
        </CardContent>
      </Card>
    </div>
    {selectedItem &&
      <>
        <DeleteItemModal
          item={selectedItem} 
          open={openDeleteModal} 
          onOpenChange={setOpenDeleteModal} 
        />
        <EditItemModal
          item={selectedItem}
          open={openEditModal}
          onOpenChange={setOpenEditModal}
          categories={categories}
          locations={locations}
          statuses={statuses}
          suppliers={suppliers}
        />
        <ViewItemModal 
          item={selectedItem}
          open={openDetailsModal}
          onOpenChange={setOpenDetailsModal}
          categories={categories}
          locations={locations}
          suppliers={suppliers}
          statuses={statuses}
        />
      </>
    }
    <AddItemModal
      open={openCreateModal}
      onOpenChange={setOpenCreateModal}
      categories={categories}
      suppliers={suppliers}
      locations={locations}
      statuses={statuses}
    />
    </TableFiltersContextProvider>
  )
}
