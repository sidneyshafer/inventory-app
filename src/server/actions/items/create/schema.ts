import * as z from "zod"

export const formSchema = z.object({
    name: z.string(),
    sku: z.string(),
    description: z.string().optional(),
   
    quantity: z.number({
    }).min(0, "Quantity must be a positive number"),
    
    categoryId: z.coerce.number({
        required_error: "Category is required",
        invalid_type_error: "Category is required",
    }),
    
    supplierId: z.coerce.number({
        required_error: "Supplier is required",
        invalid_type_error: "Supplier is required",
    }),
    
    locationId: z.coerce.number({
        required_error: "Location is required",
        invalid_type_error: "Location is required",
    }),
    
    unitPrice: z.number({
    }).min(0, "Unit Price must be a positive number"),
    
    statusId: z.coerce.number({
        required_error: "Status is required",
        invalid_type_error: "Status is required",
    }),
})