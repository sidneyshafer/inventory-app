"use server"

import { getItems } from "@/server/database/items/GET/getItems";
import { getItemStats } from "@/server/database/items/GET/getItemStats";
import ItemsDashboard from "@/components/items";

export default async function ItemsPage() {
  
  const [items, stats] = await Promise.all([
    getItems(), 
    getItemStats()
  ])

  return (
    <ItemsDashboard 
      items={items} 
      stats={stats} 
    />
  );
}