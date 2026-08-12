import { useEffect, useState } from "react"
import {
  adminListSuppliers, adminCreateSupplier, adminUpdateSupplier, adminDeleteSupplier,
  type AdminSupplier, type SupplierProduct,
} from "@/lib/admin-api"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Loader2, Phone, Mail, MapPin, X, Factory, Eye } from "lucide-react"

const EMPTY: Partial<AdminSupplier> = {
  name: "", phone: "", email: "", address: "", city: "", category: "", notes: "", products: [], active: true,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

export function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Partial<AdminSupplier>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [detail, setDetail] = useState<AdminSupplier | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const load = () => adminListSuppliers().then(setSuppliers).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openNew = () => { setEditing({ ...EMPTY, products: [] }); setModal(true) }
  const openEdit = (s: AdminSupplier) => { setEditing({ ...s, products: [...s.products] }); setModal(true) }

  const save = async () => {
    if (!editing.name?.trim()) return
    setSaving(true)
    try {
      if (editing.id) await adminUpdateSupplier(editing.id, editing)
      else await adminCreateSupplier(editing)
      setModal(false); load()
    } finally { setSaving(false) }
  }

  const remove = async (id: number) => { await adminDeleteSupplier(id); setDeleteId(null); load() }

  const addProduct = () => setEditing(v => ({
    ...v, products: [...(v.products ?? []), { productName: "", category: "", unitPrice: 0, minOrder: 1 }]
  }))
  const updProduct = (i: number, f: keyof SupplierProduct, val: string | number) =>
    setEditing(v => { const a = [...(v.products ?? [])]; a[i] = { ...a[i], [f]: val }; return { ...v, products: a } })
  const delProduct = (i: number) =>
    setEditing(v => { const a = [...(v.products ?? [])]; a.splice(i, 1); return { ...v, products: a } })

  const set = (patch: Partial<AdminSupplier>) => setEditing(v => ({ ...v, ...patch }))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Fournisseurs</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{suppliers.length} fournisseurs enregistrés</p>
        </div>
        <Button onClick={openNew} className="gap-2 w-fit shadow-[0_0_15px_rgba(229,169,60,0.2)]">
          <Plus className="size-4" /> Nouveau fournisseur
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {suppliers.map(s => (
            <div key={s.id} className={cn(
              "rounded-xl border bg-card p-4 space-y-3 transition-colors",
              s.active ? "border-border hover:border-primary/30" : "border-border/40 opacity-60"
            )}>
              {/* Top */}
              <div className="flex items-start gap-3">
                <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Factory className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{s.name}</p>
                  <div className="flex items-center flex-wrap gap-1.5 mt-0.5">
                    <Badge variant="outline" className="text-xs capitalize">{s.category || "—"}</Badge>
                    <span className={cn("text-xs font-semibold", s.active ? "text-green-400" : "text-muted-foreground")}>
                      {s.active ? "Actif" : "Inactif"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="size-8" onClick={() => openEdit(s)}><Pencil className="size-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="size-8 text-red-400 hover:text-red-300" onClick={() => setDeleteId(s.id)}><Trash2 className="size-3.5" /></Button>
                </div>
              </div>

              {/* Contacts */}
              <div className="space-y-1 text-xs text-muted-foreground">
                {s.phone && <div className="flex items-center gap-2"><Phone className="size-3.5 shrink-0" />{s.phone}</div>}
                {s.email && <div className="flex items-center gap-2"><Mail className="size-3.5 shrink-0" /><span className="truncate">{s.email}</span></div>}
                {s.city && <div className="flex items-center gap-2"><MapPin className="size-3.5 shrink-0" />{s.city}{s.address ? ` — ${s.address}` : ""}</div>}
              </div>

              {/* Products summary */}
              {s.products.length > 0 && (
                <div className="rounded-lg bg-muted/30 border border-border/50 p-2 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Produits fournis</p>
                  {s.products.map((p, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="truncate max-w-[55%] font-medium">{p.productName}</span>
                      <span className="text-primary font-bold">{formatCurrency(p.unitPrice)}</span>
                    </div>
                  ))}
                </div>
              )}

              {s.notes && (
                <p className="text-xs text-muted-foreground bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-2 line-clamp-2">{s.notes}</p>
              )}

              <Button variant="outline" size="sm" className="w-full text-xs gap-2" onClick={() => setDetail(s)}>
                <Eye className="size-3.5" /> Détails complets
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ── Detail modal ── */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-lg w-full max-h-[85vh] flex flex-col gap-0 p-0">
          <div className="px-6 pt-6 pb-4 border-b border-border shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Factory className="size-5 text-primary" />
              {detail?.name}
            </DialogTitle>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0" dir="ltr">
            {detail && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Téléphone", detail.phone],
                    ["Email", detail.email],
                    ["Ville", detail.city],
                    ["Catégorie", detail.category],
                  ].map(([k, v]) => (
                    <div key={k} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                      <p className="text-xs text-muted-foreground font-medium">{k}</p>
                      <p className="font-semibold text-sm mt-0.5 break-all">{v || "—"}</p>
                    </div>
                  ))}
                </div>
                {detail.address && (
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground font-medium">Adresse</p>
                    <p className="text-sm mt-0.5">{detail.address}</p>
                  </div>
                )}
                {detail.notes && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-xs font-bold text-yellow-400 mb-1">Notes</p>
                    <p className="text-sm">{detail.notes}</p>
                  </div>
                )}
                {detail.products.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Catalogue produits</p>
                    <div className="rounded-xl border border-border overflow-hidden">
                      {detail.products.map((p, i) => (
                        <div key={i} className={cn("flex justify-between items-center px-4 py-3", i !== detail.products.length - 1 && "border-b border-border/50", i % 2 !== 0 && "bg-muted/20")}>
                          <div>
                            <p className="font-medium text-sm">{p.productName}</p>
                            <p className="text-xs text-muted-foreground capitalize">{p.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{formatCurrency(p.unitPrice)}</p>
                            <p className="text-xs text-muted-foreground">min. {p.minOrder} unités</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="px-6 py-4 border-t border-border shrink-0 flex justify-end">
            <Button variant="outline" onClick={() => setDetail(null)}>Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ── */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Supprimer le fournisseur ?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
          <DialogFooter className="gap-2 flex-row justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deleteId && remove(deleteId)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create / Edit modal ── */}
      <Dialog open={modal} onOpenChange={v => { if (!v) setModal(false) }}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] flex flex-col gap-0 p-0">
          <div className="px-6 pt-6 pb-4 border-b border-border shrink-0">
            <DialogTitle>{editing.id ? "Modifier le fournisseur" : "Nouveau fournisseur"}</DialogTitle>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 min-h-0" dir="ltr">
            {/* Infos générales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nom *">
                <Input value={editing.name ?? ""} onChange={e => set({ name: e.target.value })} placeholder="Nom du fournisseur" />
              </Field>
              <Field label="Catégorie principale">
                <Input value={editing.category ?? ""} onChange={e => set({ category: e.target.value })} placeholder="electronics, health..." />
              </Field>
              <Field label="Téléphone">
                <Input value={editing.phone ?? ""} onChange={e => set({ phone: e.target.value })} placeholder="0555 XX XX XX" />
              </Field>
              <Field label="Email">
                <Input type="email" value={editing.email ?? ""} onChange={e => set({ email: e.target.value })} placeholder="contact@..." />
              </Field>
              <Field label="Ville">
                <Input value={editing.city ?? ""} onChange={e => set({ city: e.target.value })} placeholder="Alger, Oran..." />
              </Field>
              <Field label="Adresse">
                <Input value={editing.address ?? ""} onChange={e => set({ address: e.target.value })} placeholder="Rue, Cité..." />
              </Field>
            </div>

            <Field label="Notes">
              <textarea
                rows={2}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={editing.notes ?? ""}
                onChange={e => set({ notes: e.target.value })}
                placeholder="Conditions de paiement, délais, remarques..."
              />
            </Field>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="supActive" checked={editing.active ?? true}
                onChange={e => set({ active: e.target.checked })} className="size-4 rounded accent-primary" />
              <label htmlFor="supActive" className="text-sm cursor-pointer">Fournisseur actif</label>
            </div>

            {/* Produits */}
            <div>
              <div className="flex items-center justify-between py-2 border-b border-border mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Produits fournis</p>
                <Button size="sm" variant="outline" onClick={addProduct} className="gap-1 h-7 text-xs">
                  <Plus className="size-3" /> Ajouter
                </Button>
              </div>
              {(editing.products ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground italic">Aucun produit ajouté.</p>
              )}
              <div className="space-y-2">
                {(editing.products ?? []).map((p, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_80px_80px_36px] gap-2 items-center p-2 bg-muted/30 rounded-lg border border-border/50">
                    <Input
                      placeholder="Nom produit"
                      value={p.productName}
                      onChange={e => updProduct(i, "productName", e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Catégorie"
                      value={p.category}
                      onChange={e => updProduct(i, "category", e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Prix"
                      type="number"
                      min={0}
                      value={p.unitPrice}
                      onChange={e => updProduct(i, "unitPrice", Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Min"
                      type="number"
                      min={1}
                      value={p.minOrder}
                      onChange={e => updProduct(i, "minOrder", Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                    <Button size="icon" variant="ghost" className="size-8 text-red-400 shrink-0" onClick={() => delProduct(i)}>
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
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
