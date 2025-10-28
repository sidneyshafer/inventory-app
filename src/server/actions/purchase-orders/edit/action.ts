"use server";

import type { ActionResult } from "@/types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { FormData } from "./schema";
import { editPurchaseOrder } from "@/server/database/purchase-orders/editPurchaseOrder";

export async function editPurchaseOrderAction(args: FormData): Promise<ActionResult> {
  try {
    const res = await editPurchaseOrder(args);

    if (!res?.success) {
      return {
        success: false,
        message: res?.message || "Failed to update order.",
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
