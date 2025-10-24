import { 
    BarChart3, 
    LayoutDashboard, 
    MapPin, 
    Package, 
    QrCode, 
    Settings, 
    Shield, 
    ShoppingCart, 
    Users,
    History
} from "lucide-react"
import { navItem } from "@/types"

export const mainNavItems: navItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: "Items",
    url: "/items",
    icon: <Package className="h-4 w-4" />,
  },
  {
    title: "Locations",
    url: "/locations",
    icon: <MapPin className="h-4 w-4" />,
  },
  {
    title: "Suppliers",
    url: "/suppliers",
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: "Purchase Orders",
    url: "/purchase-orders",
    icon: <ShoppingCart className="h-4 w-4" />,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: <BarChart3 className="h-4 w-4" />,
  },
]

export const systemNavItems: navItem[] = [
  {
    title: "Barcode Scanner",
    url: "/barcode",
    icon: <QrCode className="h-4 w-4" />,
  },
  {
    title: "Audit Logs",
    url: "/audit-logs",
    icon: <History className="h-4 w-4" />,
  },
  {
    title: "User Management",
    url: "/users",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: <Settings className="h-4 w-4" />,
  },
]