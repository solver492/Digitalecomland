import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, TrendingUp, Package, Truck, Wallet, PlayCircle, Phone } from "lucide-react"

export function LandingPage() {
  const steps = [
    { icon: Package, title: "1. Browse Catalog", desc: "Access winning products at factory prices." },
    { icon: TrendingUp, title: "2. Market the Product", desc: "Use our creatives to run your ads." },
    { icon: CheckCircle2, title: "3. Make Sales", desc: "Submit your customer orders directly." },
    { icon: Truck, title: "4. We Deliver", desc: "Our team handles confirmation and fast shipping." },
    { icon: Wallet, title: "5. Get Paid", desc: "Collect your margin instantly after delivery." }
  ]

  const faqs = [
    { q: "Do I need to buy inventory?", a: "No. You only sell. We hold the stock and handle fulfillment. Zero risk." },
    { q: "How fast do I get my money?", a: "Margins are added to your withdrawable balance the moment the order is marked LIVREE. Withdrawals process in 24h." },
    { q: "What countries do you support?", a: "Currently focused on Morocco and expanding across Africa." }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="h-20 border-b border-border flex items-center px-8 sm:px-12 shrink-0 z-10 sticky top-0 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-black text-xl">
            D
          </div>
          <span className="font-bold text-2xl tracking-tighter">Ecom Land</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            Login
          </Link>
          <Button asChild className="font-semibold px-6 shadow-[0_0_20px_rgba(229,169,60,0.3)]">
            <Link href="/dashboard">Start Earning</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative py-24 sm:py-32 px-6 flex flex-col items-center justify-center text-center border-b border-border overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(229,169,60,0.15),transparent_50%)] pointer-events-none" />
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter max-w-4xl leading-[1.1] z-10">
            The Private <span className="text-primary">Trading Club</span> for Premium Affiliates.
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl z-10">
            Launch your zero-stock dropshipping business today. We provide the winning products, handle the fulfillment, and pay your margins directly.
          </p>
          <div className="mt-10 flex items-center gap-4 z-10">
            <Button asChild size="lg" className="h-14 px-8 text-lg font-bold shadow-[0_0_30px_rgba(229,169,60,0.4)]">
              <Link href="/dashboard">Access Dashboard <ArrowRight className="ml-2 size-5" /></Link>
            </Button>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-6 sm:px-12 bg-muted/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">The Ecom Land System</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className="size-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 group-hover:border-primary group-hover:scale-110 transition-all duration-300 shadow-xl">
                    <step.icon className="size-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-6 sm:px-12 border-t border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="flex flex-col gap-4">
              {faqs.map((faq, i) => (
                <details key={i} className="group border border-border rounded-lg bg-card overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold text-lg hover:text-primary transition-colors">
                    {faq.q}
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-muted-foreground border-t border-border/50 pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-border text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Digital Ecom Land. All rights reserved.
      </footer>
    </div>
  )
}
