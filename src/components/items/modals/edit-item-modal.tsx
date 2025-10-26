"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from "@/components/ui/form"
import { toast } from "sonner"
import { formSchema } from "@/server/actions/items/edit/schema"
import { useEffect, useState } from "react"
import type { FilterOption } from "@/types"
import { useRouter } from "next/navigation"
import { IN_STOCK_ID, LOW_STOCK_ID, OUT_OF_STOCK_ID } from "@/types/db-ids"
import { Field, FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { ItemPromise } from "@/server/database/items/get/item-by-id"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle } from "@/components/ui/alert-dialog"
import { editItemAction } from "@/server/actions/items/edit/action"

interface EditItemModalProps {
  item: ItemPromise
  categories: FilterOption[]
  suppliers: FilterOption[]
  locations: FilterOption[]
  statuses: FilterOption[]
}

export function EditItemModal({ item, categories, suppliers, locations, statuses }: EditItemModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemId: item.Item_ID,
      stockAlertId: item.Stock_Alerts[0].Stock_Alerts_ID,
      name: item.Name,
      sku: item.SKU,
      description: item.Description || "",
      quantity: item.Quantity || undefined,
      categoryId: item.Categories.Category_ID,
      supplierId: item.Suppliers.Supplier_ID,
      locationId: item.Locations.Location_ID,
      unitPrice: item.Unit_Price,
      threshold: item.Threshold,
      statusId: item.Item_Status.Item_Status_ID,
    },
  })

  const quantity = form.watch("quantity")
  const threshold = form.watch("threshold")

  useEffect(() => {
    if (quantity !== undefined && threshold !== undefined) {
      let calculatedStatusId: number

      if (quantity <= 0) {
        calculatedStatusId = OUT_OF_STOCK_ID
      } else if (quantity <= threshold) {
        calculatedStatusId = LOW_STOCK_ID
      } else {
        calculatedStatusId = IN_STOCK_ID
      }

      form.setValue("statusId", calculatedStatusId, { shouldDirty: false })
    }
  }, [quantity, threshold, form])

  const getStatusLabel = () => {
    const statusId = form.watch("statusId")
    const status = statuses.find((s) => Number(s.value) === statusId)
    return status?.label || "Not calculated"
  }

  const getStatusColor = () => {
    const statusId = form.watch("statusId")
    if (statusId === IN_STOCK_ID) return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
    if (statusId === LOW_STOCK_ID) return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
    if (statusId === OUT_OF_STOCK_ID) return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    return ""
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const res = await editItemAction(values)

      setLoading(false)

      if (res.errors) {
        toast.error("Failed to Update Item", {
          description: res.message || "An error occurred while updating this item.",
        })
        console.error(res.errors)
      } else {
        toast.success("Item Updated Successfully")
        router.back()
      }
    } catch (err) {
      toast.error("An unexpected error occurred", {
        description: "Please check the console for details.",
      })
      setLoading(false)
    }
  }
    
  useEffect(() => {
    setIsDirty(form.formState.isDirty)
  }, [form.watch()])

  const handleClose = () => {
    if (isDirty) {
      setShowExitConfirm(true)
    } else {
      router.back()
    }
  }

  const handleConfirmExit = () => {
    setShowExitConfirm(false)
    router.back()
  }

  return (
    <>
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]"
        onPointerDownOutside={(e) => {
            if (isDirty) {
              e.preventDefault()
              setShowExitConfirm(true)
            }
        }}
      >
        <DialogHeader className="border-b pb-4 mb-0">
          <DialogTitle className="flex items-center gap-2">
            Edit Item
            <Badge className={`ml-2 ${getStatusColor()}`}>
              {getStatusLabel()}
            </Badge>
          </DialogTitle>
          <DialogDescription>Update the details for {item.Name}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Basic Information Section */}
              <div className="space-y-4 border-b p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Item Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter item name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          SKU <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter SKU" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Optional item description" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Classification Section */}
              <div className="space-y-4 border-b p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Category <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={String(category.value)}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Supplier <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select supplier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.value} value={String(supplier.value)}>
                                {supplier.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Location <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations.map((loc) => (
                              <SelectItem key={loc.value} value={String(loc.value)}>
                                {loc.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Inventory & Pricing Section */}
              <div className="space-y-4 border-b p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Current Quantity <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Minimum Stock Level <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unitPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Unit Price ($) <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Field>
                    <FieldLabel htmlFor="status">Status (Auto-calculated)</FieldLabel>
                    <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3">
                      <Badge className={getStatusColor()}>{getStatusLabel()}</Badge>
                    </div>
                  </Field>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Item"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
            You have unsaved changes. Are you sure you want to leave? All your changes will be lost.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction
            onClick={handleConfirmExit}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
            Discard Changes
            </AlertDialogAction>
        </AlertDialogFooter>
     </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
