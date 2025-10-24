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
import { 
    Avatar, 
    AvatarFallback 
} from "@/components/ui/avatar"
import { 
    Users, 
    Plus, 
    Mail, 
    Phone, 
    MapPin, 
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
import { SuppliersPromise } from "@/server/database/suppliers/GET/getSuppliers"
import { getSupplierStats } from "@/server/database/suppliers/GET/getSupplierStats"

interface SuppliersDashboardProps {
    suppliers: SuppliersPromise[]
    stats: Awaited<ReturnType<typeof getSupplierStats>>
}

export default function SuppliersDashboard({
    suppliers,
    stats
}: SuppliersDashboardProps) {

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatAddress = (supplier: typeof suppliers[0]) => {
    const parts = [supplier.Street, supplier.City, supplier.US_States?.Name].filter(Boolean);
    return `${parts.join(", ")} ${supplier.Zip_Code ?? ""}`.trim();
 }

  const formatName = (supplier: typeof suppliers[0]) => {
    const contact = supplier.Supplier_Contact?.[0]?.Contacts;
    if (!contact) return "";

    const parts = [contact.First_Name, contact.Last_Name].filter(Boolean);
    return parts.join(" ");
  };

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Manage your supplier relationships</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Suppliers</CardDescription>
            <CardTitle className="text-3xl">
                {stats.totalSuppliers}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Suppliers</CardDescription>
            <CardTitle className="text-3xl text-green-500">
              {stats.activeSuppliers}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Orders</CardDescription>
            <CardTitle className="text-3xl">
                {stats.activeOrders}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Value</CardDescription>
            <CardTitle className="text-3xl">
                ${(stats.totalValue / 1000).toFixed(0)}K
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Suppliers Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {suppliers.map((supplier) => (
          <Card key={supplier.Supplier_ID}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">{getInitials(supplier.Name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{supplier.Name}</CardTitle>
                    <CardDescription className="text-xs">{supplier.Supplier_ID}</CardDescription>
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
                      Edit Supplier
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Supplier
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                {/* <Badge variant="outline">{supplier.category}</Badge> */}
                {getStatusBadge(supplier.Is_Active)}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-medium">
                    {formatName(supplier)}
                </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`mailto:${supplier.Supplier_Contact[0].Contacts.Email}`} 
                    className="text-primary hover:underline"
                    >
                        {supplier.Supplier_Contact[0].Contacts.Email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {supplier.Supplier_Contact[0].Contacts.Phone}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{formatAddress(supplier)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                  <p className="text-lg font-bold">{supplier.totalOrders}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-lg font-bold text-primary">{supplier.activeOrders}</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <span className="text-lg font-bold">${supplier.totalValue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
