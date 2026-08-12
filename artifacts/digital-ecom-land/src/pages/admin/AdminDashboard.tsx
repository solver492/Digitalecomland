import { useEffect, useState } from "react"
import { Link } from "wouter"
import { getAdminStats, type AdminStats } from "@/lib/admin-api"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp, Package, Users, ShoppingCart,
  CheckCircle2, XCircle, Clock, Loader2,
  ArrowRight, BarChart3, Factory, Truck,
} from "lucide-react"

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStats().then(setStats).finally(() => setLoading(false))
  }, [])

  const kpis = stats ? [
    {
      label: "Chiffre d'Affaires",
      value: formatCurrency(stats.totalRevenue),
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
      desc: "Marges cumulées livrées",
    },
    {
      label: "Commandes Totales",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      desc: `${stats.delivered} livrées · ${stats.returned} retournées`,
    },
    {
      label: "Taux de Livraison",
      value: `${stats.deliveryRate}%`,
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-400/10",
      desc: `${stats.pending} commandes en cours`,
    },
    {
      label: "Affiliés Actifs",
      value: `${stats.activeAffiliates} / ${stats.totalAffiliates}`,
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      desc: "Partenaires enregistrés",
    },
    {
      label: "Produits Catalogue",
      value: `${stats.inStockProducts} / ${stats.totalProducts}`,
      icon: Package,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      desc: "Produits en stock",
    },
  ] : []

  const quickLinks = [
    { href: "/admin/products",          label: "Gérer les Produits",        icon: Package,  desc: "Ajouter, modifier, supprimer" },
    { href: "/admin/categories",        label: "Gérer les Catégories",      icon: BarChart3,desc: "Organiser le catalogue" },
    { href: "/admin/suppliers",         label: "Fournisseurs",              icon: Factory,  desc: "Contacts et tarifs grossistes" },
    { href: "/admin/delivery-agencies", label: "Agences de Livraison",      icon: Truck,    desc: "Partenaires transport" },
    { href: "/admin/affiliates",        label: "Affiliés",                  icon: Users,    desc: "Gérer les comptes partenaires" },
    { href: "/admin/orders",            label: "Toutes les Commandes",      icon: ShoppingCart, desc: "Suivi et gestion des statuts" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground text-sm mt-1">Vue globale de la plateforme Digital Ecom Land</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {kpis.map((k) => (
              <Card key={k.label} className="bg-card hover:border-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">{k.label}</CardTitle>
                  <div className={`p-1.5 rounded-md ${k.bg}`}>
                    <k.icon className={`size-4 ${k.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-black tracking-tight ${k.color}`}>{k.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{k.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order status summary */}
          {stats && (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Répartition des Commandes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle2 className="size-6 text-green-400 shrink-0" />
                    <div>
                      <div className="text-xl font-black text-green-400">{stats.delivered}</div>
                      <div className="text-xs text-muted-foreground">Livrées</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <Clock className="size-6 text-yellow-400 shrink-0" />
                    <div>
                      <div className="text-xl font-black text-yellow-400">{stats.pending}</div>
                      <div className="text-xs text-muted-foreground">En cours</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <XCircle className="size-6 text-red-400 shrink-0" />
                    <div>
                      <div className="text-xl font-black text-red-400">{stats.returned}</div>
                      <div className="text-xs text-muted-foreground">Retournées</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick links */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Accès Rapide</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <l.icon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{l.label}</p>
                    <p className="text-xs text-muted-foreground">{l.desc}</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
