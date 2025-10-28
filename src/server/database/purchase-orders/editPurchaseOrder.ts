"use server";

import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/server/db";
import { FormData } from "@/server/actions/purchase-orders/edit/schema";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function editPurchaseOrder({ ...args }: FormData) {
  noStore();

  try {
    const result = await db.$transaction(async (tx) => {
      const purchaseOrder = await tx.purchase_Order.update({
        where: { Purchase_Order_ID: args.purchaseOrderId },
        data: {
          Supplier_ID: Number(args.supplierId),
          Purchase_Order_Status_ID: Number(args.statusId),
          Purchase_Order_Priority_ID: Number(args.priorityId),
          Order_Date_Made: new Date(args.orderDate),
          Expected_Delivery_Date: new Date(args.expectedDeliveryDate),
          Updated_Datetime: new Date(),
        },
      });

      // --- Fetch current items fully ---
      const currentItems = await tx.purchase_Order_Item.findMany({
        where: { Purchase_Order_ID: args.purchaseOrderId },
        select: {
          Purchase_Order_Item_ID: true,
          Item_ID: true,
          Is_Active: true,
        },
      });

      const currentItemIds = currentItems.map((ci) => ci.Item_ID);
      const newItemIds = args.purchaseOrderItems.map((i) => Number(i.itemId));

      // --- Find which to add and remove ---
      const itemsToAdd = args.purchaseOrderItems.filter(
        (item) => !currentItemIds.includes(Number(item.itemId))
      );

      const itemsToRemove = currentItems.filter(
        (ci) => !newItemIds.includes(ci.Item_ID)
      );

      // --- Add new items ---
      for (const item of itemsToAdd) {
        await tx.purchase_Order_Item.create({
          data: {
            Purchase_Order_ID: purchaseOrder.Purchase_Order_ID,
            Item_ID: Number(item.itemId),
            Quantity: item.quantity ?? 0,
            Purchase_Price: item.purchasePrice ?? 0,
            Is_Active: true,
            Created_Datetime: new Date(),
          },
        });
      }

      // --- Deactivate removed items ---
      for (const item of itemsToRemove) {
        await tx.purchase_Order_Item.update({
          where: { Purchase_Order_Item_ID: item.Purchase_Order_Item_ID },
          data: {
            Is_Active: false,
            Updated_Datetime: new Date(),
          },
        });
      }

      // --- Update existing items ---
      for (const item of args.purchaseOrderItems) {
        const existing = currentItems.find(
          (ci) => ci.Item_ID === Number(item.itemId)
        );
        if (existing) {
          await tx.purchase_Order_Item.update({
            where: { Purchase_Order_Item_ID: existing.Purchase_Order_Item_ID },
            data: {
              Quantity: item.quantity ?? 0,
              Purchase_Price: item.purchasePrice ?? 0,
              Updated_Datetime: new Date(),
              Is_Active: true, // reactivate if needed
            },
          });
        }
      }

      return { 
        purchaseOrder, 
      }; 
    }); 

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
      errors: err instanceof Error ? { 
        name: err.name, 
        message: err.message 
      } : { 
        detail: String(err)
       }, 
      }; 
    } 
  }
