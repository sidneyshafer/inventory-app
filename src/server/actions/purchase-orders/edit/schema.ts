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

    orderDate: z.string(),
    expectedDeliveryDate: z.string(),

    purchaseOrderItems: z.array(
    z.object({
        purchaseOrderItemId: z.number().nullable(),
        itemId: z.number().nullable(),
        quantity: z.coerce.number(),
        purchasePrice: z.coerce.number(),
    })),

});

export type FormData = z.infer<typeof formSchema>;