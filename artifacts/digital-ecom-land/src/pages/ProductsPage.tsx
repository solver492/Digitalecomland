import { useState, useRef, useEffect } from "react"
import { useLocation } from "wouter"
import { useTranslation } from "react-i18next"
import { useListProducts } from "@workspace/api-client-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { formatCurrency } from "@/lib/utils"
import { Search, Download, Plus, Loader2, Star, ChevronDown, LayoutGrid } from "lucide-react"

// Category keys matching translation keys
const CATEGORY_KEYS = [
  "health",
  "sports",
  "beach",
  "auto",
  "kids",
  "men",
  "women",
  "beauty",
  "electronics",
  "home",
  "kitchen",
  "fashion",
  "bags",
  "jewelry",
  "pets",
  "toys",
  "office",
  "travel",
  "food",
  "perfumes",
] as const

// Category icons (emoji for quick visual scan)
const CATEGORY_ICONS: Record<string, string> = {
  health: "💊",
  sports: "⚽",
  beach: "🏖️",
  auto: "🚗",
  kids: "🍼",
  men: "👔",
  women: "👗",
  beauty: "💄",
  electronics: "📱",
  home: "🏠",
  kitchen: "🍳",
  fashion: "👕",
  bags: "👜",
  jewelry: "💍",
  pets: "🐾",
  toys: "🧸",
  office: "📚",
  travel: "✈️",
  food: "🍎",
  perfumes: "🧴",
}

// Placeholder featured products when DB is empty
const PLACEHOLDER_FEATURED = [
  {
    id: "f1",
    name: "Ceinture Chauffante Abdominale",
    description: "Produit tendance — fort taux de conversion. Idéal pour les campagnes minceur.",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    category: "health",
    wholesalePrice: 1200,
    suggestedPrice: 2800,
    affiliateMargin: 1600,
    inStock: true,
  },
  {
    id: "f2",
    name: "Support Téléphone Voiture Magnétique",
    description: "Bestseller toute l'année. Livraison rapide, retours très faibles.",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    category: "auto",
    wholesalePrice: 450,
    suggestedPrice: 1200,
    affiliateMargin: 750,
    inStock: true,
  },
  {
    id: "f3",
    name: "Tapis de Yoga Antidérapant Premium",
    description: "Très demandé après le Ramadan. Marge élevée, cible large.",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
    category: "sports",
    wholesalePrice: 900,
    suggestedPrice: 2200,
    affiliateMargin: 1300,
    inStock: true,
  },
  {
    id: "f4",
    name: "Brosse Lissante Ionique",
    description: "Explosion sur TikTok. Retour client excellent, visuels prêts à l'emploi.",
    imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80",
    category: "beauty",
    wholesalePrice: 1100,
    suggestedPrice: 2600,
    affiliateMargin: 1500,
    inStock: true,
  },
  {
    id: "f5",
    name: "Montre Connectée Sport",
    description: "Forte demande homme/femme. Idéal avec des créatifs lifestyle.",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    category: "electronics",
    wholesalePrice: 2000,
    suggestedPrice: 4500,
    affiliateMargin: 2500,
    inStock: true,
  },
  {
    id: "f6",
    name: "Ensemble Pyjama Bébé Coton",
    description: "Niche bébé très rentable. Achats impulsifs, faible retour.",
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80",
    category: "kids",
    wholesalePrice: 700,
    suggestedPrice: 1800,
    affiliateMargin: 1100,
    inStock: true,
  },
]

