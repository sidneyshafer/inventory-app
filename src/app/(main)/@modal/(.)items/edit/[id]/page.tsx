"use server"

import { getSupplierOptions } from "@/server/database/suppliers/get/supplier-options"
import { getLocationOptions } from "@/server/database/locations/get/location-options"
import { getCategoryOptions } from "@/server/database/category/get/category-options";
import { getStatusOptions } from "@/server/database/item-status/get/status-options";
import { getItemById } from "@/server/database/items/get/item-by-id";
import { EditItemModal } from "@/components/items/modals/edit-item-modal";

interface EditItemModalPageProps {
  params: Promise<{ id: string; }>;
}

export default async function EditItemModalPage({ params }: EditItemModalPageProps) {
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
        <EditItemModal
            item={item.data[0]}
            categories={categories}
            locations={locations}
            suppliers={suppliers}
            statuses={statuses}
        />
    );
}