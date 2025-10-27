import "server-only"
import { unstable_noStore as noStore } from "next/cache"
import { db } from "@/server/db"

export async function getCategoryOptions() {
  noStore()

  const categories = await db.categories.findMany({
    where: { Is_Active: true },
    select: {
      Category_ID: true,
      Description: true,
    },
    orderBy: {
      Description: "asc",
    },
  })

  const options = categories.map((loc) => ({
    value: String(loc.Category_ID),
    label: loc.Description,
  }))

  return options;
}
