"use server"

import { getItems } from "@/server/database/items/get/items"
import { getItemsSchema } from "@/lib/schemas/items/search-params"

export async function getItemsAction(params: {
  page: number
  pageSize: number
  search?: string
  category?: string
  status?: string
  location?: string
  quantityRange?: string
}) {
  const validatedParams = getItemsSchema.safeParse({
    page: params.page,
    per_page: params.pageSize,
    Search_Term: params.search,
    Category_ID: params.category,
    Status_ID: params.status,
    Location_ID: params.location,
  })

  if (!validatedParams.success) {
    console.error("[v0] Invalid params:", validatedParams.error)
    throw new Error("Invalid parameters")
  }

  return await getItems(validatedParams.data)
}