"use server"

import { getPurchaseOrders } from "@/server/database/purchase-orders/get/purchase-orders";
import { getPurchaseOrderStats } from "@/server/database/purchase-orders/get/purchase-order-stats";
import { getPurchaseOrderStatusOptions } from "@/server/database/purchase-order-status/get/status-options";
import { getSupplierOptions } from "@/server/database/suppliers/get/supplier-options";
import { getPurchaseOrderPriorityOptions } from "@/server/database/purchase-order-priority/get/priority-options";
import PurchaseOrderDashboard from "@/components/purchase-orders/dashboard";
import type { SearchParams } from "@/types";
import { searchParamsSchema } from "@/lib/schemas/purchase-orders/search-params";

interface PurchaseOrdersPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function PurchaseOrdersPage({ searchParams }: PurchaseOrdersPageProps) {
  const resolvedParams = await searchParams;
  const search = searchParamsSchema.parse(resolvedParams);
  
  const [orders, stats, suppliers, statuses, priorities] = await Promise.all([
    getPurchaseOrders(search), 
    getPurchaseOrderStats(),
    getSupplierOptions(),
    getPurchaseOrderStatusOptions(),
    getPurchaseOrderPriorityOptions()
  ])

  return (
    <PurchaseOrderDashboard 
      initialData={orders.data}
      initialPagination={orders.pagination}
      stats={stats}
      suppliers={suppliers}
      statuses={statuses}
      priorities={priorities}
    />
  );
}