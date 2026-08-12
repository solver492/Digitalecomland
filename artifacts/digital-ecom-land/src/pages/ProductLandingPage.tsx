import { useState } from "react"
import { useParams, useLocation } from "wouter"
import { useTranslation } from "react-i18next"
import { useGetProduct } from "@workspace/api-client-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import {
  ArrowLeft, Package, CheckCircle2, Truck, Star,
  ChevronLeft, ChevronRight, Plus, Loader2,
  ShieldCheck, Zap, FlaskConical, Ruler
} from "lucide-react"

export function ProductLandingPage() {
  const { id } = useParams<{ id: string }>()
  const [, setLocation] = useLocation()
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === "ar"

  const { data: product, isLoading, isError } = useGetProduct(Number(id))
  const [activeImg, setActiveImg] = useState(0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Package className="size-16 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">{t("productDetail.notFound")}</p>
        <Button variant="outline" onClick={() => setLocation("/dashboard/products")}>
          {t("productDetail.backToCatalog")}
        </Button>
      </div>
    )
  }

  const images: string[] = (product as any).detail?.images ?? [product.imageUrl]
  const benefits: string[] = (product as any).detail?.benefits ?? []
  const ingredients: string[] | undefined = (product as any).detail?.ingredients
  const specs: { label: string; value: string }[] | undefined = (product as any).detail?.specs
  const longDescription: string = (product as any).detail?.longDescription ?? product.description
  const badge: string | undefined = (product as any).detail?.badge

  const prevImg = () => setActiveImg(i => (i - 1 + images.length) % images.length)
  const nextImg = () => setActiveImg(i => (i + 1) % images.length)

  return (
    <div
      className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ── Back button ── */}
      <button
        onClick={() => setLocation("/dashboard/products")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        {isRtl
          ? <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          : <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
        }
        {t("productDetail.backToCatalog")}
      </button>

      {/* ── Main grid: Gallery + Info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

        {/* ── Image Gallery ── */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden border border-border group">
            <img
              key={activeImg}
              src={images[activeImg]}
              alt={product.name}
              className="w-full h-full object-cover animate-in fade-in duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/600x600?text=No+Image"
              }}
            />
            {/* Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 size-9 rounded-full bg-background/80 border border-border flex items-center justify-center text-foreground hover:bg-background transition-all opacity-0 group-hover:opacity-100",
                    isRtl ? "right-3" : "left-3"
                  )}
                >
                  {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
                </button>
                <button
                  onClick={nextImg}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 size-9 rounded-full bg-background/80 border border-border flex items-center justify-center text-foreground hover:bg-background transition-all opacity-0 group-hover:opacity-100",
                    isRtl ? "left-3" : "right-3"
                  )}
                >
                  {isRtl ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
                </button>
              </>
            )}
            {/* Out of stock overlay */}
            {!product.inStock && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <Badge variant="destructive" className="text-sm px-4 py-1.5">
                  {t("catalog.outOfStock")}
                </Badge>
              </div>
            )}
            {/* Badge */}
            {badge && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-primary text-primary-foreground font-semibold text-xs px-2.5 py-1">
                  {badge}
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "shrink-0 size-16 sm:size-20 rounded-lg overflow-hidden border-2 transition-all",
                    i === activeImg
                      ? "border-primary shadow-[0_0_10px_rgba(229,169,60,0.4)]"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="space-y-6">
          {/* Category + Name */}
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs capitalize">
              {product.category}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              {product.name}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              {longDescription}
            </p>
          </div>

          {/* Pricing box */}
          <div className="rounded-xl border border-primary/30 bg-card p-5 space-y-3 shadow-[0_0_20px_rgba(229,169,60,0.08)]">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{t("catalog.wholesalePrice")}</span>
              <span className="font-semibold">{formatCurrency(product.wholesalePrice)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{t("catalog.suggestedPrice")}</span>
              <span className="font-semibold">{formatCurrency(product.suggestedPrice)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Truck className="size-3.5" />
                {t("productDetail.deliveryCost")}
              </span>
              <span className="font-semibold">{formatCurrency(product.deliveryCost)}</span>
            </div>
            <div className="h-px bg-primary/20" />
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm">{t("catalog.yourMargin")}</span>
              <span className="text-2xl font-black text-primary tracking-tight">
                {formatCurrency(product.affiliateMargin)}
              </span>
            </div>
          </div>

          {/* CTA */}
          <Button
            size="lg"
            className="w-full h-14 text-base font-bold gap-2 shadow-[0_0_25px_rgba(229,169,60,0.3)]"
            disabled={!product.inStock}
            onClick={() => setLocation(`/dashboard/orders?new=${product.id}`)}
          >
            <Plus className="size-5" />
            {product.inStock ? t("catalog.createOrder") : t("catalog.outOfStock")}
          </Button>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              { icon: ShieldCheck, label: t("productDetail.trust.quality") },
              { icon: Truck, label: t("productDetail.trust.delivery") },
              { icon: Zap, label: t("productDetail.trust.margin") },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted/50 border border-border text-center">
                <Icon className="size-5 text-primary" />
                <span className="text-xs text-muted-foreground leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Benefits ── */}
      {benefits.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="size-5 text-primary fill-primary" />
            <h2 className="text-xl font-bold">{t("productDetail.benefits")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors"
              >
                <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">{b}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Specs + Ingredients in a grid ── */}
      <div className={cn(
        "grid gap-8",
        specs && ingredients ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
      )}>
        {/* Technical specs */}
        {specs && specs.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Ruler className="size-5 text-primary" />
              <h2 className="text-xl font-bold">{t("productDetail.specs")}</h2>
            </div>
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              {specs.map((s, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex justify-between items-center px-5 py-3 text-sm gap-4",
                    i % 2 === 0 ? "bg-muted/30" : "bg-transparent",
                    i !== specs.length - 1 && "border-b border-border/50"
                  )}
                >
                  <span className="text-muted-foreground font-medium shrink-0">{s.label}</span>
                  <span className="font-semibold text-right">{s.value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ingredients / components */}
        {ingredients && ingredients.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="size-5 text-primary" />
              <h2 className="text-xl font-bold">{t("productDetail.ingredients")}</h2>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 space-y-2">
              {ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
                >
                  <div className="size-2 rounded-full bg-primary shrink-0" />
                  <span className="text-sm">{ing}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
