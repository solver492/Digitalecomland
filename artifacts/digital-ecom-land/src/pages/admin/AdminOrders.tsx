import { useEffect, useState } from "react"
import { adminListOrders, adminUpdateOrderStatus } from "@/lib/admin-api"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search, Loader2, ChevronDown } from "lucide-react"

const STATUSES = [
  { key: "ALL",                label: "Toutes",     color: "" },
  { key: "NOUVELLE",          label: "Nouvelle",   color: "bg-blue-500/15 text-blue-400" },
  { key: "CONFIRMEE",         label: "Confirmée",  color: "bg-purple-500/15 text-purple-400" },
  { key: "EN_COURS_LIVRAISON",label: "En Transit", color: "bg-yellow-500/15 text-yellow-400" },
  { key: "LIVREE",            label: "Livrée",     color: "bg-green-500/15 text-green-400" },
  { key: "RETOURNEE",         label: "Retournée",  color: "bg-red-500/15 text-red-400" },
  { key: "ANNULEE",           label: "Annulée",    color: "bg-muted text-muted-foreground" },
]

const statusColor = (s: string) => STATUSES.find(x => x.key === s)?.color ?? ""
const statusLabel = (s: string) => STATUSES.find(x => x.key === s)?.label ?? s

export function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("ALL")
  const [detail, setDetail] = useState<any | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [saving, setSaving] = useState(false)

  const load = () => adminListOrders().then(o => setOrders([...o].reverse())).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const filtered = orders.filter(o => {
    const matchS = filter === "ALL" || o.status === filter
    const matchQ = !search || `${o.customerFirstName} ${o.customerLastName} ${o.customerPhone} ${o.id}`
      .toLowerCase().includes(search.toLowerCase())
    return matchS && matchQ
  })

  const openDetail = (o: any) => { setDetail(o); setNewStatus(o.status) }

  const updateStatus = async () => {
    if (!detail || !newStatus) return
    setSaving(true)
    try {
      await adminUpdateOrderStatus(detail.id, newStatus)
      setDetail(null)
      load()
    } finally { setSaving(false) }
  }

  const totalRevenue = orders.filter(o => o.status === "LIVREE").reduce((s: number, o: any) => s + o.netMargin, 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Commandes</h1>
          <p className="text-muted-foreground text-sm">
            {orders.length} commandes · CA livré : <span className="text-primary font-bold">{formatCurrency(totalRevenue)}</span>
          </p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
              filter === s.key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
            )}
          >
            {s.label} {s.key !== "ALL" && <span className="opacity-60">({orders.filter(o => o.status === s.key).length})</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input placeholder="Chercher client, téléphone, #id..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left p-4 font-semibold text-muted-foreground">#</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Produit</th>
                <th className="text-left p-4 font-semibold text-muted-foreground hidden sm:table-cell">Client</th>
                <th className="text-left p-4 font-semibold text-muted-foreground hidden md:table-cell">Wilaya</th>
                <th className="text-right p-4 font-semibold text-muted-foreground hidden md:table-cell">Marge</th>
                <th className="text-center p-4 font-semibold text-muted-foreground">Statut</th>
                <th className="text-left p-4 font-semibold text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr key={o.id} className={cn("border-b border-border/50 hover:bg-muted/30 transition-colors", i % 2 === 0 ? "" : "bg-muted/10")}>
                  <td className="p-4 text-muted-foreground font-mono text-xs">#{o.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-md overflow-hidden bg-muted shrink-0">
                        <img src={o.productImage} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-medium truncate max-w-[140px]">{o.productName}</span>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <div>
                      <p className="font-medium">{o.customerFirstName} {o.customerLastName}</p>
                      <p className="text-xs text-muted-foreground">{o.customerPhone}</p>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground text-xs">{o.city}</td>
                  <td className="p-4 hidden md:table-cell text-right font-bold text-primary text-xs">{formatCurrency(o.netMargin)}</td>
                  <td className="p-4 text-center">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", statusColor(o.status))}>
                      {statusLabel(o.status)}
                    </span>
                  </td>
                  <td className="p-4 hidden lg:table-cell text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString("fr-DZ")}
                  </td>
                  <td className="p-4">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => openDetail(o)}>
                      <ChevronDown className="size-3" /> Statut
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Aucune commande trouvée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Status update modal */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Commande #{detail?.id}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ["Produit", detail.productName],
                  ["Client", `${detail.customerFirstName} ${detail.customerLastName}`],
                  ["Téléphone", detail.customerPhone],
                  ["Wilaya", detail.city],
                  ["Adresse", detail.fullAddress],
                  ["Prix vente", formatCurrency(detail.salePriceAffiliate)],
                  ["Prix grossiste", formatCurrency(detail.wholesalePrice)],
                  ["Marge nette", formatCurrency(detail.netMargin)],
                ].map(([k, v]) => (
                  <div key={k} className="p-2 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">{k}</p>
                    <p className="font-medium text-xs truncate">{v}</p>
                  </div>
                ))}
              </div>
              {detail.deliveryNote && (
                <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm">
                  <p className="text-xs text-yellow-400 font-semibold mb-1">Note de livraison</p>
                  <p>{detail.deliveryNote}</p>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold">Changer le statut</label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.filter(s => s.key !== "ALL").map(s => (
                    <button
                      key={s.key}
                      onClick={() => setNewStatus(s.key)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                        newStatus === s.key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetail(null)}>Fermer</Button>
            <Button onClick={updateStatus} disabled={saving || newStatus === detail?.status} className="gap-2">
              {saving && <Loader2 className="size-4 animate-spin" />}
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
