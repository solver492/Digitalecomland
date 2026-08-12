import * as React from "react"
import { Link, useLocation } from "wouter"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Package, Tag, Users, Truck,
  ShoppingCart, ChevronRight, ChevronLeft,
  Menu, X, ShieldAlert, Factory, LogOut,
} from "lucide-react"

const NAV = [
  { href: "/admin",                   label: "Dashboard",        icon: LayoutDashboard },
  { href: "/admin/products",          label: "Produits",         icon: Package },
  { href: "/admin/categories",        label: "Catégories",       icon: Tag },
  { href: "/admin/suppliers",         label: "Fournisseurs",     icon: Factory },
  { href: "/admin/delivery-agencies", label: "Agences Livraison",icon: Truck },
  { href: "/admin/affiliates",        label: "Affiliés",         icon: Users },
  { href: "/admin/orders",            label: "Commandes",        icon: ShoppingCart },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => { setMobileOpen(false) }, [location])

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={cn("flex flex-col h-full", isMobile ? "w-72" : collapsed ? "w-16" : "w-64")}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border shrink-0 gap-2">
        <Link href="/admin" className="flex items-center gap-2 min-w-0" onClick={() => isMobile && setMobileOpen(false)}>
          <div className="size-8 rounded-md bg-red-600 flex items-center justify-center text-white font-black shrink-0 text-sm">
            A
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground leading-none truncate">Admin Panel</p>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">Ecom Land</p>
            </div>
          )}
        </Link>
        {!isMobile && (
          <button
            onClick={() => setCollapsed(c => !c)}
            className="ms-auto p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          >
            {collapsed
              ? <ChevronRight className="size-4" />
              : <ChevronLeft className="size-4" />}
          </button>
        )}
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} className="ms-auto p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-0.5">
        {NAV.map((item) => {
          const isActive = item.href === "/admin"
            ? location === "/admin"
            : location.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                collapsed && !isMobile ? "justify-center px-0" : "",
                isActive
                  ? "bg-red-600/15 text-red-500"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              <item.icon className={cn("size-5 shrink-0", isActive ? "text-red-500" : "text-muted-foreground group-hover:text-foreground")} />
              {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer links */}
      <div className="p-2 border-t border-border space-y-0.5 shrink-0">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all",
            collapsed && !isMobile && "justify-center px-0"
          )}
          title={collapsed && !isMobile ? "Vue Affilié" : undefined}
        >
          <ShieldAlert className="size-4 shrink-0" />
          {(!collapsed || isMobile) && <span>Vue Affilié</span>}
        </Link>
        <button
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all",
            collapsed && !isMobile && "justify-center px-0"
          )}
          onClick={() => { window.location.href = "/" }}
          title={collapsed && !isMobile ? "Déconnexion" : undefined}
        >
          <LogOut className="size-4 shrink-0" />
          {(!collapsed || isMobile) && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden md:flex border-e border-border bg-sidebar shrink-0 flex-col transition-all duration-300 overflow-hidden",
        collapsed ? "w-16" : "w-64"
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 md:hidden flex flex-col border-e border-border bg-sidebar transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent isMobile />
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b border-border bg-background/95 backdrop-blur flex items-center px-4 md:px-6 shrink-0 gap-3">
          <button className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-muted" onClick={() => setMobileOpen(true)}>
            <Menu className="size-5" />
          </button>
          <span className="text-xs font-semibold text-red-500 border border-red-500/30 bg-red-500/10 px-2 py-0.5 rounded-md">
            ADMIN
          </span>
          <div className="flex-1" />
          <div className="size-8 rounded-full bg-red-600/20 border border-red-600/50 flex items-center justify-center text-red-500 font-bold text-xs">
            AD
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-background p-4 md:p-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
