"use server"

import { getSuppliers } from "@/server/database/suppliers/getSuppliers";
import { getSupplierStats } from "@/server/database/suppliers/getSupplierStats";
import SuppliersDashboard from "@/components/suppliers";

export default async function SuppliersPage() {
  
  const [suppliers, stats] = await Promise.all([
    getSuppliers(), 
    getSupplierStats()
  ])

  return (
    <SuppliersDashboard 
      suppliers={suppliers} 
      stats={stats} 
    />
  );
}