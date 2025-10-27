"use server";

import { getItemsBySupplierId } from "@/server/database/items/getItemBySupplierId";

export async function getItemsBySupplierIdAction(id: number) {
  const res = await getItemsBySupplierId(id);
  return res;
}