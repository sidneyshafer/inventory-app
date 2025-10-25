"use server"

import { getItems } from "@/server/database/items/get/items";
import { getItemStats } from "@/server/database/items/get/item-stats";
import ItemsDashboard from "@/components/items/items-dashboard";
import type { SearchParams } from "@/types";
import { searchParamsSchema } from "@/lib/schemas/items/search-params";

interface ItemsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const resolvedParams = await searchParams;
  const search = searchParamsSchema.parse(resolvedParams);
  
  const [items, stats] = await Promise.all([
    getItems(search), 
    getItemStats()
  ])

  return (
    <ItemsDashboard 
      initialData={items.data}
      initialPagination={items.pagination}
      stats={stats} 
    />
  );
}