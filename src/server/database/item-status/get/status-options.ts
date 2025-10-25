import "server-only"
import { unstable_noStore as noStore } from "next/cache"
import { db } from "@/server/db"

export async function getStatusOptions() {
  noStore()

  const statuses = await db.item_Status.findMany({
    where: { Is_Active: true },
    select: {
      Item_Status_ID: true,
      Description: true,
    },
    orderBy: {
      Description: "asc",
    },
  })

  const options = statuses.map((loc) => ({
    value: String(loc.Item_Status_ID),
    label: loc.Description,
  }))

  return options;
}
