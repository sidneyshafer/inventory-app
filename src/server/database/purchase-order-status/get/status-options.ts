import "server-only"
import { unstable_noStore as noStore } from "next/cache"
import { db } from "@/server/db"

export async function getPurchaseOrderStatusOptions() {
  noStore()

  const statuses = await db.purchase_Order_Status.findMany({
    where: { Is_Active: true },
    select: {
      Purchase_Order_Status_ID: true,
      Description: true,
    },
    orderBy: {
      Description: "asc",
    },
  })

  const options = statuses.map((loc) => ({
    value: String(loc.Purchase_Order_Status_ID),
    label: loc.Description,
  }))

  return options;
}
