import * as React from "react"
import { Link, useLocation } from "wouter"
import { LayoutDashboard, PackageSearch, ListOrdered, BarChart3, Wallet, Settings, LogOut, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/products", label: "Catalog", icon: PackageSearch },
    { href: "/dashboard/orders", label: "Orders", icon: ListOrdered },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar shrink-0 flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
              D
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">Ecom Land</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location === item.href
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("size-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="size-4 text-primary" />}
              </Link>
            )
          })}
        </div>
        
        <div className="p-4 border-t border-border">
          <button 
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            onClick={() => window.location.href = '/'}
          >
            <LogOut className="size-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-8 shrink-0 z-10 sticky top-0">
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">Affiliate Partner</p>
              <p className="text-xs text-muted-foreground">ID: #49201</p>
            </div>
            <div className="size-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold">
              AP
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-background p-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
