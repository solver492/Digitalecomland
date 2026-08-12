import * as React from "react"
import { Link, useLocation } from "wouter"
import { useTranslation } from "react-i18next"
import {
  LayoutDashboard, PackageSearch, ListOrdered, BarChart3, Wallet,
  Settings, LogOut, ChevronRight, ChevronLeft, Menu, X, Globe
} from "lucide-react"
import { cn } from "@/lib/utils"

const LANGUAGES = [
  { code: "ar", label: "العربية", flag: "🇲🇦" },
  { code: "fr", label: "Français", flag: "🇲🇦" },
  { code: "en", label: "English", flag: "🌐" },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === "ar"

  // Desktop: collapsed vs expanded
  const [collapsed, setCollapsed] = React.useState(false)
  // Mobile: drawer open/closed
  const [mobileOpen, setMobileOpen] = React.useState(false)
  // Language picker dropdown
  const [langOpen, setLangOpen] = React.useState(false)

  // Close mobile drawer on navigation
  React.useEffect(() => {
    setMobileOpen(false)
  }, [location])

  // Close lang picker on outside click
  React.useEffect(() => {
    if (!langOpen) return
    const handler = () => setLangOpen(false)
    document.addEventListener("click", handler)
    return () => document.removeEventListener("click", handler)
  }, [langOpen])

  const navItems = [
    { href: "/dashboard", label: t("nav.overview"), icon: LayoutDashboard },
    { href: "/dashboard/products", label: t("nav.catalog"), icon: PackageSearch },
    { href: "/dashboard/orders", label: t("nav.orders"), icon: ListOrdered },
    { href: "/dashboard/analytics", label: t("nav.analytics"), icon: BarChart3 },
    { href: "/dashboard/wallet", label: t("nav.wallet"), icon: Wallet },
    { href: "/dashboard/settings", label: t("nav.settings"), icon: Settings },
  ]

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0]

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={cn("flex flex-col h-full", isMobile ? "w-72" : collapsed ? "w-16" : "w-64")}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border shrink-0 gap-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 min-w-0"
          onClick={() => isMobile && setMobileOpen(false)}
        >
          <div className="size-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
            D
          </div>
          {(!collapsed || isMobile) && (
            <span className="font-bold text-lg text-foreground tracking-tight truncate">
              Ecom Land
            </span>
          )}
        </Link>
        {/* Desktop collapse toggle */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(c => !c)}
            className={cn(
              "ms-auto p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isRtl
              ? (collapsed ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />)
              : (collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />)
            }
          </button>
        )}
        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="ms-auto p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                collapsed && !isMobile ? "justify-center px-0" : "justify-between",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              <div className={cn("flex items-center gap-3", collapsed && !isMobile && "justify-center")}>
                <item.icon className={cn("size-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
              </div>
              {isActive && (!collapsed || isMobile) && (
                isRtl
                  ? <ChevronLeft className="size-4 text-primary shrink-0" />
                  : <ChevronRight className="size-4 text-primary shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-border shrink-0">
        <button
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all",
            collapsed && !isMobile && "justify-center px-0"
          )}
          onClick={() => { window.location.href = '/' }}
          title={collapsed && !isMobile ? t("nav.logout") : undefined}
        >
          <LogOut className="size-5 shrink-0" />
          {(!collapsed || isMobile) && <span>{t("nav.logout")}</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex border-e border-border bg-sidebar shrink-0 flex-col transition-all duration-300 overflow-hidden",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 z-50 md:hidden flex flex-col border-e border-border bg-sidebar transition-transform duration-300",
          isRtl ? "right-0 border-s border-e-0" : "left-0",
          mobileOpen ? "translate-x-0" : (isRtl ? "translate-x-full" : "-translate-x-full")
        )}
      >
        <SidebarContent isMobile />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 md:px-6 shrink-0 z-10 sticky top-0 gap-3">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>

          <div className="flex-1" />

          {/* Language switcher */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border"
            >
              <Globe className="size-4" />
              <span className="hidden sm:inline">{currentLang.flag} {currentLang.label}</span>
              <span className="sm:hidden">{currentLang.flag}</span>
            </button>
            {langOpen && (
              <div className={cn(
                "absolute top-full mt-1 bg-popover border border-border rounded-lg shadow-lg py-1 z-50 min-w-[140px]",
                isRtl ? "left-0" : "right-0"
              )}>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false) }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors",
                      i18n.language === lang.code ? "text-primary font-semibold" : "text-foreground"
                    )}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User avatar */}
          <div className="flex items-center gap-3">
            <div className="text-end hidden sm:block">
              <p className="text-sm font-medium text-foreground">Affiliate Partner</p>
              <p className="text-xs text-muted-foreground">ID: #49201</p>
            </div>
            <div className="size-9 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold text-sm">
              AP
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-background p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
