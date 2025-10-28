import * as z from "zod"

export const formSchema = z.object({

    purchaseOrderId: z.coerce.number(),

    supplierId: z.coerce.number({
        required_error: "Supplier is required",
        invalid_type_error: "Supplier is required",
    }),

    priorityId: z.coerce.number({
        required_error: "Priority is required",
        invalid_type_error: "Priority is required",
    }),

    statusId: z.coerce.number({
        required_error: "Status is required",
        invalid_type_error: "Status is required",
    }),

    orderDate: z.string({
        required_error: "Order Date is required",
        invalid_type_error: "Order Date is required",
    }),

    expectedDeliveryDate: z.string({
        required_error: "Expected delivery date is required",
        invalid_type_error: "Expected delivery date is required",
    }),

    purchaseOrderItems: z.array(z.object({
        purchaseOrderItemId: z.number().nullable(),
        itemId: z.number().nullable(),
        quantity: z.coerce.number({
            required_error: "Quantity is required",
            invalid_type_error: "Quantity is required",
        }),
        purchasePrice: z.coerce.number({
            required_error: "Price is required",
            invalid_type_error: "Price is required",
        }),
    })),

});

export type FormData = z.infer<typeof formSchema>;