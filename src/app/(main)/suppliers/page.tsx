"use server"

import { getSuppliers } from "@/server/database/suppliers/get/suppliers";
import { getSupplierStats } from "@/server/database/suppliers/get/supplier-stats";
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