import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { getItemStats } from "@/server/database/items/get/item-stats"

interface ItemsStatsProps {
  stats: Awaited<ReturnType<typeof getItemStats>>
}

export function ItemsStats({ stats }: ItemsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Total Items</CardDescription>
          <CardTitle className="text-3xl">{stats.totalItems}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>In Stock</CardDescription>
          <CardTitle className="text-3xl text-green-500">{stats.inStock}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Low Stock</CardDescription>
          <CardTitle className="text-3xl text-orange-500">{stats.lowStock}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Out of Stock</CardDescription>
          <CardTitle className="text-3xl text-red-500">{stats.outOfStock}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
