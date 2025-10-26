"use server"

import { getSupplierOptions } from "@/server/database/suppliers/get/supplier-options"
import { getLocationOptions } from "@/server/database/locations/get/location-options"
import { getCategoryOptions } from "@/server/database/category/get/category-options";
import { getStatusOptions } from "@/server/database/item-status/get/status-options";
import { getItemById } from "@/server/database/items/get/item-by-id";
import { ViewItemModal } from "@/components/items/modals/view-item-modal";

interface ViewItemModalPageProps {
  params: Promise<{ id: string; }>;
}

export default async function ViewItemModalPage({ params }: ViewItemModalPageProps) {
    const { id } = await params;
    const parsedId = Number(id);
    
    const [item, locations, suppliers, statuses, categories] = await Promise.all([
        getItemById(parsedId),
        getLocationOptions(),
        getSupplierOptions(),
        getStatusOptions(),
        getCategoryOptions()
    ]);

    return (
        <ViewItemModal
            item={item.data[0]}
            categories={categories}
            locations={locations}
            suppliers={suppliers}
            statuses={statuses}
        />
    );
}