import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/server/db";
import { FormData } from "@/server/actions/items/create/schema";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function createItem({ ...args }: FormData) {
    noStore()

    try {
        const result = await db.$transaction(async (tx) => {
            const item = await tx.items.create({
                data: {
                    Name: args.name,
                    SKU: args.sku,
                    Description: args.description,
                    Is_Active: true,
                    Created_Datetime: new Date(),
                    Quantity: args.quantity,
                    Category_ID: Number(args.categoryId),
                    Supplier_ID: Number(args.supplierId),
                    Location_ID: Number(args.locationId),
                    Status_ID: Number(args.statusId),
                    Unit_Price: args.unitPrice
                }
            });

            const stockAlert = await tx.stock_Alerts.create({
                data: {
                    Item_ID: item.Item_ID,
                    Threshold: args.threshold,
                    Is_Active: true,
                    Created_Datetime: new Date()
                }
            });

            return {
                item,
                stockAlert,
            };
        });

        return {
            success: true,
            message: "Item created successfully.",
            data: result,
        };
    } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
            return {
                success: false,
                message: "A database error occurred.",
                errors: { code: err.code, meta: err.meta },
            };
        }

        return {
            success: false,
            message: "An unexpected error occurred.",
            errors:
                err instanceof Error
                ? { name: err.name, message: err.message }
                : { detail: String(err) },
        };
        
    }
}