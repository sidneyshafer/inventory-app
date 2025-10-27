"use client"

import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
    MapPin, 
    Plus, 
    MoreHorizontal, 
    Edit, 
    Trash2, 
    Eye 
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LocationsPromise } from "@/server/database/locations/getLocations"
import { getLocationStats } from "@/server/database/locations/getLocationStats"

interface LocationsDashboardProps {
    locations: LocationsPromise[]
    stats: Awaited<ReturnType<typeof getLocationStats>>
}

export default function LocationsDashboard({
    locations,
    stats
}: LocationsDashboardProps) {

  const getCapacityPercentage = (current: number, capacity: number) => {
    return (current / capacity) * 100
  }

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500"
    if (percentage >= 70) return "text-orange-500"
    return "text-green-500"
  }

  const getStatusBadge = (status: boolean) => {
    switch (status) {
      case true:
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>
      case false:
        return <Badge className="bg-gray-500/10 text-gray-500 hover:bg-gray-500/20">Inactive</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatAddress = (location: typeof locations[0]) => {
    const parts = [location.Street, location.City, location.US_States?.Name].filter(Boolean);
    return `${parts.join(", ")} ${location.Zip_Code ?? ""}`.trim();
  }

  const formatName = (location: typeof locations[0]) => {
    const contact = location.Location_Contact?.[0]?.Contacts;
    if (!contact) return "";

    const parts = [contact.First_Name, contact.Last_Name].filter(Boolean);
    return parts.join(" ");
  };

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
          <p className="text-muted-foreground">Manage warehouse locations and stock tracking</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Locations</CardDescription>
            <CardTitle className="text-3xl">{stats.totalLocations}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Locations</CardDescription>
            <CardTitle className="text-3xl text-green-500">
              {stats.activeLocations}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Capacity</CardDescription>
            <CardTitle className="text-3xl">
              {(stats.totalCapacity / 1000).toFixed(1)}K
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Current Stock</CardDescription>
            <CardTitle className="text-3xl">
              {(stats.currentStock / 1000).toFixed(1)}K
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Locations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => {
          const capacityPercentage = getCapacityPercentage(location.currentStock, location.Max_Capacity)
          return (
            <Card key={location.Location_ID} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{location.Description}</CardTitle>
                      <CardDescription className="text-xs">LOC-0{location.Location_ID}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Location
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Location
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="outline">{location.Location_Type.Description}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    {getStatusBadge(location.Is_Active)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Contact</span>
                    <span className="font-medium">{formatName(location)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className={`font-semibold ${getCapacityColor(capacityPercentage)}`}>
                      {capacityPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={capacityPercentage} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {location.currentStock.toLocaleString()} / {location.Max_Capacity.toLocaleString()} units
                    </span>
                    <span>{location.totalItems} items</span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-muted-foreground">
                  <MapPin className="mr-1 inline h-3 w-3" />
                  {formatAddress(location)}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
