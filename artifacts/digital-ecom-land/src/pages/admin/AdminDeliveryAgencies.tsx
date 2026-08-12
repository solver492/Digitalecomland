import { useEffect, useState } from "react"
import {
  adminListAgencies, adminCreateAgency, adminUpdateAgency, adminDeleteAgency,
  type AdminDeliveryAgency,
} from "@/lib/admin-api"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Loader2, Phone, Mail, ExternalLink, MapPin, Truck } from "lucide-react"

const EMPTY: Partial<AdminDeliveryAgency> = {
  name: "", phone: "", email: "", wilayasCovered: [],
  pricePerKg: 0, deliveryDelay: "", trackingUrl: "", notes: "", active: true,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

export function AdminDeliveryAgencies() {
  const [agencies, setAgencies] = useState<AdminDeliveryAgency[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Partial<AdminDeliveryAgency>>(EMPTY)
  const [wilayaInput, setWilayaInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const load = () => adminListAgencies().then(setAgencies).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openNew = () => { setEditing({ ...EMPTY, wilayasCovered: [] }); setWilayaInput(""); setModal(true) }
  const openEdit = (a: AdminDeliveryAgency) => {
    setEditing({ ...a, wilayasCovered: [...a.wilayasCovered] })
    setWilayaInput(a.wilayasCovered.join(", "))
    setModal(true)
  }

  const save = async () => {
    if (!editing.name?.trim()) return
    const wilayas = wilayaInput.split(",").map(w => w.trim()).filter(Boolean)
    const payload = { ...editing, wilayasCovered: wilayas }
    setSaving(true)
    try {
      if (editing.id) await adminUpdateAgency(editing.id, payload)
      else await adminCreateAgency(payload)
      setModal(false); load()
    } finally { setSaving(false) }
  }

  const remove = async (id: number) => { await adminDeleteAgency(id); setDeleteId(null); load() }
  const toggle = async (a: AdminDeliveryAgency) => { await adminUpdateAgency(a.id, { active: !a.active }); load() }
  const set = (patch: Partial<AdminDeliveryAgency>) => setEditing(v => ({ ...v, ...patch }))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Agences de Livraison</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{agencies.length} agences enregistrées</p>
        </div>
        <Button onClick={openNew} className="gap-2 w-fit shadow-[0_0_15px_rgba(229,169,60,0.2)]">
          <Plus className="size-4" /> Nouvelle agence
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {agencies.map(a => (
            <div key={a.id} className={cn(
              "rounded-xl border bg-card p-4 space-y-3 transition-colors",
              a.active ? "border-border hover:border-blue-400/30" : "border-border/40 opacity-60"
            )}>
              {/* Top */}
              <div className="flex items-start gap-3">
                <div className="size-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Truck className="size-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{a.name}</p>
                  <button
                    onClick={() => toggle(a)}
                    className={cn(
                      "text-xs font-semibold px-2.5 py-0.5 rounded-full mt-0.5 transition-colors",
                      a.active
                        ? "bg-green-500/15 text-green-400 hover:bg-red-500/15 hover:text-red-400"
                        : "bg-muted text-muted-foreground hover:bg-green-500/15 hover:text-green-400"
                    )}
                  >
                    {a.active ? "● Active" : "○ Inactive"}
                  </button>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="size-8" onClick={() => openEdit(a)}><Pencil className="size-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="size-8 text-red-400 hover:text-red-300" onClick={() => setDeleteId(a.id)}><Trash2 className="size-3.5" /></Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-muted/30 rounded-lg border border-border/50 text-center">
                  <p className="text-xs text-muted-foreground">Prix / kg</p>
                  <p className="font-black text-primary text-sm">{formatCurrency(a.pricePerKg)}</p>
                </div>
                <div className="p-2.5 bg-muted/30 rounded-lg border border-border/50 text-center">
                  <p className="text-xs text-muted-foreground">Délai</p>
                  <p className="font-bold text-sm">{a.deliveryDelay || "—"}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1 text-xs text-muted-foreground">
                {a.phone && <div className="flex items-center gap-2"><Phone className="size-3.5 shrink-0" />{a.phone}</div>}
                {a.email && <div className="flex items-center gap-2"><Mail className="size-3.5 shrink-0" /><span className="truncate">{a.email}</span></div>}
                {a.trackingUrl && (
                  <a href={a.trackingUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                    <ExternalLink className="size-3.5 shrink-0" />Suivi en ligne
                  </a>
                )}
              </div>

              {/* Wilayas */}
              {a.wilayasCovered.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
                    <MapPin className="size-3" /> Couverture
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {a.wilayasCovered.slice(0, 4).map(w => (
                      <span key={w} className="text-xs bg-muted border border-border/50 px-1.5 py-0.5 rounded-md">{w}</span>
                    ))}
                    {a.wilayasCovered.length > 4 && (
                      <span className="text-xs text-muted-foreground">+{a.wilayasCovered.length - 4}</span>
                    )}
                  </div>
                </div>
              )}

              {a.notes && (
                <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2 border border-border/50 line-clamp-2">{a.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Delete confirm ── */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Supprimer l'agence ?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
          <DialogFooter className="gap-2 flex-row justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deleteId && remove(deleteId)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create / Edit modal ── */}
      <Dialog open={modal} onOpenChange={v => { if (!v) setModal(false) }}>
        <DialogContent className="max-w-lg w-full max-h-[90vh] flex flex-col gap-0 p-0">
          <div className="px-6 pt-6 pb-4 border-b border-border shrink-0">
            <DialogTitle>{editing.id ? "Modifier l'agence" : "Nouvelle agence"}</DialogTitle>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0" dir="ltr">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nom *">
                <Input value={editing.name ?? ""} onChange={e => set({ name: e.target.value })} placeholder="Nom de l'agence" />
              </Field>
              <Field label="Téléphone">
                <Input value={editing.phone ?? ""} onChange={e => set({ phone: e.target.value })} placeholder="021 XX XX XX" />
              </Field>
              <Field label="Email">
                <Input type="email" value={editing.email ?? ""} onChange={e => set({ email: e.target.value })} placeholder="pro@agence.dz" />
              </Field>
              <Field label="Délai de livraison">
                <Input value={editing.deliveryDelay ?? ""} onChange={e => set({ deliveryDelay: e.target.value })} placeholder="ex: 24-48h" />
              </Field>
              <Field label="Prix par kg (DZD)">
                <Input type="number" min={0} value={editing.pricePerKg ?? 0} onChange={e => set({ pricePerKg: Number(e.target.value) })} />
              </Field>
              <Field label="URL de suivi">
                <Input value={editing.trackingUrl ?? ""} onChange={e => set({ trackingUrl: e.target.value })} placeholder="https://..." />
              </Field>
            </div>

            <Field label="Wilayas couvertes (séparées par virgule)">
              <textarea
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={wilayaInput}
                onChange={e => setWilayaInput(e.target.value)}
                placeholder="Alger, Oran, Constantine, Blida, Sétif..."
              />
              {wilayaInput && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {wilayaInput.split(",").map(w => w.trim()).filter(Boolean).map(w => (
                    <span key={w} className="text-xs bg-muted border border-border/50 px-1.5 py-0.5 rounded-md">{w}</span>
                  ))}
                </div>
              )}
            </Field>

            <Field label="Notes">
              <textarea
                rows={2}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={editing.notes ?? ""}
                onChange={e => set({ notes: e.target.value })}
                placeholder="Observations, conditions, partenariat..."
              />
            </Field>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="agActive" checked={editing.active ?? true}
                onChange={e => set({ active: e.target.checked })} className="size-4 rounded accent-primary" />
              <label htmlFor="agActive" className="text-sm cursor-pointer">Agence active</label>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border shrink-0 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModal(false)}>Annuler</Button>
            <Button onClick={save} disabled={saving || !editing.name?.trim()} className="gap-2 min-w-[120px]">
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editing.id ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
