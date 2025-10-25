"use server"

import { getLocations } from "@/server/database/locations/get/locations";
import { getLocationStats } from "@/server/database/locations/get/location-stats";
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