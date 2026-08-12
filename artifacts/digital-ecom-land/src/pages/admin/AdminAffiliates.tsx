import { useEffect, useState } from "react"
import { adminListAffiliates, adminUpdateAffiliate, type AdminAffiliate } from "@/lib/admin-api"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import {
  Search, Loader2, Users, TrendingUp, CheckCircle2,
  ShieldX, ShieldCheck, Clock, Phone, Mail, MapPin, Eye,
} from "lucide-react"

const STATUS_CFG = {
  active:  { label: "Actif",    bg: "bg-green-500/15 text-green-400",  icon: ShieldCheck },
  blocked: { label: "Bloqué",   bg: "bg-red-500/15 text-red-400",      icon: ShieldX },
  pending: { label: "En attente",bg: "bg-yellow-500/15 text-yellow-400",icon: Clock },
}

export function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<AdminAffiliate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [detail, setDetail] = useState<AdminAffiliate | null>(null)
  const [blockConfirm, setBlockConfirm] = useState<AdminAffiliate | null>(null)

  const load = () => adminListAffiliates().then(setAffiliates).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const filtered = affiliates.filter(a => {
    const matchSearch = !search || a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) || a.brandName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const toggleBlock = async (a: AdminAffiliate) => {
    const newStatus = a.status === "blocked" ? "active" : "blocked"
    await adminUpdateAffiliate(a.id, { status: newStatus })
    setBlockConfirm(null)
    setDetail(null)
    load()
  }

  const totalEarned = affiliates.reduce((s, a) => s + a.totalEarned, 0)
  const totalDelivered = affiliates.reduce((s, a) => s + a.totalDelivered, 0)
  const activeCount = affiliates.filter(a => a.status === "active").length

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Affiliés / Clients</h1>
        <p className="text-muted-foreground text-sm">{affiliates.length} partenaires enregistrés</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total affiliés", value: affiliates.length.toString(), icon: Users, color: "text-purple-400" },
          { label: "Actifs", value: activeCount.toString(), icon: ShieldCheck, color: "text-green-400" },
          { label: "CA généré", value: formatCurrency(totalEarned), icon: TrendingUp, color: "text-primary" },
          { label: "Commandes livrées", value: totalDelivered.toString(), icon: CheckCircle2, color: "text-blue-400" },
        ].map(k => (
          <Card key={k.label} className="bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <k.icon className={`size-8 ${k.color} shrink-0`} />
              <div>
                <p className={`text-xl font-black ${k.color}`}>{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Chercher affilié..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "pending", "blocked"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {s === "all" ? "Tous" : STATUS_CFG[s].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left p-4 font-semibold text-muted-foreground">Affilié</th>
                <th className="text-left p-4 font-semibold text-muted-foreground hidden sm:table-cell">Ville</th>
                <th className="text-right p-4 font-semibold text-muted-foreground hidden md:table-cell">Commandes</th>
                <th className="text-right p-4 font-semibold text-muted-foreground hidden md:table-cell">Gains</th>
                <th className="text-center p-4 font-semibold text-muted-foreground">Statut</th>
                <th className="text-right p-4 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const cfg = STATUS_CFG[a.status]
                const deliveryRate = a.totalOrders > 0 ? Math.round((a.totalDelivered / a.totalOrders) * 100) : 0
                return (
                  <tr key={a.id} className={cn("border-b border-border/50 hover:bg-muted/30 transition-colors", i % 2 === 0 ? "" : "bg-muted/10")}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {a.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{a.fullName}</p>
                          <p className="text-xs text-muted-foreground">{a.brandName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell text-muted-foreground text-xs">{a.city}</td>
                    <td className="p-4 hidden md:table-cell text-right">
                      <div>
                        <span className="font-bold">{a.totalOrders}</span>
                        <span className="text-xs text-muted-foreground ml-1">({deliveryRate}%)</span>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-right font-bold text-primary">{formatCurrency(a.totalEarned)}</td>
                    <td className="p-4 text-center">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", cfg.bg)}>{cfg.label}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="size-8" onClick={() => setDetail(a)}><Eye className="size-4" /></Button>
                        <Button
                          size="sm" variant="ghost"
                          className={cn("h-8 text-xs", a.status === "blocked" ? "text-green-400 hover:text-green-300" : "text-red-400 hover:text-red-300")}
                          onClick={() => setBlockConfirm(a)}
                        >
                          {a.status === "blocked" ? "Débloquer" : "Bloquer"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Aucun affilié trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Block confirm */}
      <Dialog open={!!blockConfirm} onOpenChange={() => setBlockConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{blockConfirm?.status === "blocked" ? "Débloquer" : "Bloquer"} {blockConfirm?.fullName} ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {blockConfirm?.status === "blocked"
              ? "L'affilié pourra de nouveau accéder à la plateforme."
              : "L'affilié ne pourra plus accéder à la plateforme. Vous pourrez le débloquer à tout moment."}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockConfirm(null)}>Annuler</Button>
            <Button variant={blockConfirm?.status === "blocked" ? "default" : "destructive"} onClick={() => blockConfirm && toggleBlock(blockConfirm)}>
              {blockConfirm?.status === "blocked" ? "Débloquer" : "Bloquer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail modal */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{detail?.fullName}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Marque", detail.brandName],
                  ["Ville", detail.city],
                  ["Email", detail.email],
                  ["Téléphone", detail.phone],
                  ["Banque", detail.bankName ?? "—"],
                  ["RIB/CCP", detail.ribNumber ?? "—"],
                ].map(([k, v]) => (
                  <div key={k} className="p-2 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">{k}</p>
                    <p className="font-medium text-sm truncate">{v}</p>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Performance</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Commandes", value: detail.totalOrders, color: "text-blue-400" },
                    { label: "Livrées", value: detail.totalDelivered, color: "text-green-400" },
                    { label: "Gains", value: formatCurrency(detail.totalEarned), color: "text-primary" },
                  ].map(k => (
                    <div key={k.label} className="text-center p-2 bg-muted/30 rounded-lg">
                      <p className={`text-lg font-black ${k.color}`}>{k.value}</p>
                      <p className="text-xs text-muted-foreground">{k.label}</p>
                    </div>
                  ))}
                </div>
                {detail.totalOrders > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Taux de livraison</span>
                      <span className="font-semibold text-green-400">{Math.round((detail.totalDelivered / detail.totalOrders) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${Math.round((detail.totalDelivered / detail.totalOrders) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                className="w-full gap-2"
                variant={detail.status === "blocked" ? "default" : "destructive"}
                onClick={() => setBlockConfirm(detail)}
              >
                {detail.status === "blocked" ? <ShieldCheck className="size-4" /> : <ShieldX className="size-4" />}
                {detail.status === "blocked" ? "Débloquer le compte" : "Bloquer le compte"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
