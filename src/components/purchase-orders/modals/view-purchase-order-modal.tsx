"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { FilterOption } from "@/types"
import { PurchaseOrdersPromise } from "@/server/database/purchase-orders/getPurchaseOrders"
import {
  APPROVED,
  CANCELLED,
  COMPLETED,
  PENDING_APPROVAL,
  PRIORITY_HIGH,
  PRIORITY_LOW,
  PRIORITY_MEDIUM,
  RECEIVED_FULL,
  RECEIVED_PARTIAL,
  REJECTED,
} from "@/types/db-ids"
import { 
    Calendar, 
    Package, 
    Building2, 
    DollarSign, 
    TrendingUp, 
    Clock, 
    AlertCircle 
} from "lucide-react"
import { format as formatDate } from "date-fns"

interface ViewPurchaseOrderModalProps {
  order: PurchaseOrdersPromise
  open: boolean
  onOpenChange: (open: boolean) => void
  onOrderChange: (order: PurchaseOrdersPromise | undefined) => void
  suppliers: FilterOption[]
  priorities: FilterOption[]
  statuses: FilterOption[]
}

export function ViewPurchaseOrderModal({
  order,
  open,
  onOpenChange,
  onOrderChange,
  suppliers,
  priorities,
  statuses,
}: ViewPurchaseOrderModalProps) {
  const getSupplierLabel = () => suppliers.find((s) => Number(s.value) === order.Suppliers.Supplier_ID)?.label || "N/A"
  
  const getPriorityLabel = () => priorities.find((p) => Number(p.value) === order.Purchase_Order_Priority.Purchase_Order_Priority_ID)?.label || "N/A"
  
  const getStatusLabel = () => statuses.find((s) => Number(s.value) === order.Purchase_Order_Status.Purchase_Order_Status_ID)?.label || "Unknown"

  const getStatusColor = () => {
    const statusId = order.Purchase_Order_Status.Purchase_Order_Status_ID
    if (statusId === PENDING_APPROVAL) return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
    if (statusId === APPROVED) return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
    if (statusId === RECEIVED_PARTIAL) return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
    if (statusId === RECEIVED_FULL) return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
    if (statusId === COMPLETED) return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
    if (statusId === CANCELLED) return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    if (statusId === REJECTED) return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    return ""
  }

  const getPriorityColor = () => {
    const priorityId = order.Purchase_Order_Priority.Purchase_Order_Priority_ID
    if (priorityId === PRIORITY_HIGH) return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    if (priorityId === PRIORITY_MEDIUM) return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
    if (priorityId === PRIORITY_LOW) return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    return ""
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const calculateTotal = () => {
    return (order.Purchase_Order_Item || []).reduce((sum, item) => sum + item.Quantity * Number(item.Purchase_Price), 0)
  }

  const totalItems = (order.Purchase_Order_Item || []).reduce((sum, item) => sum + item.Quantity, 0)

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        onOpenChange(false)
        onOrderChange(undefined)
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl">Purchase Order #{order.Purchase_Order_ID}</DialogTitle>
              <DialogDescription className="text-base">
                Order placed on {formatDate(new Date(order.Order_Date_Made?.toString() ?? ""), "PPP")}
              </DialogDescription>
            </div>
            <Badge className={`text-sm mr-4 ${getStatusColor()}`}>{getStatusLabel()}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-semibold">{totalItems}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-semibold">{formatCurrency(calculateTotal())}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className={`h-5 w-5 ${getPriorityColor().split(" ")[1]}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Priority</p>
                <Badge className={`mt-1 ${getPriorityColor()}`}>{getPriorityLabel()}</Badge>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Order Details</h3>
            <div className="grid gap-4 rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Supplier</span>
                </div>
                <span className="font-medium">{getSupplierLabel()}</span>
              </div>

              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Order Date</span>
                </div>
                <span className="font-medium">{formatDate(new Date(order.Order_Date_Made?.toString() ?? ""), "PPP")}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Expected Delivery</span>
                </div>
                <span className="font-medium">{formatDate(new Date(order.Expected_Delivery_Date?.toString() ?? ""), "PPP")}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Order Items</h3>
            <div className="space-y-3">
              {(order.Purchase_Order_Item || []).map((item, index) => (
                <div key={index} className="rounded-lg border bg-card p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{item.Items.Name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {item.Items.SKU}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.Quantity * Number(item.Purchase_Price))}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.Quantity} × {formatCurrency(Number(item.Purchase_Price))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Summary */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total Amount</span>
              <span className="text-2xl font-bold">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>

          {/* Delivery Alerts */}
          {order.Purchase_Order_Status.Purchase_Order_Status_ID === PENDING_APPROVAL && (
            <div className="rounded-lg border border-orange-500/50 bg-orange-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-500">Pending Approval</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This purchase order is awaiting approval before processing.
                  </p>
                </div>
              </div>
            </div>
          )}
          {order.Purchase_Order_Status.Purchase_Order_Status_ID === CANCELLED && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-500">Cancelled</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This purchase order has been cancelled and will not be processed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}