import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { GetItemsSchema } from "../../../../lib/schemas/items/search-params";

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

export async function getItems(input: GetItemsSchema) {
  noStore();

  const {
    page = 1,
    per_page = 100,
    Item_ID,
    Search_Term,
    Category_ID: categories,
    Location_ID: locations,
    Status_ID: statuses,
  } = input;

  const pageSize = per_page;
  const searchTerms = Search_Term ? Search_Term.split(" ") : [];

  const searchResult: Prisma.ItemsWhereInput = Search_Term
    ? {
        OR: searchTerms.flatMap((term) => [
          { Name: { contains: term } },
          { SKU: { contains: term } },
        ]),
      }
    : {};

  const where: Prisma.ItemsWhereInput = {
    Is_Active: true,
    ...searchResult,
    Category_ID: categories ? { in: categories.split(".").map(Number) } : undefined,
    Location_ID: locations ? { in: locations.split(".").map(Number) } : undefined,
    Status_ID: statuses ? { in: statuses.split(".").map(Number) } : undefined,
  };

  const items = await db.items.findMany({
    where,
    select: {
      Item_ID: true,
      Name: true,
      Description: true,
      SKU: true,
      Categories: {
        select: { Description: true },
      },
      Quantity: true,
      Stock_Alerts: {
        select: { Threshold: true },
      },
      Locations: {
        select: { Description: true },
      },
      Unit_Price: true,
      Item_Status: {
        select: {
          Item_Status_ID: true,
          Description: true,
        },
      },
      Created_Datetime: true,
      Updated_Datetime: true,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const totalCount = await db.items.count({ where });
  const totalPages = Math.ceil(totalCount / pageSize);

  const itemsWithPriceNumber = items.map((item) => ({
    ...item,
    Unit_Price: Number(item.Unit_Price),
  }));

  return {
    data: itemsWithPriceNumber,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
    },
  };
}