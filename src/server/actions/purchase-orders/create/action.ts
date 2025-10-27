"use server";

import type { ActionResult } from "@/types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { createPurchaseOrder } from "@/server/database/purchase-orders/createPurchaseOrder";
import { FormData } from "./schema";

export async function createPurchaseOrderAction(args: FormData): Promise<ActionResult> {
  try {
    const res = await createPurchaseOrder(args);

    if (!res?.success) {
      return {
        success: false,
        message: res?.message || "Failed to create order.",
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
