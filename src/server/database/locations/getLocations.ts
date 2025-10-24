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
    State: true;
    Country: true;
    Zip_Code: true;
    Location_Type: {
      select: {
        Description: true;
      };
    };
  };
}>;

export async function getLocations() {
    noStore()
    
    const locations = await db.locations.findMany({
        orderBy: {
            Description: "asc"
        },
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
            State: true,
            Country: true,
            Zip_Code: true,
            Location_Type: {
                select: {
                    Description: true
                }
            }
        }
    });

    return locations;
}