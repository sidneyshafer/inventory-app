import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/server/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function deleteItem(id: number) {
    noStore()

    try {
        const result = await db.items.update({
            where: { Item_ID: id },
            data: { 
                Is_Active: false, 
                Updated_Datetime: new Date() 
            }
        });

        return {
            success: true,
            message: "Item deleted successfully.",
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