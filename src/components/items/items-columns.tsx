import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import type { ItemsPromise } from "@/server/database/items/get/items"
import { IN_STOCK_ID, LOW_STOCK_ID, OUT_OF_STOCK_ID } from "@/types/db-ids"

const getStatusBadge = (id: number, text: string) => {
  switch (id) {
    case IN_STOCK_ID:
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">{text}</Badge>
    case LOW_STOCK_ID:
      return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20">{text}</Badge>
    case OUT_OF_STOCK_ID:
      return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">{text}</Badge>
    default:
      return <Badge>{text}</Badge>
  }
}

export const itemsColumns: ColumnDef<ItemsPromise>[] = [
  {
    accessorKey: "Item_ID",
    header: "Item ID",
    cell: ({ row }) => <span className="font-medium">ITM-0{row.original.Item_ID}</span>,
  },
  {
    accessorKey: "Name",
    header: "Name",
  },
  {
    accessorKey: "SKU",
    header: "SKU",
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.SKU}</span>,
  },
  {
    accessorKey: "Categories.Description",
    header: "Category",
    cell: ({ row }) => row.original.Categories.Description,
  },
  {
    accessorKey: "Quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const quantity = row.original.Quantity ?? 0
      const threshold = row.original.Stock_Alerts[0]?.Threshold ?? 0
      return (
        <div>
          <span className={quantity <= threshold ? "font-semibold text-orange-500" : ""}>{quantity}</span>
          <span className="text-muted-foreground"> / {threshold}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "Locations.Description",
    header: "Location",
    cell: ({ row }) => row.original.Locations.Description,
  },
  {
    accessorKey: "Unit_Price",
    header: "Price",
    cell: ({ row }) => `$${row.original.Unit_Price.toFixed(2)}`,
  },
  {
    accessorKey: "Item_Status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.Item_Status
      return getStatusBadge(status.Item_Status_ID, status.Description)
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Item
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]