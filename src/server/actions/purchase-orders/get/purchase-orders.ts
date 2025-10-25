"use server"

import { getPurchaseOrders } from "@/server/database/purchase-orders/get/purchase-orders"
import { getPurchaseOrdersSchema } from "@/lib/schemas/purchase-orders/search-params"

export async function getPurchaseOrdersAction(params: {
  page: number
  pageSize: number
  search?: string
  supplier?: string
  status?: string
  priority?: string
}) {
  const validatedParams = getPurchaseOrdersSchema.safeParse({
    page: params.page,
    per_page: params.pageSize,
    Search_Term: params.search,
    Supplier_ID: params.supplier,
    Status_ID: params.status,
    Priority_ID: params.priority,
  })

  if (!validatedParams.success) {
    console.error("[v0] Invalid params:", validatedParams.error)
    throw new Error("Invalid parameters")
  }

  return await getPurchaseOrders(validatedParams.data)
}