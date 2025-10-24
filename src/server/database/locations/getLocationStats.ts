import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/server/db";

export async function getLocationStats() {
  noStore();

  const [totalLocations, activeLocations, totalCapacity, currentStock] = await Promise.all([
    db.locations.count(),

    db.locations.count({
      where: { Is_Active: true },
    }),

    db.locations.aggregate({
      _sum: { Max_Capacity: true },
    }),

    // Current Stock (sum of all item quantities assigned to locations)
    db.item_Location.aggregate({
      _count: { Item_Location_ID: true },
    }),
  ]);

  return {
    totalLocations,
    activeLocations,
    totalCapacity: totalCapacity._sum.Max_Capacity ?? 0,
    currentStock: currentStock._count.Item_Location_ID ?? 0,
  };
}