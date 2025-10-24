"use server"

import { getItems } from "@/server/database/items/GET/getItems";
import { getItemStats } from "@/server/database/items/GET/getItemStats";
import ItemsDashboard from "@/components/items";
import type { SearchParams } from "@/types";
import { searchParamsSchema } from "@/server/database/items/GET/schema";

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
      items={items} 
      stats={stats} 
    />
  );
}