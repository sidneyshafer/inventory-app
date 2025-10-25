import type { FilterConfig, FilterOption } from "@/types"

interface itemsFilterConfigsProps {
  locations: FilterOption[]
  statuses: FilterOption[]
  categories: FilterOption[]
}

export const itemsFilterConfigs = ({
  locations,
  statuses,
  categories
}: itemsFilterConfigsProps): FilterConfig[] => [
  {
    key: "category",
    label: "Category",
    options: [{ value: "all", label: "All Categories" }, ...categories],
  },
  {
    key: "location",
    label: "Location",
    options: [{ value: "all", label: "All Locations" }, ...locations],
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