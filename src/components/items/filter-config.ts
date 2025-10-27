import type { DataTableFilterField, FilterOption } from "@/types"
import type { ItemsPromise } from "@/server/database/items/getItems"

interface itemsFilterConfigsProps {
  locations: FilterOption[]
  statuses: FilterOption[]
  categories: FilterOption[]
}

export const itemsFilterFields = ({
  locations,
  statuses,
  categories,
}: itemsFilterConfigsProps): DataTableFilterField<ItemsPromise>[] => [
  {
    label: "Search",
    value: "Search_Term",
    placeholder: "Search by name, SKU, or ID...",
  },
  {
    label: "Category",
    value: "Category_ID",
    options: categories.map((cat) => ({
      label: cat.label,
      value: cat.value,
    })),
  },
  {
    label: "Location",
    value: "Location_ID",
    options: locations.map((loc) => ({
      label: loc.label,
      value: loc.value,
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
]
