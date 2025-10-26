import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/server/db";
import { FormData } from "@/server/actions/items/edit/schema";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function editItem({ ...args }: FormData) {
    noStore()

    try {
        const result = await db.$transaction(async (tx) => {
            const item = await tx.items.update({
                where: { Item_ID: args.itemId },
                data: {
                    Name: args.name,
                    SKU: args.sku,
                    Description: args.description,
                    Is_Active: true,
                    Updated_Datetime: new Date(),
                    Quantity: args.quantity,
                    Category_ID: Number(args.categoryId),
                    Supplier_ID: Number(args.supplierId),
                    Location_ID: Number(args.locationId),
                    Status_ID: Number(args.statusId),
                    Unit_Price: args.unitPrice
                }
            });

            let stockAlert = null;

            const existingStockAlert = await tx.stock_Alerts.findUnique({
                where: { Stock_Alerts_ID: args.stockAlertId },
                select: { Threshold: true },
            });

            if (existingStockAlert && Number(existingStockAlert.Threshold) !== Number(args.threshold)) {
                stockAlert = await tx.stock_Alerts.update({
                where: { Stock_Alerts_ID: args.stockAlertId },
                data: {
                    Threshold: args.threshold,
                    Updated_Datetime: new Date(),
                },
                });
            }

            return {
                item,
                stockAlert,
            };
        });

        return {
            success: true,
            message: "Item updated successfully.",
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