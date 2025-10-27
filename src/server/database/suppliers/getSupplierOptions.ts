import "server-only"
import { unstable_noStore as noStore } from "next/cache"
import { db } from "@/server/db"

export async function getSupplierOptions() {
  noStore()

  const suppliers = await db.suppliers.findMany({
    where: { Is_Active: true },
    select: {
      Supplier_ID: true,
      Name: true,
    },
    orderBy: {
      Name: "asc",
    },
  })

  const options = suppliers.map((sup) => ({
    value: String(sup.Supplier_ID),
    label: sup.Name,
  }))

  return options;
}