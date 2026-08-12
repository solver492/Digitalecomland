import { useEffect, useState } from "react"
import {
  adminListCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory,
  adminListProducts, adminUpdateProduct,
  type AdminCategory, type AdminProduct,
} from "@/lib/admin-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Plus, Pencil, Trash2, Loader2, Package, X, ChevronRight } from "lucide-react"

const EMPTY: Partial<AdminCategory> = { key: "", labelFr: "", labelAr: "", icon: "📦", active: true }

export function AdminCategories() {
  const [cats, setCats] = useState<AdminCategory[]>([])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Partial<AdminCategory>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  // For the "products in category" modal
  const [catProducts, setCatProducts] = useState<AdminCategory | null>(null)
  const [addingProductId, setAddingProductId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([adminListCategories(), adminListProducts()])
      .then(([c, p]) => { setCats(c); setProducts(p) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openNew = () => { setEditing({ ...EMPTY }); setModal(true) }
  const openEdit = (c: AdminCategory) => { setEditing({ ...c }); setModal(true) }

  const save = async () => {
    if (!editing.key?.trim() || !editing.labelFr?.trim()) return
    setSaving(true)
    try {
      if (editing.id) await adminUpdateCategory(editing.id, editing)
      else await adminCreateCategory(editing)
      setModal(false); load()
    } finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    await adminDeleteCategory(id); setDeleteId(null); load()
  }

  const toggle = async (c: AdminCategory) => {
    await adminUpdateCategory(c.id, { active: !c.active }); load()
  }

  // Products linked to a category = products whose category key matches
  const getLinkedProducts = (catKey: string) =>
    products.filter(p => p.category === catKey)

  const getUnlinkedProducts = (catKey: string) =>
    products.filter(p => p.category !== catKey)

  const linkProduct = async (productId: number, catKey: string) => {
    await adminUpdateProduct(productId, { category: catKey })
    load()
    setAddingProductId(null)
  }

  const unlinkProduct = async (productId: number) => {
    await adminUpdateProduct(productId, { category: "" })
    load()
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Catégories</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{cats.length} catégories configurées</p>
        </div>
        <Button onClick={openNew} className="gap-2 w-fit shadow-[0_0_15px_rgba(229,169,60,0.2)]">
          <Plus className="size-4" /> Nouvelle catégorie
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {cats.map(c => {
            const linked = getLinkedProducts(c.key)
            return (
              <div key={c.id} className={cn(
                "rounded-xl border bg-card p-4 space-y-3 transition-colors",
                c.active ? "border-border hover:border-primary/30" : "border-border/40 opacity-60"
              )}>
                {/* Top row */}
                <div className="flex items-start gap-3">
                  <div className="size-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0 border border-border">
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{c.labelFr}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5" dir="rtl">{c.labelAr}</p>
                    <Badge variant="outline" className="text-xs mt-1 font-mono">{c.key}</Badge>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="size-8" onClick={() => openEdit(c)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-8 text-red-400 hover:text-red-300" onClick={() => setDeleteId(c.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Status toggle */}
                <button
                  onClick={() => toggle(c)}
                  className={cn(
                    "text-xs font-semibold px-3 py-1 rounded-full transition-colors w-fit",
                    c.active
                      ? "bg-green-500/15 text-green-400 hover:bg-red-500/15 hover:text-red-400"
                      : "bg-muted text-muted-foreground hover:bg-green-500/15 hover:text-green-400"
                  )}
                >
                  {c.active ? "● Active" : "○ Inactive"}
                </button>

                {/* Linked products summary */}
                <div className="rounded-lg bg-muted/40 border border-border/50 p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Package className="size-3.5" />
                      <span>{linked.length} produit{linked.length !== 1 ? "s" : ""}</span>
                    </div>
                    <button
                      onClick={() => setCatProducts(c)}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      Gérer <ChevronRight className="size-3" />
                    </button>
                  </div>
                  {linked.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {linked.slice(0, 3).map(p => (
                        <span key={p.id} className="text-xs bg-background border border-border px-1.5 py-0.5 rounded truncate max-w-[120px]">
                          {p.name}
                        </span>
                      ))}
                      {linked.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{linked.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Delete confirm ── */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer la catégorie ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Les produits associés garderont leur ancienne clé catégorie. Cette action est irréversible.
          </p>
          <DialogFooter className="gap-2 flex-row justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deleteId && remove(deleteId)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create / Edit modal ── */}
      <Dialog open={modal} onOpenChange={v => { if (!v) setModal(false) }}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>{editing.id ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2" dir="ltr">
            <div className="grid grid-cols-2 gap-3">
              {/* Key */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground">Clé (slug) *</label>
                <Input
                  dir="ltr"
                  value={editing.key ?? ""}
                  onChange={e => setEditing(v => ({ ...v, key: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                  placeholder="ex: electronics"
                />
              </div>
              {/* Icon */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground">Icône (emoji)</label>
                <Input
                  dir="ltr"
                  value={editing.icon ?? ""}
                  onChange={e => setEditing(v => ({ ...v, icon: e.target.value }))}
                  placeholder="📦"
                />
              </div>
            </div>

            {/* Label FR */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-muted-foreground">Nom en français *</label>
              <Input
                dir="ltr"
                value={editing.labelFr ?? ""}
                onChange={e => setEditing(v => ({ ...v, labelFr: e.target.value }))}
                placeholder="ex: Électronique & Tech"
              />
            </div>

            {/* Label AR */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-muted-foreground">Nom en arabe</label>
              <Input
                dir="rtl"
                value={editing.labelAr ?? ""}
                onChange={e => setEditing(v => ({ ...v, labelAr: e.target.value }))}
                placeholder="إلكترونيات وتقنية"
                className="text-right"
              />
            </div>

            {/* Active */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="catActive"
                checked={editing.active ?? true}
                onChange={e => setEditing(v => ({ ...v, active: e.target.checked }))}
                className="size-4 rounded accent-primary"
              />
              <label htmlFor="catActive" className="text-sm cursor-pointer">
                Visible dans le catalogue
              </label>
            </div>

            {/* Preview */}
            {(editing.key || editing.icon || editing.labelFr) && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-center gap-3">
                <span className="text-2xl">{editing.icon || "📦"}</span>
                <div>
                  <p className="text-sm font-bold">{editing.labelFr || "—"}</p>
                  <p className="text-xs text-muted-foreground font-mono">{editing.key || "—"}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 flex-row justify-end">
            <Button variant="outline" onClick={() => setModal(false)}>Annuler</Button>
            <Button
              onClick={save}
              disabled={saving || !editing.key?.trim() || !editing.labelFr?.trim()}
              className="gap-2 min-w-[120px]"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editing.id ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Products in category modal ── */}
      <Dialog open={!!catProducts} onOpenChange={v => { if (!v) { setCatProducts(null); setAddingProductId(null) } }}>
        <DialogContent className="max-w-xl w-full max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{catProducts?.icon}</span>
              Produits — {catProducts?.labelFr}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-2 min-h-0">
            {/* Linked products */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Produits liés ({catProducts ? getLinkedProducts(catProducts.key).length : 0})
              </p>
              {catProducts && getLinkedProducts(catProducts.key).length === 0 && (
                <p className="text-sm text-muted-foreground italic p-3 bg-muted/30 rounded-lg">
                  Aucun produit lié à cette catégorie.
                </p>
              )}
              {catProducts && getLinkedProducts(catProducts.key).map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                  <div className="size-8 rounded-md overflow-hidden bg-muted shrink-0">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      : <Package className="size-4 m-auto mt-2 text-muted-foreground" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.inStock ? "En stock" : "Épuisé"}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0 size-8 text-red-400 hover:text-red-300"
                    onClick={() => unlinkProduct(p.id)}
                    title="Retirer de cette catégorie"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add product */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ajouter un produit
              </p>
              {catProducts && getUnlinkedProducts(catProducts.key).length === 0 ? (
                <p className="text-sm text-muted-foreground italic p-3 bg-muted/30 rounded-lg">
                  Tous les produits sont déjà dans cette catégorie.
                </p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {catProducts && getUnlinkedProducts(catProducts.key).map(p => (
                    <button
                      key={p.id}
                      onClick={() => linkProduct(p.id, catProducts.key)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
                    >
                      <div className="size-7 rounded-md overflow-hidden bg-muted shrink-0">
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          : <Package className="size-3.5 m-auto mt-1.5 text-muted-foreground" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.category || "Sans catégorie"}</p>
                      </div>
                      <Plus className="size-4 text-primary shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-row justify-end pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setCatProducts(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
