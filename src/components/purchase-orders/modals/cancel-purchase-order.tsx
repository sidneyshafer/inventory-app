"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PurchaseOrdersPromise } from "@/server/database/purchase-orders/getPurchaseOrders"
import { cancelPurchaseOrderAction } from "@/server/actions/purchase-orders/cancel/action"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CancelOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOrderChange: (order: PurchaseOrdersPromise | undefined) => void
  order: PurchaseOrdersPromise
}

export function CancelOrderModal({ 
    open, 
    onOpenChange, 
    onOrderChange,
    order 
}: CancelOrderModalProps) {
   const [loading, setLoading] = useState(false)
   const router = useRouter()
  
   async function handleCancel(id: number) {
     try {
      const res = await cancelPurchaseOrderAction(id)

      setLoading(false)

      if (res.errors) {
        toast.error("Failed to Cancel Order", {
          description: res.message || "An error occurred while cancelling this order.",
        })
        console.error(res.errors)
      } else {
        toast.success("Order Successfully Cancelled")
        router.refresh()
        onOpenChange(false)
      }
    } catch (err) {
      toast.error("An unexpected error occurred", {
        description: "Please check the console for details.",
      })
      setLoading(false)
    }
    onOrderChange(undefined)
    onOpenChange(false)
    onOrderChange(undefined)
  }

  return (
    <Dialog open={open}
      onOpenChange={() => {
        onOpenChange(false)
        onOrderChange(undefined)
      }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Purchase Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this purchase order? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {order && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="font-semibold">PO-0{order.Purchase_Order_ID}</p>
            <p className="text-sm text-muted-foreground">Supplier: {order.Suppliers.Name}</p>
            <p className="text-sm text-muted-foreground">Items: {order.Item_Count}</p>
            <p className="text-sm text-muted-foreground">Total: ${order.Total_Amount.toLocaleString()}</p>
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Keep Order
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            disabled={loading}
            onClick={() => handleCancel(order.Purchase_Order_ID)}
          >
            {loading ? "Cancelling..." : "Cancel Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
