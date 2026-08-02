import { useState, useEffect } from "react"
import { useLocation } from "wouter"
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

const CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Agadir", "Tanger", "Meknès", 
  "Oujda", "Kenitra", "Tétouan", "Safi", "Mohammedia", "Khouribga", "El Jadida", 
  "Béni Mellal", "Nador", "Taza", "Settat", "Berrechid", "Khemisset", "Inezgane", 
  "Ksar El Kébir", "Larache", "Guelmim", "Ouarzazate", "Errachidia", "Dakhla", 
  "Laâyoune", "Tiznit", "Ifrane"
]

export function OrdersPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false)
  const queryClient = useQueryClient()
  
  // Use wouter's location but parse native search params for ?new=productId
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const newProductId = params.get('new')
    if (newProductId) {
      setIsNewOrderModalOpen(true)
      // We don't remove it from URL so refresh keeps it, or we could replaceState
      // In a real app we might clean up the URL here
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
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage your sales and track deliveries.</p>
        </div>
        <Button 
          className="gap-2 shadow-[0_0_15px_rgba(229,169,60,0.2)]"
          onClick={() => setIsNewOrderModalOpen(true)}
          data-testid="btn-add-order"
        >
          <Plus className="size-4" /> Add New Order
        </Button>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto overflow-x-auto">
            <TabsList className="bg-muted">
              <TabsTrigger value="ALL">All Orders</TabsTrigger>
              <TabsTrigger value="NOUVELLE">New</TabsTrigger>
              <TabsTrigger value="CONFIRMEE">Confirmed</TabsTrigger>
              <TabsTrigger value="EN_COURS_LIVRAISON">In Transit</TabsTrigger>
              <TabsTrigger value="LIVREE">Delivered</TabsTrigger>
              <TabsTrigger value="RETOURNEE">Returned</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search customer, phone..." 
              className="pl-9"
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
            <p className="text-muted-foreground">No orders found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Order ID & Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Net Margin</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="group">
                  <TableCell>
                    <div className="font-medium text-foreground">#{order.id}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-GB')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customerFirstName} {order.customerLastName}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="size-3" /> {order.city}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={order.productImage} alt="" className="size-10 rounded-md object-cover bg-muted" />
                      <div>
                        <div className="font-medium line-clamp-1 max-w-[200px]">{order.productName}</div>
                        <div className="text-xs text-muted-foreground">{formatCurrency(order.salePriceAffiliate)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-primary tracking-tight">
                      {formatCurrency(order.netMargin)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {/* Simulated action menu for demo */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm">Details</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
  switch (status) {
    case 'NOUVELLE': return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">New</Badge>
    case 'CONFIRMEE': return <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20">Confirmed</Badge>
    case 'EN_COURS_LIVRAISON': return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">In Transit</Badge>
    case 'LIVREE': return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Delivered</Badge>
    case 'RETOURNEE': return <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">Returned</Badge>
    case 'ANNULEE': return <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>
    default: return <Badge variant="outline">{status}</Badge>
  }
}

function NewOrderDialog({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onSuccess: () => void }) {
  const { data: products } = useListProducts()
  const createOrder = useCreateOrder()
  
  // Default values
  const [productId, setProductId] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState(CITIES[0])
  const [address, setAddress] = useState("")
  const [salePrice, setSalePrice] = useState("")
  const [note, setNote] = useState("")

  // Check URL for ?new=productId
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
        city: city,
        fullAddress: address,
        salePriceAffiliate: parseInt(salePrice),
        deliveryNote: note
      }
    }, {
      onSuccess
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Enter customer details. We'll handle the confirmation and delivery.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Package className="size-4 text-muted-foreground" /> Product
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
                <option value="" disabled>Select a product...</option>
                {products?.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.wholesalePrice)} WP</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                  <User className="size-4 text-muted-foreground" /> First Name
                </label>
                <Input required placeholder="Ahmed" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Last Name</label>
                <Input required placeholder="Mansouri" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                  Phone Number
                </label>
                <Input required placeholder="06 XX XX XX XX" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                  <MapPin className="size-4 text-muted-foreground" /> City
                </label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  required
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Address</label>
              <Input required placeholder="123 Street Name, Neighborhood" value={address} onChange={e => setAddress(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Banknote className="size-4 text-muted-foreground" /> Selling Price (DZD)
              </label>
              <Input required type="number" min={selectedProduct?.wholesalePrice || 0} placeholder="Price charged to customer" value={salePrice} onChange={e => setSalePrice(e.target.value)} />
              {selectedProduct && salePrice && (
                <p className="text-xs text-muted-foreground">
                  Est. Margin: <span className="text-primary font-bold">{formatCurrency(parseInt(salePrice) - selectedProduct.wholesalePrice - selectedProduct.deliveryCost)}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <FileText className="size-4 text-muted-foreground" /> Delivery Note (Optional)
              </label>
              <Input placeholder="Call before delivery..." value={note} onChange={e => setNote(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createOrder.isPending} className="gap-2">
              {createOrder.isPending && <Loader2 className="size-4 animate-spin" />}
              Submit Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
