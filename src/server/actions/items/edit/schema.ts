import * as z from "zod"

export const formSchema = z.object({
    itemId: z.number(),
    stockAlertId: z.number(),
    name: z.string({
        required_error: "Item Name is required",
        invalid_type_error: "Item Name is required",
    }),

    sku: z.string({
        required_error: "SKU is required",
        invalid_type_error: "SKU is required",
    }),

    description: z.string().optional(),
   
    quantity: z.number({
        required_error: "Quantity is required",
        invalid_type_error: "Quantity is required",
    }).min(0, "Quantity must be a positive number"),

    threshold: z.number({
        required_error: "Min Stock is required",
        invalid_type_error: "Min Stock is required",
    }).min(0, "Min Stock must be a positive number"),
    
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
        required_error: "Unit Price is required",
        invalid_type_error: "Unit Price is required",
    }).min(0, "Unit Price must be a positive number"),
    
    statusId: z.coerce.number({
        required_error: "Status is required",
        invalid_type_error: "Status is required",
    }),
});

export type FormData = z.infer<typeof formSchema>;