import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";

export type SuppliersPromise = (Prisma.SuppliersGetPayload<{
  select: {
    Supplier_ID: true;
    Name: true;
    Is_Active: true;
    Created_Datetime: true;
    Updated_Datetime: true;
    Street: true;
    City: true;
    Zip_Code: true;
    US_States: {
      select: {
        Name: true;
        Abbreviation: true;
      };
    };
    Supplier_Contact: {
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
  };
}> & { 
  totalOrders: number;
  activeOrders: number;
  totalValue: number;
});

export async function getSuppliers() {
  noStore();

  const activeOrdersBySupplier = await db.purchase_Order.groupBy({
    by: ['Supplier_ID'],
    where: { Is_Active: true },
    _count: { Purchase_Order_ID: true },
  });

  const ordersBySupplier = await db.purchase_Order.groupBy({
    by: ['Supplier_ID'],
    _count: { Purchase_Order_ID: true },
  });

  const totalValueBySupplier = await db.purchase_Order_Item.groupBy({
    by: ["Purchase_Order_ID"],
    _sum: { Purchase_Price: true },
  });

  const suppliers = await db.suppliers.findMany({
    select: {
      Supplier_ID: true,
      Name: true,
      Is_Active: true,
      Created_Datetime: true,
      Updated_Datetime: true,
      Street: true,
      City: true,
      Zip_Code: true,
      US_States: {
        select: {
          Name: true,
          Abbreviation: true,
        },
      },
      Supplier_Contact: {
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

   // Get purchase orders so we can map totals to suppliers
  const purchaseOrders = await db.purchase_Order.findMany({
    select: {
      Purchase_Order_ID: true,
      Supplier_ID: true,
    },
  });

  // Build a Supplier_ID -> total value lookup
  const totalValueMap: Record<number, number> = {};

  purchaseOrders.forEach((po) => {
    const total = totalValueBySupplier.find(
      (t) => t.Purchase_Order_ID === po.Purchase_Order_ID
    )?._sum.Purchase_Price ?? 0;

    totalValueMap[po.Supplier_ID] =
      (totalValueMap[po.Supplier_ID] ?? 0) + Number(total);
  });

   // Combine order counts + total value into each supplier
  const suppliersWithOrders = suppliers.map((supplier) => {
    const totalOrders =
      ordersBySupplier.find((o) => o.Supplier_ID === supplier.Supplier_ID)
        ?._count.Purchase_Order_ID ?? 0;

    const activeOrders =
      activeOrdersBySupplier.find(
        (o) => o.Supplier_ID === supplier.Supplier_ID
      )?._count.Purchase_Order_ID ?? 0;

    const totalValue = totalValueMap[supplier.Supplier_ID] ?? 0;

    return {
      ...supplier,
      totalOrders,
      activeOrders,
      totalValue,
    };
  });

  return suppliersWithOrders;
}