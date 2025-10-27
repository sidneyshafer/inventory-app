import type { DataTableFilterField, FilterOption } from "@/types"
import type { PurchaseOrdersPromise } from "@/server/database/purchase-orders/getPurchaseOrders"

interface purchaseOrderFilterConfigsProps {
  suppliers: FilterOption[]
  statuses: FilterOption[]
  priorities: FilterOption[]
}

export const purchaseOrderFilterFields = ({
  suppliers,
  statuses,
  priorities,
}: purchaseOrderFilterConfigsProps): DataTableFilterField<PurchaseOrdersPromise>[] => [
  {
    label: "Search",
    value: "Search_Term",
    placeholder: "Search by order ID or supplier...",
  },
  {
    label: "Supplier",
    value: "Supplier_ID",
    options: suppliers.map((sup) => ({
      label: sup.label,
      value: sup.value,
    })),
  },
  {
    label: "Status",
    value: "Status_ID",
    options: statuses.map((status) => ({
      label: status.label,
      value: status.value,
    })),
  },
  {
    label: "Priority",
    value: "Priority_ID",
    options: priorities.map((pr) => ({
      label: pr.label,
      value: pr.value,
    })),
  },
]
