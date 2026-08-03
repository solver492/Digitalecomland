import { Link } from "wouter"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, TrendingUp, Package, Truck, Wallet, Globe } from "lucide-react"
import * as React from "react"

const LANGUAGES = [
  { code: "ar", label: "العربية", flag: "🇩🇿" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🌐" },
]

export function LandingPage() {
  const { t, i18n } = useTranslation()
  const [langOpen, setLangOpen] = React.useState(false)
  const isRtl = i18n.language === "ar"

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0]

  React.useEffect(() => {
    if (!langOpen) return
    const handler = () => setLangOpen(false)
    document.addEventListener("click", handler)
    return () => document.removeEventListener("click", handler)
  }, [langOpen])

  const stepIcons = [Package, TrendingUp, CheckCircle2, Truck, Wallet]
  const steps = [
    t("landing.steps.browse", { returnObjects: true }) as { title: string; desc: string },
    t("landing.steps.market", { returnObjects: true }) as { title: string; desc: string },
    t("landing.steps.sell", { returnObjects: true }) as { title: string; desc: string },
    t("landing.steps.deliver", { returnObjects: true }) as { title: string; desc: string },
    t("landing.steps.paid", { returnObjects: true }) as { title: string; desc: string },
  ]

  const faqs = t("landing.faqs", { returnObjects: true }) as { q: string; a: string }[]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 sm:h-20 border-b border-border flex items-center px-4 sm:px-8 shrink-0 z-10 sticky top-0 bg-background/80 backdrop-blur-md gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="size-8 sm:size-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-black text-lg sm:text-xl">
            D
          </div>
          <span className="font-bold text-xl sm:text-2xl tracking-tighter">Ecom Land</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language switcher */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border"
            >
              <Globe className="size-4" />
              <span className="hidden sm:inline">{currentLang.flag} {currentLang.label}</span>
              <span className="sm:hidden">{currentLang.flag}</span>
            </button>
            {langOpen && (
              <div className={`absolute top-full mt-1 bg-popover border border-border rounded-lg shadow-lg py-1 z-50 min-w-[140px] ${isRtl ? 'left-0' : 'right-0'}`}>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false) }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors ${i18n.language === lang.code ? 'text-primary font-semibold' : 'text-foreground'}`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors hidden sm:inline">
            {t("landing.login")}
          </Link>
          <Button asChild className="font-semibold px-4 sm:px-6 text-sm sm:text-base shadow-[0_0_20px_rgba(229,169,60,0.3)]">
            <Link href="/dashboard">{t("landing.startEarning")}</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 flex flex-col items-center justify-center text-center border-b border-border overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(229,169,60,0.15),transparent_50%)] pointer-events-none" />
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter max-w-4xl leading-tight z-10">
            {t("landing.heroTitle")} <span className="text-primary">{t("landing.heroTitleHighlight")}</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-muted-foreground max-w-2xl z-10 px-2">
            {t("landing.heroSubtitle")}
          </p>
          <div className="mt-8 sm:mt-10 z-10">
            <Button asChild size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-bold shadow-[0_0_30px_rgba(229,169,60,0.4)]">
              <Link href="/dashboard">
                {t("landing.accessDashboard")}
                {isRtl ? <ArrowRight className="ms-2 size-5 rotate-180" /> : <ArrowRight className="ms-2 size-5" />}
              </Link>
            </Button>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 sm:py-24 px-4 sm:px-12 bg-muted/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-16">{t("landing.systemTitle")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8">
              {steps.map((step, i) => {
                const Icon = stepIcons[i]
                return (
                  <div key={i} className="flex flex-col items-center text-center group">
                    <div className="size-14 sm:size-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-4 sm:mb-6 group-hover:border-primary group-hover:scale-110 transition-all duration-300 shadow-xl">
                      <Icon className="size-7 sm:size-8 text-primary" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-24 px-4 sm:px-12 border-t border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">{t("landing.faqTitle")}</h2>
            <div className="flex flex-col gap-3 sm:gap-4">
              {faqs.map((faq, i) => (
                <details key={i} className="group border border-border rounded-lg bg-card overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between p-4 sm:p-6 font-semibold text-base sm:text-lg hover:text-primary transition-colors">
                    {faq.q}
                    <span className="transition group-open:rotate-180 shrink-0 ms-3">
                      <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                    </span>
                  </summary>
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-muted-foreground border-t border-border/50 pt-3 sm:pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 sm:py-8 border-t border-border text-center text-sm text-muted-foreground px-4">
        © {new Date().getFullYear()} Digital Ecom Land — {t("landing.footer")}
      </footer>
    </div>
  )
}
