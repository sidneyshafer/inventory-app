import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/server/db";

export async function getSupplierStats() {
  noStore();

  const [totalSuppliers, activeSuppliers, activeOrders, totalValueResult] = await Promise.all([
    db.suppliers.count(),

    db.suppliers.count({
      where: { Is_Active: true },
    }),

    db.purchase_Order.count(),

    db.purchase_Order_Item.aggregate({
      _sum: {
        Purchase_Price: true,
      },
    }),
  ]);

  const totalValue = totalValueResult._sum.Purchase_Price?.toNumber?.() ?? 0;

  return {
    totalSuppliers,
    activeSuppliers,
    activeOrders,
    totalValue,
  };
}