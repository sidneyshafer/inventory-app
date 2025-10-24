import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/server/db";
import { IN_STOCK_ID, LOW_STOCK_ID, OUT_OF_STOCK_ID } from "@/types/db-ids";

export async function getItemStats() {
  noStore();

  const [totalItems, inStock, lowStock, outOfStock] = await Promise.all([
    db.items.count(),

    db.items.count({
      where: { Status_ID: IN_STOCK_ID },
    }),

    db.items.count({
      where: { Status_ID: LOW_STOCK_ID },
    }),

    db.items.count({
      where: { Status_ID: OUT_OF_STOCK_ID },
    }),

  ]);

  return {
    totalItems,
    inStock,
    lowStock,
    outOfStock,
  };
}