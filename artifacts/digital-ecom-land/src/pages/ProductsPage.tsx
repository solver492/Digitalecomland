import { useState } from "react"
import { useLocation } from "wouter"
import { useListProducts } from "@workspace/api-client-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Search, Download, Plus, Loader2 } from "lucide-react"

export function ProductsPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [, setLocation] = useLocation()
  
  // Quick and dirty debounce for search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    // We would use a proper useDebounce hook here normally
    setTimeout(() => setDebouncedSearch(e.target.value), 500)
  }

  const { data: products, isLoading } = useListProducts({ search: debouncedSearch })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Catalog</h1>
          <p className="text-muted-foreground">Browse high-converting products at factory prices.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            className="pl-9"
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">No products found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <Card key={product.id} className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors group">
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
                    <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
                  </div>
                )}
                <Badge className="absolute top-3 right-3 bg-background/90 text-foreground backdrop-blur border-border hover:bg-background/90">
                  {product.category}
                </Badge>
              </div>
              
              <CardHeader className="p-5 pb-0">
                <CardTitle className="text-lg truncate">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2 mt-2 h-10">
                  {product.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-5 flex-1 flex flex-col justify-end">
                <div className="mt-4 space-y-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Wholesale Price</span>
                    <span className="font-semibold">{formatCurrency(product.wholesalePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Suggested Price</span>
                    <span className="font-semibold">{formatCurrency(product.suggestedPrice)}</span>
                  </div>
                  <div className="w-full h-px bg-border/50 my-1" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-muted-foreground">Your Margin</span>
                    <span className="text-lg font-bold text-primary tracking-tight">
                      {formatCurrency(product.affiliateMargin)}
                    </span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-5 pt-0 gap-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="shrink-0"
                  title="Download Creatives"
                  data-testid={`btn-download-${product.id}`}
                >
                  <Download className="size-4" />
                </Button>
                <Button 
                  className="flex-1 gap-2 shadow-[0_0_15px_rgba(229,169,60,0.15)]" 
                  disabled={!product.inStock}
                  onClick={() => setLocation(`/dashboard/orders?new=${product.id}`)}
                  data-testid={`btn-order-${product.id}`}
                >
                  <Plus className="size-4" /> Create Order
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
