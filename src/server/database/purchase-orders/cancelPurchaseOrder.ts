import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/server/db";
import { CANCELLED } from "@/types/db-ids";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function cancelPurchaseOrder(id: number) {
    noStore()

    try {
        const result = await db.purchase_Order.update({
            where: { Purchase_Order_ID: id },
            data: {
                Purchase_Order_Status_ID: CANCELLED,
            }
        })

        return {
            success: true,
            message: "Purchase order updated successfully.",
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