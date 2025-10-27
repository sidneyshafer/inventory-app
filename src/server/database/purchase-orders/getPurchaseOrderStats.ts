import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/server/db";
import { PENDING_APPROVAL, PRIORITY_HIGH } from "@/types/db-ids";

export async function getPurchaseOrderStats() {
  noStore();

  const [total, pendingApproval, active, totalValue] = await Promise.all([
    db.purchase_Order.count(),

    db.purchase_Order.count({
      where: { Purchase_Order_Status_ID: PENDING_APPROVAL },
    }),

    db.purchase_Order.count({
      where: { Purchase_Order_Priority_ID: PRIORITY_HIGH },
    }),

    db.purchase_Order_Item.aggregate({
      _sum: {
        Purchase_Price: true,
      },
      where: {
        Purchase_Order: {
          Is_Active: true,
        },
      },
    }),

  ]);

  return {
    total,
    pendingApproval,
    active,
    totalValue,
  };
}