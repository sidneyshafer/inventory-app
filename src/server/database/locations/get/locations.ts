import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";

export type LocationsPromise = Prisma.LocationsGetPayload<{
  select: {
    Location_ID: true;
    Description: true;
    Is_Active: true;
    Created_Datetime: true;
    Updated_Datetime: true;
    Max_Capacity: true;
    Min_Capacity: true;
    Street: true;
    City: true;
    Zip_Code: true;
    US_States: {
      select: {
        Name: true;
        Abbreviation: true;
      };
    };
    Location_Type: {
      select: {
        Description: true;
      };
    };
    Location_Contact: {
      select: {
        Contacts: {
          select: {
            First_Name: true;
            Last_Name: true;
            Email: true;
            Phone: true;
          };
        };
      };
    };
    Items: true;
    _count: { 
      select: { 
        Items: true; 
      };
    };
  };
}> & { 
  currentStock: number; 
  totalItems: number; 
};

export async function getLocations() {
  noStore();

  const stockPerLocation = await db.items.groupBy({
    by: ["Location_ID"],
    _sum: { Quantity: true },
  });

  const stockMap = new Map<number, number>();
  stockPerLocation.forEach((stock) => {
    stockMap.set(stock.Location_ID, stock._sum.Quantity ?? 0);
  });

  const locations = await db.locations.findMany({
    select: {
      Location_ID: true,
      Description: true,
      Is_Active: true,
      Created_Datetime: true,
      Updated_Datetime: true,
      Max_Capacity: true,
      Min_Capacity: true,
      Street: true,
      City: true,
      Zip_Code: true,
      US_States: {
        select: {
          Name: true,
          Abbreviation: true,
        },
      },
      Items: true,
      _count: { select: { Items: true } },
      Location_Type: {
        select: {
          Description: true,
        },
      },
      Location_Contact: {
        orderBy: {
          Created_Datetime: 'desc'
        },
        where: {
          Is_Active: true
        },
        select: {
          Contacts: {
            select: {
              First_Name: true,
              Last_Name: true,
              Email: true,
              Phone: true
            }
          }
        },
        take: 1
      }
    },
  });

  const locationsWithStock = locations.map((location) => ({
    ...location,
    currentStock: stockMap.get(location.Location_ID) ?? 0,
    totalItems: location._count.Items ?? 0
  }));

  return locationsWithStock;
}