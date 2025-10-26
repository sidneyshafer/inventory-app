"use client"

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import type { FilterOption } from "@/types"
import { 
  IN_STOCK_ID, 
  LOW_STOCK_ID, 
  OUT_OF_STOCK_ID 
} from "@/types/db-ids"
import { 
  Package, 
  Tag, 
  MapPin, 
  Building2, 
  DollarSign, 
  TrendingDown 
} from "lucide-react"
import { ItemPromise } from "@/server/database/items/get/item-by-id"

interface ViewItemModalProps {
  item: ItemPromise
  categories: FilterOption[]
  suppliers: FilterOption[]
  locations: FilterOption[]
  statuses: FilterOption[]
}

export function ViewItemModal({ 
  item, 
  categories, 
  suppliers, 
  locations, 
  statuses 
}: ViewItemModalProps) {
  const router = useRouter()

  const getCategoryLabel = () => categories.find((c) => Number(c.value) === item.Categories.Category_ID)?.label || "N/A"
  const getSupplierLabel = () => suppliers.find((s) => Number(s.value) === item.Suppliers.Supplier_ID)?.label || "N/A"
  const getLocationLabel = () => locations.find((l) => Number(l.value) === item.Locations.Location_ID)?.label || "N/A"
  const getStatusLabel = () => statuses.find((s) => Number(s.value) === item.Item_Status.Item_Status_ID)?.label || "Unknown"

  const getStatusColor = () => {
    if (item.Item_Status.Item_Status_ID === IN_STOCK_ID) return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
    if (item.Item_Status.Item_Status_ID === LOW_STOCK_ID) return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
    if (item.Item_Status.Item_Status_ID === OUT_OF_STOCK_ID) return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    return ""
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const totalValue = ((item.Quantity ?? 0) * (item.Unit_Price ?? 0))

  return (
    <Dialog open={true} onOpenChange={() => router.back()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl">{item.Name}</DialogTitle>
              <DialogDescription className="text-base">SKU: {item.SKU}</DialogDescription>
            </div>
            <Badge className={`text-sm mr-4 ${getStatusColor()}`}>
              {getStatusLabel()}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {item.Description && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{item.Description}</p>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Stock</p>
                <p className="text-2xl font-semibold">{item.Quantity}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-semibold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Item Details</h3>
            <div className="grid gap-4 rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span>Category</span>
                </div>
                <span className="font-medium">{getCategoryLabel()}</span>
              </div>

              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Supplier</span>
                </div>
                <span className="font-medium">{getSupplierLabel()}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Location</span>
                </div>
                <span className="font-medium">{getLocationLabel()}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Pricing & Inventory</h3>
            <div className="grid gap-4 rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-sm text-muted-foreground">Unit Price</span>
                <span className="text-lg font-semibold">{formatCurrency(item.Unit_Price)}</span>
              </div>

              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-sm text-muted-foreground">Current Quantity</span>
                <span className="font-medium">{item.Quantity} units</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingDown className="h-4 w-4" />
                  <span>Minimum Stock Level</span>
                </div>
                <span className="font-medium">{item.Threshold} units</span>
              </div>
            </div>
          </div>

          {/* Stock Alert */}
          {(item.Quantity ?? 0) <= item.Threshold && (
            <div
              className={`rounded-lg border p-4 ${
                item.Quantity === 0 ? "border-destructive/50 bg-destructive/10" : "border-warning/50 bg-warning/10"
              }`}
            >
              <p className="text-sm font-medium">
                {item.Quantity === 0 ? "⚠️ This item is out of stock" : "⚠️ This item is running low on stock"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.Quantity === 0
                  ? "Restock immediately to avoid disruptions"
                  : `Only ${item.Quantity} units remaining. Consider restocking soon.`}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
