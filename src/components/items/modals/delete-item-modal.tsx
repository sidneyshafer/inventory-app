"use client"

import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { ItemsPromise } from "@/server/database/items/getItems"
import { toast } from "sonner"
import { useState } from "react"
import { deleteItemAction } from "@/server/actions/items/delete/action"
import { useRouter } from "next/navigation"

interface DeleteItemModalProps {
  item: ItemsPromise
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteItemModal({ 
  item,
  open,
  onOpenChange
}: DeleteItemModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const totalValue = (item.Quantity ?? 0) * (item.Unit_Price ?? 0)

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await deleteItemAction(item.Item_ID)

      setLoading(false)

      if (res.errors) {
        toast.error("Failed to Delete Item", {
          description: res.message || "An error occurred while deleting this item.",
        })
      } else {
        toast.success("Item Deleted Successfully")
        router.refresh()
        onOpenChange(false)
      }
    } catch (err) {
      toast.error("An unexpected error occurred", {
        description: "Please check the console for details.",
      })
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl">Delete Item</DialogTitle>
              <DialogDescription className="text-base">
                This action cannot be undone. This will permanently delete the item from your inventory.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Item Details Card */}
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Item Name</p>
                <p className="text-lg font-semibold">{item.Name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-3">
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-medium">{item.SKU}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">{item.Quantity} units</p>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground">Total Inventory Value</p>
                <p className="text-xl font-semibold text-destructive">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Are you sure you want to delete <span className="font-semibold text-foreground">{item.Name}</span>? All
              associated data will be permanently removed from the system.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Item"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}