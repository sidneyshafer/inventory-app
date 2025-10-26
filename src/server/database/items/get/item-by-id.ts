import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";

export type ItemPromise = Prisma.ItemsGetPayload<{
  select: {
    Item_ID: true;
    Name: true;
    Description: true;
    SKU: true;
    Categories: {
      select: {
        Category_ID: true;
        Description: true;
      };
    };
    Quantity: true;
    Stock_Alerts: {
      select: {
        Stock_Alerts_ID: true;
        Threshold: true;
      };
    };
    Locations: {
      select: {
        Location_ID: true;
        Description: true;
      };
    };
    Item_Status: {
      select: {
        Item_Status_ID: true;
        Description: true;
      };
    };
    Suppliers: {
        select: {
            Supplier_ID: true;
            Name: true;
        };
    };
    Created_Datetime: true;
    Updated_Datetime: true;
  };
}> & {
    Unit_Price: number;
    Threshold: number;
};

export async function getItemById(id: number) {
  noStore();

  const items = await db.items.findMany({
    where: {
        Item_ID: id,
        Is_Active: true
    },
    select: {
      Item_ID: true,
      Name: true,
      Description: true,
      SKU: true,
      Categories: {
        select: {
            Category_ID: true,
            Description: true 
        },
      },
      Quantity: true,
      Stock_Alerts: {
        select: {
            Stock_Alerts_ID: true,
            Threshold: true 
        },
        take: 1,
      },
      Locations: {
        select: {
            Location_ID: true,
            Description: true 
        },
      },
      Unit_Price: true,
      Item_Status: {
        select: {
          Item_Status_ID: true,
          Description: true,
        },
      },
      Suppliers: {
        select: {
            Supplier_ID: true,
            Name: true
        }
      },
      Created_Datetime: true,
      Updated_Datetime: true,
    },
  });

  const itemWithNumberConversion = items.map((item) => ({
    ...item,
    Unit_Price: Number(item.Unit_Price),
    Threshold: Number(item.Stock_Alerts[0].Threshold)
  }));

  return {
    data: itemWithNumberConversion
  };
}