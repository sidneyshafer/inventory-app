import "server-only"
import { unstable_noStore as noStore } from "next/cache"
import { db } from "@/server/db"

export async function getLocationOptions() {
  noStore()

  const locations = await db.locations.findMany({
    where: { Is_Active: true },
    select: {
      Location_ID: true,
      Description: true,
    },
    orderBy: {
      Description: "asc",
    },
  })

  const options = locations.map((loc) => ({
    value: String(loc.Location_ID),
    label: loc.Description,
  }))

  return options;
}
