"use server"

import { getItems } from "@/server/database/items/get/items";
import { getItemStats } from "@/server/database/items/get/item-stats";
import { getLocationOptions } from "@/server/database/locations/get/location-options";
import { getStatusOptions } from "@/server/database/item-status/get/status-options";
import { getCategoryOptions } from "@/server/database/category/get/category-options";
import ItemsDashboard from "@/components/items/items-dashboard";
import type { SearchParams } from "@/types";
import { searchParamsSchema } from "@/lib/schemas/items/search-params";

interface ItemsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const resolvedParams = await searchParams;
  const search = searchParamsSchema.parse(resolvedParams);
  
  const [items, stats, locations, statuses, categories] = await Promise.all([
    getItems(search), 
    getItemStats(),
    getLocationOptions(),
    getStatusOptions(),
    getCategoryOptions()
  ])

  return (
    <ItemsDashboard 
      initialData={items.data}
      initialPagination={items.pagination}
      stats={stats}
      locations={locations}
      statuses={statuses}
      categories={categories}
    />
  );
}