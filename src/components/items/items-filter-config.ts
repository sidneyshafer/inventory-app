import type { FilterConfig } from "@/hooks/use-data-table-filters"

export const itemsFilterConfigs: FilterConfig[] = [
  {
    key: "category",
    label: "Category",
    options: [
      { value: "all", label: "All Categories" },
      { value: "Electronics", label: "Electronics" },
      { value: "Accessories", label: "Accessories" },
      { value: "Office Supplies", label: "Office Supplies" },
    ],
  },
  {
    key: "location",
    label: "Location",
    options: [
      { value: "all", label: "All Locations" },
      { value: "Warehouse A", label: "Warehouse A" },
      { value: "Warehouse B", label: "Warehouse B" },
    ],
  },
  {
    key: "quantityRange",
    label: "Quantity Range",
    options: [
      { value: "all", label: "All Quantities" },
      { value: "0-50", label: "0 - 50" },
      { value: "51-100", label: "51 - 100" },
      { value: "101-200", label: "101 - 200" },
      { value: "201+", label: "201+" },
    ],
  },
  {
    key: "status",
    label: "Status",
    options: [
      { value: "all", label: "All Status" },
      { value: "1", label: "In Stock" },
      { value: "2", label: "Low Stock" },
      { value: "3", label: "Out of Stock" },
    ],
  },
]
