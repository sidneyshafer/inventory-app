import { z } from "zod"

export const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  Item_ID: z.coerce.number().optional(),
  Search_Term: z.string().optional(),
  Category_ID: z.string().optional(),
  Location_ID: z.string().optional(),
  Status_ID: z.string().optional(),
})

export const getItemsSchema = searchParamsSchema
export type GetItemsSchema = z.infer<typeof getItemsSchema>