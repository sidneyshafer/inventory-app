import type { FilterConfig, FilterOption } from "@/types"

interface purchaseOrderFilterConfigsProps {
  suppliers: FilterOption[]
  statuses: FilterOption[]
  priorities: FilterOption[]
}

export const purchaseOrderFilterConfigs = ({
  suppliers,
  statuses,
  priorities
}: purchaseOrderFilterConfigsProps): FilterConfig[] => [
  {
    key: "supplier",
    label: "Supplier",
    options: [{ value: "all", label: "All Suppliers" }, ...suppliers],
  },
  {
    key: "priority",
    label: "Priority",
    options: [{ value: "all", label: "All Priorities" }, ...priorities],
  },
  // {
  //   key: "quantityRange",
  //   label: "Quantity Range",
  //   options: [],
  // },
  {
    key: "status",
    label: "Status",
    options: [{ value: "all", label: "All Statuses" }, ...statuses],
  },
]