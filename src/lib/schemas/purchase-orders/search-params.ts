import { z } from "zod"

export const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  Purchase_Order_ID: z.coerce.number().optional(),
  Search_Term: z.string().optional(),
  Supplier_ID: z.string().optional(),
  Status_ID: z.string().optional(),
  Priority_ID: z.string().optional(),
})

export const getPurchaseOrdersSchema = searchParamsSchema
export type GetPurchaseOrdersSchema = z.infer<typeof getPurchaseOrdersSchema>