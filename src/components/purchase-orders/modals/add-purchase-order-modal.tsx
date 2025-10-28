"use client"

import { useFieldArray, useForm } from "react-hook-form"
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
import { formSchema } from "@/server/actions/purchase-orders/create/schema"
import { useEffect, useState } from "react"
import type { FilterOption } from "@/types"
import { useRouter } from "next/navigation"
import { PENDING_APPROVAL } from "@/types/db-ids"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle } from "@/components/ui/alert-dialog"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format as formatDate } from "date-fns"
import { getItemsBySupplierIdAction } from "@/server/actions/items/getItemsBySupplierId/action"
import { Calendar } from "@/components/ui/calendar"
import { ItemResponse } from "@/server/database/items/getItemBySupplierId"
import { createPurchaseOrderAction } from "@/server/actions/purchase-orders/create/action"

interface AddPurchaseOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  suppliers: FilterOption[]
  priorities: FilterOption[]
  statuses: FilterOption[]
}

export function AddPurchaseOrderModal({ 
  priorities, 
  suppliers,
  statuses,
  open,
  onOpenChange
}: AddPurchaseOrderModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [items, setItems] = useState<ItemResponse[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const totalSteps = 3

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: undefined,
      priorityId: undefined,
      statusId: PENDING_APPROVAL,
      orderDate: "",
      expectedDeliveryDate: "",
      purchaseOrderItems: [],
    },
  })

   const getSupplierLabel = (id: number | undefined) => {
    return suppliers.find((s) => Number(s.value) === id)?.label || "N/A"
  }

  const getPriorityLabel = (id: number | undefined) => {
    return priorities.find((p) => Number(p.value) === id)?.label || "N/A"
  }

  const getStatusLabel = (id: number | undefined) => {
    return statuses.find((s) => Number(s.value) === id)?.label || "N/A"
  }

  const getItemLabel = (id: number | null) => {
    return items.find((i) => Number(i.value) === id)?.label || "N/A"
  }

  const validateStep = async (step: number) => {
    let fieldsToValidate: (keyof z.infer<typeof formSchema>)[] = []

    switch (step) {
      case 1:
        fieldsToValidate = ["supplierId", "priorityId", "orderDate", "expectedDeliveryDate"]
        break
      case 2:
        fieldsToValidate = ["purchaseOrderItems"]
        break
    }

    const result = await form.trigger(fieldsToValidate)
    return result
  }

  const calculateTotal = () => {
    const items = form.watch("purchaseOrderItems") || []
    return items.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0)
  }

  const handleNext = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    const isValid = await validateStep(currentStep)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    
    try {
      const res = await createPurchaseOrderAction(values)

      setLoading(false)

      if (res.errors) {
        toast.error("Failed to Create Order", {
          description: res.message || "An error occurred while creating this order.",
        })
        console.error(res.errors)
      } else {
        toast.success("Order Created Successfully")
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "purchaseOrderItems",
  })

  useEffect(() => {
    const supplierId = form.watch("supplierId")
    if (!supplierId) {
      setItems([])
      return
    }

    setLoadingItems(true)
    getItemsBySupplierIdAction(supplierId)
      .then((res) => setItems(res))
      .catch((err) => console.error("Error fetching items:", err))
      .finally(() => setLoadingItems(false))
  }, [form.watch("supplierId")])

  useEffect(() => {
    setIsDirty(form.formState.isDirty)
  }, [form.watch()])

  const handleClose = () => {
    if (form.formState.isDirty) {
      setShowExitConfirm(true)
    } else {
      onOpenChange(false)
    }
  }

  const handleConfirmExit = () => {
    setShowExitConfirm(false)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]"
          onPointerDownOutside={(e) => {
            if (isDirty) {
              e.preventDefault()
              setShowExitConfirm(true)
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              Step {currentStep} of {totalSteps}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index + 1 <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold text-foreground">Order Details</h3>

                  <div className="grid grid-cols-2 gap-4">
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
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select supplier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {suppliers.map((supplier) => (
                                <SelectItem key={supplier.value} value={supplier.value}>
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
                      name="priorityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Priority <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={field.value ? String(field.value) : ""}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {priorities.map((priority) => (
                                <SelectItem key={priority.value} value={priority.value}>
                                  {priority.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="orderDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Order Date <span className="text-destructive">*</span>
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal bg-transparent"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? formatDate(new Date(field.value), "PPP") : "Pick a date"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => field.onChange(date ? formatDate(date, "yyyy-MM-dd") : "")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expectedDeliveryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Expected Delivery <span className="text-destructive">*</span>
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal bg-transparent"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? formatDate(new Date(field.value), "PPP") : "Pick a date"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => field.onChange(date ? formatDate(date, "yyyy-MM-dd") : "")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Order Items</h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                        append({ itemId: null, quantity: 1, purchasePrice: 0 })
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                    </Button>
                    </div>

                    {form.watch("purchaseOrderItems")?.map((_, index) => (
                    <div
                        key={index}
                        className="rounded-lg border border-border p-4 space-y-4"
                    >
                        <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Item {index + 1}</span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                            const currentItems = form.getValues("purchaseOrderItems") || [];
                            if (currentItems.length > 1) {
                                form.setValue(
                                "purchaseOrderItems",
                                currentItems.filter((_, i) => i !== index)
                                );
                            }
                            }}
                            disabled={(form.watch("purchaseOrderItems")?.length || 0) <= 1}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        </div>

                        {/* Item Select Field */}
                        <FormField
                        control={form.control}
                        name={`purchaseOrderItems.${index}.itemId`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>
                                Item <span className="text-destructive">*</span>
                            </FormLabel>
                            {loadingItems ? (
                                <div className="text-sm text-muted-foreground">
                                Loading items...
                                </div>
                            ) : items.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                No items available for this supplier.
                                </div>
                            ) : (
                                <Select
                                onValueChange={(value) => {
                                    field.onChange(Number(value));
                                    const selectedItem = items.find(
                                    (item) => item.value === value
                                    );
                                    if (selectedItem) {
                                    form.setValue(
                                        `purchaseOrderItems.${index}.purchasePrice`,
                                        selectedItem.meta?.unitPrice
                                    );
                                    }
                                }}
                                value={field.value ? String(field.value) : ""}
                                >
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select item" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {items.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        <div className="flex gap-6 items-center">
                                        <span className="font-medium">{item.label}</span>
                                        <span className="text-xs text-muted-foreground">
                                            SKU: {item.meta?.sku} • Qty:{" "}
                                            {item.meta?.quantity ?? "N/A"} • $
                                            {item.meta?.unitPrice.toFixed(2)}
                                        </span>
                                        </div>
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            )}
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        {/* Quantity and Unit Price Fields */}
                        <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name={`purchaseOrderItems.${index}.quantity`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                Quantity <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                <Input
                                    type="number"
                                    min="1"
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
                            name={`purchaseOrderItems.${index}.purchasePrice`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                Unit Price ($) <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        </div>

                        {/* Subtotal */}
                        <div className="text-right text-sm text-muted-foreground">
                        Subtotal: $
                        {(
                            (form.watch(`purchaseOrderItems.${index}.quantity`) || 0) *
                            (form.watch(`purchaseOrderItems.${index}.purchasePrice`) || 0)
                        ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                    ))}
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold">
                       ${calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Review Your Order</h3>
                  <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Order Details</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Supplier:</span>
                          <span className="font-medium">{getSupplierLabel(form.watch("supplierId"))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Priority:</span>
                          <span className="font-medium">{getPriorityLabel(form.watch("priorityId"))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium">{getStatusLabel(form.watch("statusId"))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Order Date:</span>
                          <span className="font-medium">
                            {form.watch("orderDate") ? formatDate(new Date(form.watch("orderDate")), "PPP") : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Expected Delivery:</span>
                          <span className="font-medium">
                            {form.watch("expectedDeliveryDate")
                              ? formatDate(new Date(form.watch("expectedDeliveryDate")), "PPP")
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-muted-foreground">Order Items</p>
                      <div className="mt-2 space-y-2">
                        {form.watch("purchaseOrderItems")?.map((item, index) => (
                          <div key={index} className="rounded-md bg-background p-3">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{getItemLabel(item.itemId)}</span>
                              <span className="text-muted-foreground">
                                {item.quantity} × ${item.purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = $
                                {(item.quantity * item.purchasePrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total Amount</span>
                        <span className="text-2xl">${calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2">
                <div className="flex gap-2">
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={(e) => handlePrevious(e)}>
                      Previous
                    </Button>
                  )}
                  {currentStep < totalSteps ? (
                    <Button type="button" onClick={(e) => handleNext(e)}>
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Order"}
                    </Button>
                  )}
                </div>
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
