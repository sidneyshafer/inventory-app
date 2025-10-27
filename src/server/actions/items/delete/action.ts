"use server";

import type { ActionResult } from "@/types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { deleteItem } from "@/server/database/items/delete/item";

export async function deleteItemAction(id: number): Promise<ActionResult> {
  try {
    const res = await deleteItem(id);

    if (!res?.success) {
      return {
        success: false,
        message: res?.message || "Failed to delete item.",
      };
    }

    return {
      success: true,
      message: res.message,
      data: res.data,
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