export function ProductsPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [, setLocation] = useLocation()
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setDebouncedSearch(e.target.value), 400)
  }

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [])

  const { data: products, isLoading } = useListProducts({ search: debouncedSearch })

  // Filter by category (client-side; category field maps to translation keys)
  const filteredProducts = products?.filter((p) => {
    if (selectedCategory === "all") return true
    return p.category?.toLowerCase() === selectedCategory.toLowerCase()
  })

  // Featured = first 6 products from API, or placeholder if empty
  const featuredProducts = (products && products.length > 0)
    ? products.slice(0, 6)
    : PLACEHOLDER_FEATURED as any[]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("catalog.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("catalog.subtitle")}</p>
        </div>
      </div>

      {/* ── Featured Carousel ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Star className="size-5 text-primary fill-primary" />
          <div>
            <h2 className="text-lg font-semibold leading-none">{t("catalog.featured")}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{t("catalog.featuredDesc")}</p>
          </div>
        </div>

        <Carousel
          opts={{ align: "start", direction: isRTL ? "rtl" : "ltr", loop: true }}
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {featuredProducts.map((product) => (
              <CarouselItem key={product.id} className="pl-3 basis-[85%] sm:basis-1/2 lg:basis-1/3">
                <Card className="overflow-hidden flex flex-col hover:border-primary/60 transition-colors group relative border-primary/20 bg-card">
                  {/* Star badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="gap-1 bg-primary text-primary-foreground text-xs">
                      <Star className="size-3 fill-current" />
                      Vedette
                    </Badge>
                  </div>
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400x300?text=No+Image"
                      }}
                    />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
                        <Badge variant="destructive">{t("catalog.outOfStock")}</Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-base truncate">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1 text-xs h-8">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-3">
                    <div className="space-y-1.5 p-3 bg-muted/50 rounded-lg border border-border/50">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{t("catalog.wholesalePrice")}</span>
                        <span className="font-medium">{formatCurrency(product.wholesalePrice)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{t("catalog.suggestedPrice")}</span>
                        <span className="font-medium">{formatCurrency(product.suggestedPrice)}</span>
                      </div>
                      <div className="w-full h-px bg-border/50" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-muted-foreground">{t("catalog.yourMargin")}</span>
                        <span className="text-base font-bold text-primary">
                          {formatCurrency(product.affiliateMargin)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 gap-2">
                    <Button variant="outline" size="icon" className="shrink-0" title={t("catalog.downloadCreatives")}>
                      <Download className="size-4" />
                    </Button>
                    <Button
                      className="flex-1 gap-2 text-sm shadow-[0_0_15px_rgba(229,169,60,0.15)]"
                      disabled={!product.inStock}
                      onClick={() => setLocation(`/dashboard/orders?new=${product.id}`)}
                    >
                      <Plus className="size-4" />
                      {t("catalog.createOrder")}
                    </Button>
                  </CardFooter>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className={isRTL ? "right-2 left-auto" : "left-2"} />
          <CarouselNext className={isRTL ? "left-2 right-auto" : "right-2"} />
        </Carousel>
      </div>

      {/* ── Divider ── */}
      <div className="flex items-center gap-3">
        <LayoutGrid className="size-5 text-primary shrink-0" />
        <h2 className="text-lg font-semibold">{t("catalog.title")}</h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* ── Filters row ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 size-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
          <Input
            placeholder={t("catalog.searchPlaceholder")}
            className={isRTL ? "pr-9 text-right" : "pl-9"}
            value={search}
            onChange={handleSearch}
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>

        {/* Category dropdown */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory} dir={isRTL ? "rtl" : "ltr"}>
          <SelectTrigger className="w-full sm:w-64 gap-2">
            <ChevronDown className="size-4 text-muted-foreground" />
            <SelectValue placeholder={t("catalog.allCategories")} />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                🗂️ {t("catalog.allCategories")}
              </span>
            </SelectItem>
            {CATEGORY_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                <span className="flex items-center gap-2">
                  {CATEGORY_ICONS[key]} {t(`catalog.categories.${key}`)}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Product Grid ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : !filteredProducts || filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">{t("catalog.noResults")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors group"
            >
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/400x300?text=No+Image"
                  }}
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
                    <Badge variant="destructive">{t("catalog.outOfStock")}</Badge>
                  </div>
                )}
                <Badge className="absolute top-3 right-3 bg-background/90 text-foreground backdrop-blur border-border hover:bg-background/90 text-xs">
                  {product.category}
                </Badge>
              </div>

              <CardHeader className="p-5 pb-0">
                <CardTitle className="text-lg truncate">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2 mt-2 h-10 text-sm">
                  {product.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 flex-1 flex flex-col justify-end">
                <div className="mt-4 space-y-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("catalog.wholesalePrice")}</span>
                    <span className="font-semibold">{formatCurrency(product.wholesalePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("catalog.suggestedPrice")}</span>
                    <span className="font-semibold">{formatCurrency(product.suggestedPrice)}</span>
                  </div>
                  <div className="w-full h-px bg-border/50 my-1" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-muted-foreground">{t("catalog.yourMargin")}</span>
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
                  title={t("catalog.downloadCreatives")}
                >
                  <Download className="size-4" />
                </Button>
                <Button
                  className="flex-1 gap-2 shadow-[0_0_15px_rgba(229,169,60,0.15)]"
                  disabled={!product.inStock}
                  onClick={() => setLocation(`/dashboard/orders?new=${product.id}`)}
                >
                  <Plus className="size-4" />
                  {t("catalog.createOrder")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
