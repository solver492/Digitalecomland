import { Link } from "wouter"
import { useTranslation } from "react-i18next"
import { useGetDashboardStats } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { PlayCircle, Phone, PackagePlus, Compass, ArrowRight, Loader2 } from "lucide-react"

export function DashboardPage() {
  const { t } = useTranslation()
  const { data: stats, isLoading } = useGetDashboardStats()

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">{t("dashboard.subtitle")}</p>
      </div>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-5 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
        <div className="absolute top-0 end-0 -translate-y-12 translate-x-12 opacity-10 pointer-events-none">
          <Compass className="size-48 sm:size-64 text-primary" />
        </div>
        <div className="relative z-10 flex-1 space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">{t("dashboard.welcome")}</h2>
          <p className="text-muted-foreground max-w-xl text-sm sm:text-base">
            {t("dashboard.welcomeDesc")}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button className="gap-2 shadow-[0_0_15px_rgba(229,169,60,0.3)] text-sm">
              <PlayCircle className="size-4 sm:size-5" />
              {t("dashboard.watchMasterclass")}
            </Button>
            <Button variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/10 text-sm">
              <Phone className="size-4 sm:size-5" />
              {t("dashboard.joinWhatsapp")}
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card shadow-sm hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.totalEarned")}</CardTitle>
            <WalletIcon />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                  {formatCurrency(stats?.totalEarned || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t("dashboard.lifetimeEarnings")}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.pendingBalance")}</CardTitle>
            <ClockIcon />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl sm:text-3xl font-black tracking-tight">
                  {formatCurrency(stats?.pendingBalance || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t("dashboard.awaitingDelivery")}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.todayOrders")}</CardTitle>
            <TrendingUpIcon />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl sm:text-3xl font-black tracking-tight">
                  {stats?.newOrdersToday || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("dashboard.outOf", { total: stats?.totalOrders || 0 })}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <Button asChild variant="outline" className="w-full h-14 sm:h-16 text-base sm:text-lg gap-3">
          <Link href="/dashboard/products">
            <Compass className="size-5" /> {t("dashboard.browseCatalog")}
          </Link>
        </Button>
        <Button asChild className="w-full h-14 sm:h-16 text-base sm:text-lg gap-3 shadow-[0_0_20px_rgba(229,169,60,0.2)]">
          <Link href="/dashboard/orders">
            <PackagePlus className="size-5" /> {t("dashboard.addNewOrder")}
          </Link>
        </Button>
      </div>
    </div>
  )
}

function WalletIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary size-5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
}

function ClockIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground size-5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}

function TrendingUpIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground size-5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
}
