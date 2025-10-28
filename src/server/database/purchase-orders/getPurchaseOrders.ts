import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { GetPurchaseOrdersSchema } from "@/lib/schemas/purchase-orders/search-params";

export type PurchaseOrdersPromise = Prisma.Purchase_OrderGetPayload<{
  select: {
      Purchase_Order_ID: true;
      Suppliers: {
        select: {
          Supplier_ID: true;
          Name: true;
        }
      },
      Purchase_Order_Status: {
        select: {
          Purchase_Order_Status_ID: true;
          Description: true;
        };
      };
      Purchase_Order_Priority: {
        select: {
          Purchase_Order_Priority_ID: true;
          Description: true;
        };
      };
      _count: {
        select: {
          Purchase_Order_Item: true;
        },
      },
      Purchase_Order_Item: {
        select: {
          Purchase_Order_Item_ID: true;
          Item_ID: true;
          Purchase_Price: true;
          Quantity: true;
        };
      };
    };
}> & { 
  Item_Count: number 
  Total_Amount: number
  Order_Date_Made: string | null;
  Order_Date_Received: string | null;
  Expected_Delivery_Date: string | null;
  Created_Datetime: string | null;
  Updated_Datetime: string | null;
};

export async function getPurchaseOrders(input: GetPurchaseOrdersSchema) {
  noStore();

  const {
    page = 1,
    per_page = 100,
    Purchase_Order_ID,
    Search_Term,
    Supplier_ID: suppliers,
    Status_ID: statuses,
    Priority_ID: priorities,
  } = input;

  const pageSize = per_page;
  const searchTerms = Search_Term ? Search_Term.split(" ") : [];

  const searchResult: Prisma.Purchase_OrderWhereInput = Search_Term
  ? {
      OR: searchTerms
        .flatMap((term) => {
          const filters: Prisma.Purchase_OrderWhereInput[] = [];

          // Match supplier name
          filters.push({
            Suppliers: {
              Name: {
                contains: term,
                mode: "insensitive",
              },
            },
          });

          // Match Purchase_Order_ID if numeric
          if (!isNaN(Number(term))) {
            filters.push({
              Purchase_Order_ID: Number(term),
            });
          }

          return filters;
        }),
    }
  : {};

  const where: Prisma.Purchase_OrderWhereInput = {
    ...searchResult,
    Supplier_ID: suppliers ? { in: suppliers.split(".").map(Number) } : undefined,
    Purchase_Order_Status_ID: statuses ? { in: statuses.split(".").map(Number) } : undefined,
    Purchase_Order_Priority_ID: priorities ? { in: priorities.split(".").map(Number) } : undefined,
  }

  const purchaseOrders = await db.purchase_Order.findMany({
    where,
    select: {
      Purchase_Order_ID: true,
      Suppliers: {
        select: {
          Supplier_ID: true,
          Name: true,
        }
      },
      Purchase_Order_Status: {
        select: {
          Purchase_Order_Status_ID: true,
          Description: true,
        }
      },
      Purchase_Order_Priority: {
        select: {
          Purchase_Order_Priority_ID: true,
          Description: true,
        }
      },
      Order_Date_Made: true,
      Order_Date_Received: true,
      Expected_Delivery_Date: true,
      Created_Datetime: true,
      Updated_Datetime: true,
      _count: {
        select: {
          Purchase_Order_Item: true,
        },
      },
      Purchase_Order_Item: {
        select: {
          Purchase_Order_Item_ID: true,
          Item_ID: true,
          Purchase_Price: true,
          Quantity: true,
        },
      },
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const totalCount = await db.purchase_Order.count({ where });
  const totalPages = Math.ceil(totalCount / pageSize);

  const purchaseOrdersWithItemCount = purchaseOrders.map((po) => ({
    ...po,
    Item_Count: po._count.Purchase_Order_Item,
    Total_Amount: po.Purchase_Order_Item.reduce(
      (sum, item) =>
        sum +
        (Number(item?.Purchase_Price || 0) * Number(item?.Quantity || 0)),
      0
    ),
    Order_Date_Made: po.Order_Date_Made
      ? po.Order_Date_Made.toISOString().split("T")[0]
      : null,
    Order_Date_Received: po.Order_Date_Received
      ? po.Order_Date_Received.toISOString().split("T")[0]
      : null,
    Expected_Delivery_Date: po.Expected_Delivery_Date
      ? po.Expected_Delivery_Date.toISOString().split("T")[0]
      : null,
    Created_Datetime: po.Created_Datetime
      ? po.Created_Datetime.toISOString().split("T")[0]
      : null,
    Updated_Datetime: po.Updated_Datetime
      ? po.Updated_Datetime.toISOString().split("T")[0]
      : null,
    }));

  return {
    data: purchaseOrdersWithItemCount,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
    },
  };
}