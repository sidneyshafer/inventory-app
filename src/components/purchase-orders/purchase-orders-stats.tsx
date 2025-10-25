import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { getPurchaseOrderStats } from "@/server/database/purchase-orders/get/purchase-order-stats"

interface PurchaseOrderStatsProps {
  stats: Awaited<ReturnType<typeof getPurchaseOrderStats>>
}

export function PurchaseOrderStats({ stats }: PurchaseOrderStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Total Orders</CardDescription>
          <CardTitle className="text-3xl">{stats.total}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Pending Approval</CardDescription>
          <CardTitle className="text-3xl text-orange-500">{stats.pendingApproval}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>High Priority</CardDescription>
          <CardTitle className="text-3xl  text-red-500">{stats.active}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Total Value</CardDescription>
          <CardTitle className="text-3xl">
            ${((stats.totalValue, 0) / 1000).toFixed(1)}K
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
