import { useEffect, useState } from "react"
import {
  adminListProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  adminListCategories,
  type AdminProduct, type ProductDetail, type AdminCategory,
} from "@/lib/admin-api"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Plus, Pencil, Trash2, Loader2, Search, ImagePlus,
  X, Video, Package, ChevronDown,
} from "lucide-react"

const EMPTY_DETAIL: ProductDetail = {
  images: [], longDescription: "", benefits: [], ingredients: [], specs: [], badge: "", videoUrl: "",
}
const EMPTY: Partial<AdminProduct> = {
  name: "", category: "", imageUrl: "", wholesalePrice: 0, suggestedPrice: 0,
  affiliateMargin: 0, description: "", deliveryCost: 0, inStock: true,
  detail: { ...EMPTY_DETAIL },
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}?rel=0`
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v")
      return id ? `https://www.youtube.com/embed/${id}?rel=0` : null
    }
    if (u.hostname.includes("vimeo.com")) return `https://player.vimeo.com/video${u.pathname}`
    return null
  } catch { return null }
}

// ---------- small field component ----------
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

// ---------- section heading ----------
function Section({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border mb-3">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
      {action}
    </div>
  )
}

export function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<AdminProduct>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [catOpen, setCatOpen] = useState(false)

  const load = () =>
    Promise.all([adminListProducts(), adminListCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c) })
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const openNew = () => { setEditing({ ...EMPTY, detail: { ...EMPTY_DETAIL } }); setModalOpen(true) }
  const openEdit = (p: AdminProduct) => {
    setEditing({ ...p, detail: { ...EMPTY_DETAIL, ...(p.detail ?? {}) } })
    setModalOpen(true)
  }

  const save = async () => {
    if (!editing.name?.trim()) return
    setSaving(true)
    try {
      if (editing.id) await adminUpdateProduct(editing.id, editing)
      else await adminCreateProduct(editing)
      setModalOpen(false); load()
    } finally { setSaving(false) }
  }

  const remove = async (id: number) => { await adminDeleteProduct(id); setDeleteId(null); load() }

  const set = (patch: Partial<AdminProduct>) => setEditing(v => ({ ...v, ...patch }))
  const setDetail = (patch: Partial<ProductDetail>) =>
    setEditing(e => ({ ...e, detail: { ...(e.detail ?? EMPTY_DETAIL), ...patch } }))

  // images
  const addImage = () => setDetail({ images: [...(editing.detail?.images ?? []), ""] })
  const setImage = (i: number, v: string) => {
    const a = [...(editing.detail?.images ?? [])]; a[i] = v; setDetail({ images: a })
  }
  const delImage = (i: number) => {
    const a = [...(editing.detail?.images ?? [])]; a.splice(i, 1); setDetail({ images: a })
  }

  // benefits
  const addBenefit = () => setDetail({ benefits: [...(editing.detail?.benefits ?? []), ""] })
  const setBenefit = (i: number, v: string) => {
    const a = [...(editing.detail?.benefits ?? [])]; a[i] = v; setDetail({ benefits: a })
  }
  const delBenefit = (i: number) => {
    const a = [...(editing.detail?.benefits ?? [])]; a.splice(i, 1); setDetail({ benefits: a })
  }

  // ingredients
  const addIng = () => setDetail({ ingredients: [...(editing.detail?.ingredients ?? []), ""] })
  const setIng = (i: number, v: string) => {
    const a = [...(editing.detail?.ingredients ?? [])]; a[i] = v; setDetail({ ingredients: a })
  }
  const delIng = (i: number) => {
    const a = [...(editing.detail?.ingredients ?? [])]; a.splice(i, 1); setDetail({ ingredients: a })
  }

  // specs
  const addSpec = () => setDetail({ specs: [...(editing.detail?.specs ?? []), { label: "", value: "" }] })
  const setSpec = (i: number, f: "label" | "value", v: string) => {
    const a = [...(editing.detail?.specs ?? [])]; a[i] = { ...a[i], [f]: v }; setDetail({ specs: a })
  }
  const delSpec = (i: number) => {
    const a = [...(editing.detail?.specs ?? [])]; a.splice(i, 1); setDetail({ specs: a })
  }

  const embedUrl = getEmbedUrl(editing.detail?.videoUrl ?? "")
  const selectedCat = categories.find(c => c.key === editing.category)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Produits</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{products.length} produits dans le catalogue</p>
        </div>
        <Button onClick={openNew} className="gap-2 w-fit shadow-[0_0_15px_rgba(229,169,60,0.2)]">
          <Plus className="size-4" /> Nouveau produit
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input placeholder="Chercher produit..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto bg-card">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <th className="px-4 py-3 font-semibold text-muted-foreground">Produit</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Catégorie</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Grossiste</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Marge</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Stock</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} className={cn("border-b border-border/40 hover:bg-muted/20 transition-colors", i % 2 !== 0 && "bg-muted/10")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none" }} />
                          : <Package className="size-4 text-muted-foreground m-auto mt-2.5" />
                        }
                      </div>
                      <span className="font-medium truncate max-w-[180px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {p.category
                      ? <Badge variant="outline" className="text-xs capitalize font-mono">{p.category}</Badge>
                      : <span className="text-xs text-muted-foreground italic">Sans catégorie</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-xs">{formatCurrency(p.wholesalePrice)}</td>
                  <td className="px-4 py-3 text-right font-bold text-primary">{formatCurrency(p.affiliateMargin)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", p.inStock ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400")}>
                      {p.inStock ? "En stock" : "Épuisé"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="size-8" onClick={() => openEdit(p)}><Pencil className="size-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="size-8 text-red-400 hover:text-red-300" onClick={() => setDeleteId(p.id)}><Trash2 className="size-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Aucun produit trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Supprimer ce produit ?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
          <DialogFooter className="gap-2 flex-row justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deleteId && remove(deleteId)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════
          Edit / Create modal — bien formaté, LTR forcé
      ═══════════════════════════════════════════════ */}
      <Dialog open={modalOpen} onOpenChange={v => { if (!v) setModalOpen(false) }}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] flex flex-col gap-0 p-0">
          {/* Fixed header */}
          <div className="px-6 pt-6 pb-4 border-b border-border shrink-0">
            <DialogTitle className="text-lg font-bold">
              {editing.id ? "Modifier le produit" : "Nouveau produit"}
            </DialogTitle>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 min-h-0" dir="ltr">

            {/* ── 1. Informations de base ── */}
            <div>
              <Section title="Informations de base" />
              <div className="space-y-3">
                <Field label="Nom du produit *">
                  <Input value={editing.name ?? ""} onChange={e => set({ name: e.target.value })} placeholder="Nom du produit" />
                </Field>

                <Field label="Catégorie *">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCatOpen(o => !o)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-border bg-background text-sm hover:border-primary/50 transition-colors"
                    >
                      <span className={cn("flex items-center gap-2", !selectedCat && "text-muted-foreground")}>
                        {selectedCat ? (
                          <>{selectedCat.icon} {selectedCat.labelFr}</>
                        ) : (
                          "Sélectionner une catégorie"
                        )}
                      </span>
                      <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                    </button>
                    {catOpen && (
                      <div className="absolute top-full mt-1 left-0 right-0 bg-popover border border-border rounded-lg shadow-xl z-50 max-h-52 overflow-y-auto">
                        <button
                          className="w-full px-3 py-2 text-sm text-left hover:bg-muted text-muted-foreground italic"
                          onClick={() => { set({ category: "" }); setCatOpen(false) }}
                        >
                          — Sans catégorie
                        </button>
                        {categories.filter(c => c.active).map(c => (
                          <button
                            key={c.key}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors",
                              editing.category === c.key && "bg-primary/10 text-primary"
                            )}
                            onClick={() => { set({ category: c.key }); setCatOpen(false) }}
                          >
                            <span>{c.icon}</span>
                            <span className="flex-1">{c.labelFr}</span>
                            <span className="text-xs text-muted-foreground font-mono">{c.key}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>

                <Field label="Description courte">
                  <textarea
                    rows={2}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={editing.description ?? ""}
                    onChange={e => set({ description: e.target.value })}
                    placeholder="Description affichée dans le catalogue..."
                  />
                </Field>
              </div>
            </div>

            {/* ── 2. Tarification ── */}
            <div>
              <Section title="Tarification" />
              <div className="grid grid-cols-2 gap-3">
                {([
                  ["wholesalePrice",  "Prix grossiste (DZD)"],
                  ["suggestedPrice",  "Prix suggéré (DZD)"],
                  ["affiliateMargin", "Marge affilié (DZD)"],
                  ["deliveryCost",    "Frais livraison (DZD)"],
                ] as const).map(([key, label]) => (
                  <Field key={key} label={label}>
                    <Input
                      type="number"
                      min={0}
                      value={(editing as any)[key] ?? 0}
                      onChange={e => set({ [key]: Number(e.target.value) } as any)}
                    />
                  </Field>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <input type="checkbox" id="inStk" checked={editing.inStock ?? true}
                  onChange={e => set({ inStock: e.target.checked })} className="size-4 rounded accent-primary" />
                <label htmlFor="inStk" className="text-sm cursor-pointer">Produit en stock</label>
              </div>
            </div>

            {/* ── 3. Images ── */}
            <div>
              <Section
                title="Galerie d'images"
                action={
                  <Button size="sm" variant="outline" onClick={addImage} className="gap-1 h-7 text-xs">
                    <ImagePlus className="size-3" /> Ajouter
                  </Button>
                }
              />
              <Field label="Image principale (URL)">
                <Input value={editing.imageUrl ?? ""} onChange={e => set({ imageUrl: e.target.value })} placeholder="https://..." />
              </Field>
              {(editing.detail?.images ?? []).length > 0 && (
                <div className="space-y-2 mt-3">
                  {(editing.detail?.images ?? []).map((img, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="size-10 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                        {img && <img src={img} alt="" className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none" }} />}
                      </div>
                      <Input value={img} onChange={e => setImage(i, e.target.value)} placeholder={`Image ${i + 1} — URL`} className="flex-1" />
                      <Button size="icon" variant="ghost" className="shrink-0 size-9 text-red-400" onClick={() => delImage(i)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── 4. Vidéo ── */}
            <div>
              <Section title="Vidéo produit (embed)" />
              <Field label="URL YouTube ou Vimeo">
                <Input
                  value={editing.detail?.videoUrl ?? ""}
                  onChange={e => setDetail({ videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </Field>
              {embedUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-border aspect-video">
                  <iframe src={embedUrl} className="w-full h-full" allow="accelerometer; autoplay; encrypted-media" allowFullScreen title="Vidéo produit" />
                </div>
              )}
            </div>

            {/* ── 5. Description longue + badge ── */}
            <div>
              <Section title="Landing page produit" />
              <div className="space-y-3">
                <Field label="Description longue">
                  <textarea
                    rows={4}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={editing.detail?.longDescription ?? ""}
                    onChange={e => setDetail({ longDescription: e.target.value })}
                    placeholder="Description complète pour la page produit..."
                  />
                </Field>
                <Field label="Badge (ex: 🔥 Bestseller)">
                  <Input value={editing.detail?.badge ?? ""} onChange={e => setDetail({ badge: e.target.value })} placeholder="🔥 Bestseller" />
                </Field>
              </div>
            </div>

            {/* ── 6. Avantages ── */}
            <div>
              <Section
                title="Avantages clés"
                action={
                  <Button size="sm" variant="outline" onClick={addBenefit} className="gap-1 h-7 text-xs">
                    <Plus className="size-3" /> Ajouter
                  </Button>
                }
              />
              {(editing.detail?.benefits ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground italic">Aucun avantage ajouté.</p>
              )}
              <div className="space-y-2">
                {(editing.detail?.benefits ?? []).map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-primary text-xs font-bold shrink-0 w-5">{i + 1}.</span>
                    <Input value={b} onChange={e => setBenefit(i, e.target.value)} placeholder={`Avantage ${i + 1}`} className="flex-1" />
                    <Button size="icon" variant="ghost" className="shrink-0 size-9 text-red-400" onClick={() => delBenefit(i)}><X className="size-4" /></Button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 7. Ingrédients ── */}
            <div>
              <Section
                title="Ingrédients / Composants"
                action={
                  <Button size="sm" variant="outline" onClick={addIng} className="gap-1 h-7 text-xs">
                    <Plus className="size-3" /> Ajouter
                  </Button>
                }
              />
              {(editing.detail?.ingredients ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground italic">Optionnel — pour les produits de santé, beauté, etc.</p>
              )}
              <div className="space-y-2">
                {(editing.detail?.ingredients ?? []).map((ing, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-primary shrink-0" />
                    <Input value={ing} onChange={e => setIng(i, e.target.value)} placeholder={`Ingrédient ${i + 1}`} className="flex-1" />
                    <Button size="icon" variant="ghost" className="shrink-0 size-9 text-red-400" onClick={() => delIng(i)}><X className="size-4" /></Button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 8. Fiche technique ── */}
            <div>
              <Section
                title="Fiche technique"
                action={
                  <Button size="sm" variant="outline" onClick={addSpec} className="gap-1 h-7 text-xs">
                    <Plus className="size-3" /> Ajouter
                  </Button>
                }
              />
              {(editing.detail?.specs ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground italic">Aucune spec ajoutée.</p>
              )}
              <div className="space-y-2">
                {(editing.detail?.specs ?? []).map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={s.label} onChange={e => setSpec(i, "label", e.target.value)} placeholder="Label (ex: Poids)" className="w-2/5" />
                    <span className="text-muted-foreground text-xs shrink-0">:</span>
                    <Input value={s.value} onChange={e => setSpec(i, "value", e.target.value)} placeholder="Valeur (ex: 320g)" className="flex-1" />
                    <Button size="icon" variant="ghost" className="shrink-0 size-9 text-red-400" onClick={() => delSpec(i)}><X className="size-4" /></Button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Fixed footer */}
          <div className="px-6 py-4 border-t border-border shrink-0 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={save} disabled={saving || !editing.name?.trim()} className="gap-2 min-w-[140px]">
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editing.id ? "Enregistrer les modifications" : "Créer le produit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
