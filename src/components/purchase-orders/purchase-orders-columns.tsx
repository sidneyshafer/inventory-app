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
import { MoreHorizontal, Edit, Trash2, Eye, Download } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import type { PurchaseOrdersPromise } from "@/server/database/purchase-orders/get/purchase-orders"
import { 
  PENDING_APPROVAL,
  APPROVED,
  ORDERED,
  RECEIVED_PARTIAL,
  RECEIVED_FULL,
  COMPLETED,
  CANCELLED,
  REJECTED,
  PRIORITY_LOW,
  PRIORITY_MEDIUM,
  PRIORITY_HIGH
} from "@/types/db-ids"

const getStatusBadge = (id: number, text: string) => {
  switch (id) {
    case PENDING_APPROVAL:
      return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20">{text}</Badge>
    case APPROVED:
      return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">{text}</Badge>
    case RECEIVED_PARTIAL:
      return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">{text}</Badge>
    case RECEIVED_FULL:
      return <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20">{text}</Badge>
    case COMPLETED:
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">{text}</Badge>
    case CANCELLED:
      return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">{text}</Badge>
    case REJECTED:
      return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">{text}</Badge>
    default:
      return <Badge>{text}</Badge>
  }
}

const getPriorityBadge = (id: number, text: string) => {
  switch (id) {
    case PRIORITY_HIGH:
      return <Badge variant="destructive">{text}</Badge>
    case PRIORITY_MEDIUM:
      return <Badge variant="outline">{text}</Badge>
    case PRIORITY_LOW:
      return <Badge variant="secondary">{text}</Badge>
    default:
      return <Badge>{text}</Badge>
  }
}

export const purchaseOrdersColumns: ColumnDef<PurchaseOrdersPromise>[] = [
  {
    accessorKey: "Purchase_Order_ID",
    header: "Order ID",
    cell: ({ row }) => <span className="font-medium">PO-0{row.original.Purchase_Order_ID}</span>,
  },
  {
    accessorKey: "Suppliers.Name",
    header: "Supplier",
    cell: ({ row }) => <span>{row.original.Suppliers.Name}</span>,
  },
  {
    accessorKey: "Order_Date_Made",
    header: "Order Date",
    cell: ({ row }) => row.original.Order_Date_Made,
  },
  {
    accessorKey: "Item_Count",
    header: "Items",
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.Item_Count}</span>,
  },
  {
    accessorKey: "Total_Amount",
    header: "Amount",
    cell: ({ row }) => <span className="font-semibold">${row.original.Total_Amount.toLocaleString()}</span>,
  },
  {
    accessorKey: "Purchase_Order_Priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.original.Purchase_Order_Priority
      return getPriorityBadge(priority.Purchase_Order_Priority_ID, priority.Description)
    },
  },
  {
    accessorKey: "Purchase_Order_Status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.Purchase_Order_Status
      return getStatusBadge(status.Purchase_Order_Status_ID, status.Description)
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
              Edit Order
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Cancel Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]