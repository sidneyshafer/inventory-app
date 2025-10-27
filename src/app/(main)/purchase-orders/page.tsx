"use server"

import { getPurchaseOrders } from "@/server/database/purchase-orders/getPurchaseOrders";
import { getPurchaseOrderStats } from "@/server/database/purchase-orders/getPurchaseOrderStats";
import { getPurchaseOrderStatusOptions } from "@/server/database/purchase-order-status/getStatusOptions";
import { getSupplierOptions } from "@/server/database/suppliers/getSupplierOptions";
import { getPurchaseOrderPriorityOptions } from "@/server/database/purchase-order-priority/getPriorityOptions";
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