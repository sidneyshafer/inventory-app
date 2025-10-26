"use server"

import { getSupplierOptions } from "@/server/database/suppliers/get/supplier-options"
import { getLocationOptions } from "@/server/database/locations/get/location-options"
import { getCategoryOptions } from "@/server/database/category/get/category-options";
import { getStatusOptions } from "@/server/database/item-status/get/status-options";
import { AddItemModal } from "@/components/items/modals/add-item-modal";

export default async function CreateItemModalPage() {

    const [locations, suppliers, statuses, categories] = await Promise.all([
        getLocationOptions(),
        getSupplierOptions(),
        getStatusOptions(),
        getCategoryOptions()
    ]);

    return (
        <AddItemModal
            categories={categories}
            locations={locations}
            suppliers={suppliers}
            statuses={statuses}
        />
    );
}