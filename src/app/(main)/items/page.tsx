"use server"

import { getItems } from "@/server/database/items/getItems";
import { getItemStats } from "@/server/database/items/getItemStats";
import { getLocationOptions } from "@/server/database/locations/getLocationOptions";
import { getStatusOptions } from "@/server/database/item-status/getStatusOptions";
import { getCategoryOptions } from "@/server/database/category/getCategoryOptions";
import { getSupplierOptions } from "@/server/database/suppliers/getSupplierOptions";
import ItemsDashboard from "@/components/items/dashboard";
import type { SearchParams } from "@/types";
import { searchParamsSchema } from "@/lib/schemas/items/search-params";

interface ItemsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const resolvedParams = await searchParams;
  const search = searchParamsSchema.parse(resolvedParams);
  
  const [items, stats, locations, statuses, categories, suppliers] = await Promise.all([
    getItems(search), 
    getItemStats(),
    getLocationOptions(),
    getStatusOptions(),
    getCategoryOptions(),
    getSupplierOptions()
  ])

  return (
    <ItemsDashboard 
      initialData={items.data}
      initialPagination={items.pagination}
      stats={stats}
      locations={locations}
      statuses={statuses}
      categories={categories}
      suppliers={suppliers}
    />
  );
}