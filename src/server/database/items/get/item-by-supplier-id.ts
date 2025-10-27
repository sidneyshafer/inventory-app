"use server"

import { db } from "@/server/db"

export type ItemResponse = {
    value: string;
    label: string
    meta: {
        unitPrice: number
        sku: string;
        quantity: number | null
    }
}

export async function getItemsBySupplierId(supplierId: number): Promise<ItemResponse[]> {
  const items = await db.items.findMany({
    where: { Supplier_ID: supplierId, Is_Active: true },
    select: {
      Item_ID: true,
      Name: true,
      Unit_Price: true,
      SKU: true,
      Quantity: true
    },
    orderBy: { Name: "asc" },
  })

  return items.map((item) => ({
    value: String(item.Item_ID),
    label: item.Name,
    meta: {
        unitPrice: Number(item.Unit_Price),
        sku: item.SKU,
        quantity: item.Quantity
    }
  }))
}