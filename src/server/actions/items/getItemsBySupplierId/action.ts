"use server";

import { getItemsBySupplierId } from "@/server/database/items/get/item-by-supplier-id";

export async function getItemsBySupplierIdAction(id: number) {
  const res = await getItemsBySupplierId(id);
  return res;
}