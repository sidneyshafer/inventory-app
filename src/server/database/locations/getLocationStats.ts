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

    db.items.aggregate({
      _count: { Quantity: true },
    }),
  ]);

  return {
    totalLocations,
    activeLocations,
    totalCapacity: totalCapacity._sum.Max_Capacity ?? 0,
    currentStock: currentStock._count.Quantity ?? 0,
  };
}