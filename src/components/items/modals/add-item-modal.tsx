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
import { formSchema } from "@/server/actions/items/create/schema"
import { useEffect, useState } from "react"
import type { FilterOption } from "@/types"
import { useRouter } from "next/navigation"
import { createItemAction } from "@/server/actions/items/create/action"
import { 
  IN_STOCK_ID, 
  LOW_STOCK_ID, 
  OUT_OF_STOCK_ID 
} from "@/types/db-ids"
import { Field, FieldLabel } from "@/components/ui/field"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle } from "@/components/ui/alert-dialog"

interface AddItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: FilterOption[]
  suppliers: FilterOption[]
  locations: FilterOption[]
  statuses: FilterOption[]
}

export function AddItemModal({ 
  categories, 
  suppliers, 
  locations, 
  statuses,
  open,
  onOpenChange
}: AddItemModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: undefined,
      sku: undefined,
      description: "",
      quantity: undefined,
      categoryId: undefined,
      supplierId: undefined,
      locationId: undefined,
      unitPrice: undefined,
      threshold: undefined,
      statusId: undefined,
    },
  })

  const quantity = form.watch("quantity")
  const threshold = form.watch("threshold")

  useEffect(() => {
    if (quantity !== undefined && threshold !== undefined) {
      let calculatedStatusId: number

      if (quantity <= 0) {
        // Out of Stock
        calculatedStatusId = OUT_OF_STOCK_ID
      } else if (quantity <= threshold) {
        // Low Stock
        calculatedStatusId = LOW_STOCK_ID
      } else {
        // In Stock
        calculatedStatusId = IN_STOCK_ID
      }

      form.setValue("statusId", calculatedStatusId)
    }
  }, [quantity, threshold, form])

  const getStatusLabel = () => {
    const statusId = form.watch("statusId")
    const status = statuses.find((s) => Number(s.value) === statusId)
    return status?.label || "Not calculated"
  }

  const validateStep = async (step: number) => {
    let fieldsToValidate: (keyof z.infer<typeof formSchema>)[] = []

    switch (step) {
      case 1:
        fieldsToValidate = ["name", "sku"]
        break
      case 2:
        fieldsToValidate = ["categoryId", "supplierId", "locationId"]
        break
      case 3:
        fieldsToValidate = ["quantity", "threshold", "unitPrice"]
        break
    }

    const result = await form.trigger(fieldsToValidate)
    return result
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
      const res = await createItemAction(values)

      setLoading(false)

      if (res.errors) {
        toast.error("Failed to Add Item", {
          description: res.message || "An error occurred while creating this item.",
        })
        console.error(res.errors)
      } else {
        toast.success("Item Added Successfully")
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

  const getCategoryLabel = (id: number | undefined) => {
    return categories.find((c) => Number(c.value) === id)?.label || "N/A"
  }

  const getSupplierLabel = (id: number | undefined) => {
    return suppliers.find((s) => Number(s.value) === id)?.label || "N/A"
  }

  const getLocationLabel = (id: number | undefined) => {
    return locations.find((l) => Number(l.value) === id)?.label || "N/A"
  }

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
        className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]"
        onPointerDownOutside={(e) => {
          if (isDirty) {
            e.preventDefault()
            setShowExitConfirm(true)
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
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
                <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
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
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-foreground">Classification</h3>
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
                          <SelectTrigger className="w-full">
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
                          <SelectTrigger className="w-full">
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
                          <SelectTrigger className="w-full">
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
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-foreground">Inventory & Pricing</h3>
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
                  <FieldLabel htmlFor="statusId">Status (Auto-calculated)</FieldLabel>
                  <Input id="statusId" value={getStatusLabel()} disabled className="bg-muted" />
                </Field>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Review Your Information</h3>
                <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Basic Information</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Item Name:</span>
                        <span className="font-medium">{form.watch("name") || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">SKU:</span>
                        <span className="font-medium">{form.watch("sku") || "N/A"}</span>
                      </div>
                      {form.watch("description") && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Description:</span>
                          <p className="mt-1 text-foreground">{form.watch("description")}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-muted-foreground">Classification</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium">{getCategoryLabel(form.watch("categoryId"))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Supplier:</span>
                        <span className="font-medium">{getSupplierLabel(form.watch("supplierId"))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{getLocationLabel(form.watch("locationId"))}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-muted-foreground">Inventory & Pricing</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium">{form.watch("quantity") ?? "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Min Stock Level:</span>
                        <span className="font-medium">{form.watch("threshold") ?? "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Unit Price:</span>
                        <span className="font-medium">${form.watch("unitPrice")?.toFixed(2) ?? "0.00"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium">{getStatusLabel()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
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
                    {loading ? "Saving..." : "Add Item"}
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
