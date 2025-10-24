"use client"

import { useState } from "react"
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
    Select, 
    SelectContent, 
    SelectItem,
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { 
    Search, 
    Plus, 
    MoreHorizontal, 
    Edit, 
    Trash2, 
    Eye, 
    Filter 
} from "lucide-react"
import { ItemsPromise } from "@/server/database/items/GET/getItems"
import { getItemStats } from "@/server/database/items/GET/getItemStats"
import { IN_STOCK_ID, LOW_STOCK_ID, OUT_OF_STOCK_ID } from "@/types/db-ids"

interface ItemsDashboardProps {
    items: ItemsPromise[]
    stats: Awaited<ReturnType<typeof getItemStats>>
}

export default function ItemsDashboard({
    items,
    stats
}: ItemsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const getStatusBadge = (id: number, text: string) => {
    switch (id) {
      case IN_STOCK_ID:
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">{text}</Badge>
      case LOW_STOCK_ID:
        return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20">{text}</Badge>
      case OUT_OF_STOCK_ID:
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">{text}</Badge>
      default:
        return <Badge>{text}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Items</h1>
          <p className="text-muted-foreground">Manage your inventory items</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Items</CardDescription>
            <CardTitle className="text-3xl">{stats.totalItems}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Stock</CardDescription>
            <CardTitle className="text-3xl text-green-500">
              {stats.inStock}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Low Stock</CardDescription>
            <CardTitle className="text-3xl text-orange-500">
              {stats.lowStock}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Out of Stock</CardDescription>
            <CardTitle className="text-3xl text-red-500">
              {stats.outOfStock}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Search and filter your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-6 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.Item_ID}>
                      <TableCell className="font-medium">ITM-0{item.Item_ID}</TableCell>
                      <TableCell>{item.Name}</TableCell>
                      <TableCell className="font-mono text-sm">{item.SKU}</TableCell>
                      <TableCell>{item.Categories.Description}</TableCell>
                      <TableCell>
                        <span className={(item.Quantity ?? 0) <= (item.Stock_Alerts[0]?.Threshold) ? "font-semibold text-orange-500" : ""}>
                          {item.Quantity}
                        </span>
                        <span className="text-muted-foreground"> / {item.Stock_Alerts[0]?.Threshold}</span>
                      </TableCell>
                      <TableCell>{item.Locations.Description}</TableCell>
                      <TableCell>${item.Unit_Price.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(item.Item_Status.Item_Status_ID, item.Item_Status.Description)}</TableCell>
                      <TableCell className="text-right">
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
                              Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Item
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {items.length} of {items.length} items
          </div>
        </CardContent>
      </Card>
    </div>
  )
}