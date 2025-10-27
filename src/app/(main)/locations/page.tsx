"use server"

import { getLocations } from "@/server/database/locations/getLocations";
import { getLocationStats } from "@/server/database/locations/getLocationStats";
import LocationsDashboard from "@/components/locations";

export default async function LocationsPage() {
  
  const [locations, stats] = await Promise.all([
    getLocations(), 
    getLocationStats()
  ])

  return (
    <LocationsDashboard 
      locations={locations} 
      stats={stats} 
    />
  );
}