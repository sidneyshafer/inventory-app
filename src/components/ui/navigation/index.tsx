"use client"

import type React from "react"
import { AppSidebar } from "../app-sidebar"
import { SidebarInset, SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Separator } from "@/components/ui/separator"
import { navItem } from "@/types"

interface NavigationProps {
    mainNavItems: navItem[]
    systemNavItems: navItem[]
    children: React.ReactNode
}

export default function Navigation({
  mainNavItems,
  systemNavItems,
  children,
}: NavigationProps) {
  return (
    <SidebarProvider>
      <AppSidebar mainNavItems={mainNavItems} systemNavItems={systemNavItems} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background">
          <div className="flex flex-1 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
