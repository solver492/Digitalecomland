import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useListOrders, useCreateOrder, useUpdateOrderStatus, useListProducts, getListOrdersQueryKey, getGetDashboardStatsQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { Search, Plus, Loader2, Package, MapPin, User, FileText, Banknote } from "lucide-react"

// Villes marocaines (principales)
const WILAYAS = [
  "الدار البيضاء", "الرباط", "فاس", "مراكش", "طنجة", "أكادير", "مكناس",
  "وجدة", "القنيطرة", "تطوان", "سلا", "بنسليمان", "بركان", "الجديدة",
  "خريبكة", "سطات", "بني ملال", "خنيفرة", "الحسيمة", "تازة",
  "واد زم", "قلعة السراغنة", "تارودانت", "العيون", "الداخلة",
  "الراشيدية", "إفران", "ميدلت", "ورزازات", "الصويرة", "آسفي",
  "قصبة تادلة", "الفقيه بن صالح", "سيدي قاسم", "سيدي سليمان",
]

export function OrdersPage() {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false)
  const queryClient = useQueryClient()
  const isRtl = i18n.language === "ar"

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const newProductId = params.get('new')
    if (newProductId) {
      setIsNewOrderModalOpen(true)
    }
  }, [])

  const { data: orders, isLoading } = useListOrders({
    search: search.length > 2 ? search : undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("orders.title")}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">{t("orders.subtitle")}</p>
        </div>
        <Button
          className="gap-2 shadow-[0_0_15px_rgba(229,169,60,0.2)]"
          onClick={() => setIsNewOrderModalOpen(true)}
          data-testid="btn-add-order"
        >
          <Plus className="size-4" /> {t("orders.addOrder")}
        </Button>
      </div>

      <Card className="p-3 sm:p-4 bg-card border-border">
        <div className="flex flex-col gap-3 mb-4">
          {/* Status tabs — scrollable on small screens */}
          <div className="overflow-x-auto -mx-1 px-1">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="bg-muted flex w-max min-w-full">
                {(["ALL","NOUVELLE","CONFIRMEE","EN_COURS_LIVRAISON","LIVREE","RETOURNEE"] as const).map(s => (
                  <TabsTrigger key={s} value={s} className="text-xs sm:text-sm whitespace-nowrap">
                    {t(`orders.status.${s}`)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="relative w-full sm:w-72 sm:ms-auto">
            <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 size-4 text-muted-foreground`} />
            <Input
              placeholder={t("orders.search")}
              className={isRtl ? "pr-9" : "pl-9"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : !orders?.length ? (
          <div className="text-center py-12 border border-dashed rounded-lg border-border bg-muted/20">
            <p className="text-muted-foreground">{t("orders.table.noOrders")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>#{t("orders.table.date")}</TableHead>
                  <TableHead>{t("orders.table.customer")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("orders.table.product")}</TableHead>
                  <TableHead>{t("orders.table.status")}</TableHead>
                  <TableHead className="text-end">{t("orders.table.margin")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="group">
                    <TableCell>
                      <div className="font-medium text-foreground">#{order.id}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customerFirstName} {order.customerLastName}</div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="size-3 shrink-0" /> {order.city}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-3">
                        <img src={order.productImage} alt="" className="size-10 rounded-md object-cover bg-muted shrink-0" />
                        <div>
                          <div className="font-medium line-clamp-1 max-w-[180px]">{order.productName}</div>
                          <div className="text-xs text-muted-foreground">{formatCurrency(order.salePriceAffiliate)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-end">
                      <span className="font-bold text-primary tracking-tight">
                        {formatCurrency(order.netMargin)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <NewOrderDialog
        open={isNewOrderModalOpen}
        onOpenChange={setIsNewOrderModalOpen}
        onSuccess={() => {
          setIsNewOrderModalOpen(false)
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() })
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() })
        }}
      />
    </div>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  const label = t(`orders.status.${status}`, { defaultValue: status })
  switch (status) {
    case 'NOUVELLE': return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20 text-xs">{label}</Badge>
    case 'CONFIRMEE': return <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20 text-xs">{label}</Badge>
    case 'EN_COURS_LIVRAISON': return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 text-xs">{label}</Badge>
    case 'LIVREE': return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 text-xs">{label}</Badge>
    case 'RETOURNEE': return <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20 text-xs">{label}</Badge>
    case 'ANNULEE': return <Badge variant="outline" className="text-muted-foreground text-xs">{label}</Badge>
    default: return <Badge variant="outline" className="text-xs">{status}</Badge>
  }
}

function NewOrderDialog({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onSuccess: () => void }) {
  const { t } = useTranslation()
  const { data: products } = useListProducts()
  const createOrder = useCreateOrder()

  const [productId, setProductId] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState(WILAYAS[15]) // Alger by default
  const [address, setAddress] = useState("")
  const [salePrice, setSalePrice] = useState("")
  const [note, setNote] = useState("")

  useEffect(() => {
    if (open) {
      const params = new URLSearchParams(window.location.search)
      const newProductId = params.get('new')
      if (newProductId && products?.some(p => p.id.toString() === newProductId)) {
        setProductId(newProductId)
        const prod = products.find(p => p.id.toString() === newProductId)
        if (prod) setSalePrice(prod.suggestedPrice.toString())
      }
    }
  }, [open, products])

  const selectedProduct = products?.find(p => p.id.toString() === productId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId) return
    createOrder.mutate({
      data: {
        productId: parseInt(productId),
        customerFirstName: firstName,
        customerLastName: lastName,
        customerPhone: phone,
        city,
        fullAddress: address,
        salePriceAffiliate: parseInt(salePrice),
        deliveryNote: note
      }
    }, { onSuccess })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("orders.form.title")}</DialogTitle>
          <DialogDescription>
            {t("orders.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Product */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Package className="size-4 text-muted-foreground" /> {t("orders.form.selectProduct")}
            </label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value)
                const prod = products?.find(p => p.id.toString() === e.target.value)
                if (prod) setSalePrice(prod.suggestedPrice.toString())
              }}
              required
            >
              <option value="" disabled>{t("orders.form.selectProduct")}...</option>
              {products?.length === 0 && <option disabled>{t("orders.form.noProducts")}</option>}
              {products?.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.wholesalePrice)}</option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <User className="size-4 text-muted-foreground" /> {t("orders.form.customerFirstName")}
              </label>
              <Input required placeholder="Ahmed" value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("orders.form.customerLastName")}</label>
              <Input required placeholder="Mansouri" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>

          {/* Phone + City */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("orders.form.customerPhone")}</label>
              <Input required placeholder="05 XX XX XX XX" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <MapPin className="size-4 text-muted-foreground" /> {t("orders.form.city")}
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={city}
                onChange={e => setCity(e.target.value)}
                required
              >
                {WILAYAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("orders.form.fullAddress")}</label>
            <Input required placeholder="Rue Larbi Ben M'hidi, Bab El Oued" value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Banknote className="size-4 text-muted-foreground" /> {t("orders.form.salePrice")}
            </label>
            <Input required type="number" min={selectedProduct?.wholesalePrice || 0} placeholder="0" value={salePrice} onChange={e => setSalePrice(e.target.value)} />
            {selectedProduct && salePrice && (
              <p className="text-xs text-muted-foreground">
                Marge estimée: <span className="text-primary font-bold">{formatCurrency(parseInt(salePrice) - Number(selectedProduct.wholesalePrice) - Number(selectedProduct.deliveryCost))}</span>
              </p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <FileText className="size-4 text-muted-foreground" /> {t("orders.form.deliveryNote")}
            </label>
            <Input placeholder="Appeler avant livraison..." value={note} onChange={e => setNote(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("orders.form.cancel")}</Button>
            <Button type="submit" disabled={createOrder.isPending} className="gap-2">
              {createOrder.isPending && <Loader2 className="size-4 animate-spin" />}
              {t("orders.form.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
