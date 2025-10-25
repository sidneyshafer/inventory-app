import "server-only"
import { unstable_noStore as noStore } from "next/cache"
import { db } from "@/server/db"

export async function getPurchaseOrderPriorityOptions() {
  noStore()

  const priorities = await db.purchase_Order_Priority.findMany({
    where: { Is_Active: true },
    select: {
      Purchase_Order_Priority_ID: true,
      Description: true,
    },
    orderBy: {
      Description: "asc",
    },
  })

  const options = priorities.map((p) => ({
    value: String(p.Purchase_Order_Priority_ID),
    label: p.Description,
  }))

  return options;
}
