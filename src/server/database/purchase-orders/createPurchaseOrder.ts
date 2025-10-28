import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/server/db";
import { FormData } from "@/server/actions/purchase-orders/create/schema";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function createPurchaseOrder({ ...args }: FormData) {
    noStore()

    try {
        const result = await db.$transaction(async (tx) => {
            const purchaseOrder = await tx.purchase_Order.create({
                data: {
                    Supplier_ID: Number(args.supplierId),
                    Purchase_Order_Status_ID: Number(args.statusId),
                    Purchase_Order_Priority_ID: Number(args.priorityId),
                    Order_Date_Made: new Date(args.orderDate),
                    Expected_Delivery_Date: new Date(args.expectedDeliveryDate),
                    Created_Datetime: new Date()
                }
            });

            for (const item of args.purchaseOrderItems) {
                await tx.purchase_Order_Item.create({
                    data: {
                        Purchase_Order_ID: purchaseOrder.Purchase_Order_ID,
                        Item_ID: Number(item.itemId),
                        Purchase_Price: item.purchasePrice,
                        Is_Active: true,
                        Quantity: item.quantity,
                        Created_Datetime: new Date(),
                    },
                });
            }

            return purchaseOrder;
        });


        return {
            success: true,
            message: "Purchase order created successfully.",
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