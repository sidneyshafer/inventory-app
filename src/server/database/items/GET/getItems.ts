import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";

export type ItemsPromise = Prisma.ItemsGetPayload<{
  select: {
      Item_ID: true;
      Name: true;
      Description: true;
      SKU: true;
      Categories: {
        select: {
            Description: true;
        };
      };
      Quantity: true;
      Stock_Alerts: {
        select: {
            Threshold: true;
        };
      };
      Locations: {
        select: {
            Description: true;
        };
      };
      Item_Status: {
        select: {
            Item_Status_ID: true;
            Description: true;
        };
      };
      Created_Datetime: true;
      Updated_Datetime: true;
    };
}> & { 
  Unit_Price: number; 
};

export async function getItems() {
  noStore();

  const items = await db.items.findMany({
    where: { Is_Active: true },
    select: {
      Item_ID: true,
      Name: true,
      Description: true,
      SKU: true,
      Categories: {
        select: {
            Description: true
        }
      },
      Quantity: true,
      Stock_Alerts: {
        select: {
            Threshold: true
        }
      },
      Locations: {
        select: {
            Description: true
        }
      },
      Unit_Price: true,
      Item_Status: {
        select: {
            Item_Status_ID: true,
            Description: true
        }
      },
      Created_Datetime: true,
      Updated_Datetime: true
    },
  });

  const itemsWithPriceNumber = items.map(item => ({
    ...item,
    Unit_Price: Number(item.Unit_Price)
  }));

  return itemsWithPriceNumber;
}