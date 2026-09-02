import Link from "next/link";
import {
  ArrowRight,
  Award,
  Feather,
  Gauge,
  Shield,
  Star,
  Target,
  Truck,
  Zap,
} from "lucide-react";
import { FadeIn } from "@/components/store/fade-in";
import { HeroVisual } from "@/components/store/hero-visual";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { getFeaturedProducts } from "@/lib/data";

const trustItems = [
  { icon: Award, label: "Tournament Grade" },
  { icon: Feather, label: "Goose Feather" },
  { icon: Target, label: "Consistent Flight" },
  { icon: Truck, label: "Fast Irish Delivery" },
];

const performanceItems = [
  {
    title: "Stable Flight",
    desc: "Precision-weighted cork bases and calibrated feather selection for predictable trajectory in every hall.",
    metric: "±2%",
    metricLabel: "flight variance",
  },
  {
    title: "Exceptional Durability",
    desc: "Engineered for extended rally play — fewer mid-session replacements during training and league fixtures.",
    metric: "12+",
    metricLabel: "games per tube",
  },
  {
    title: "Tournament Consistency",
    desc: "Batch-tested for speed rating accuracy across 76, 77 and 78 — matched to Irish indoor conditions.",
    metric: "100%",
    metricLabel: "speed tested",
  },
  {
    title: "Selected Goose Feathers",
    desc: "Hand-selected premium goose feathers with natural curvature optimised for aerodynamic stability.",
    metric: "A+",
    metricLabel: "feather grade",
  },
];

const testimonials = [
  {
    quote:
      "We've switched our entire club to Aero Feather Pro 77. The flight consistency in our Dublin hall is noticeably better — our players trust every tube.",
    author: "Marcus O'Brien",
    role: "Head Coach, Leinster BC",
    rating: 5,
  },
  {
    quote:
      "Finally a shuttlecock brand that understands Irish playing conditions. Speed 77 is perfect for our venue temperature.",
    author: "Sarah Lynch",
    role: "Competitive Player, Cork",
    rating: 5,
  },
  {
    quote:
      "Bulk ordering for our league was seamless. Quality is tournament-grade and delivery across Ireland was next-day.",
    author: "David Murphy",
    role: "Club Secretary, Galway BC",
    rating: 5,
  },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts(3);

  return (
    <>
      {/* Hero */}
      <section className="af-radial-hero af-grid-bg relative flex min-h-[85vh] items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-af-bg" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-28">
          <div className="max-w-xl">
            <FadeIn>
              <p className="mb-6 inline-flex items-center gap-2 border border-af-cyan/25 bg-af-surface/50 px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-af-cyan uppercase backdrop-blur-sm">
                Engineered for Irish Badminton
              </p>
            </FadeIn>

            <FadeIn delay={80}>
              <h1 className="text-[clamp(2.5rem,6vw,4.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-af-text">
                ENGINEERED
                <br />
                FOR{" "}
                <span className="af-gradient-text">FLIGHT.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={160}>
              <p className="mt-6 max-w-md text-base leading-relaxed text-af-muted sm:text-lg">
                Tournament-grade goose feather shuttlecocks engineered for consistent
                flight, durability and performance — developed for clubs and competitive
                players across Ireland.
              </p>
            </FadeIn>

            <FadeIn delay={240}>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button variant="primary" size="lg" asChild>
                  <Link href="/shop">
                    Shop Shuttlecocks
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="lg" asChild>
                  <Link href="/#about">Discover Aero Feather</Link>
                </Button>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={120} className="relative">
            <HeroVisual />
          </FadeIn>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-af-cyan/10 bg-af-bg-secondary/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-4 px-4 py-5 sm:px-6 lg:justify-between">
          {trustItems.map(({ icon: Icon, label }, i) => (
            <div key={label} className="flex items-center gap-2.5">
              {i > 0 && (
                <span className="mr-4 hidden h-1 w-1 rounded-full bg-af-cyan/30 lg:inline" />
              )}
              <Icon className="h-4 w-4 text-af-cyan" strokeWidth={1.5} />
              <span className="text-[12px] font-medium tracking-wide text-af-muted">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn>
            <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-3 text-[11px] font-semibold tracking-[0.22em] text-af-cyan uppercase">
                  Catalogue
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-af-text sm:text-4xl">
                  Built for serious play.
                </h2>
                <p className="mt-3 max-w-lg text-af-muted">
                  Tournament, club and practice ranges — each speed-rated for Irish indoor conditions.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/shop">
                  View all products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product, i) => (
              <FadeIn key={product.id} delay={i * 80}>
                <ProductCard product={product} featured />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Performance */}
      <section className="relative border-y border-af-cyan/10 bg-af-bg-secondary py-24 lg:py-32">
        <div className="absolute inset-0 af-grid-bg opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn>
            <div className="mb-16 max-w-2xl">
              <p className="mb-3 text-[11px] font-semibold tracking-[0.22em] text-af-cyan uppercase">
                Engineering
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-af-text sm:text-4xl">
                Performance you can feel.
              </h2>
            </div>
          </FadeIn>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {performanceItems.map((item, i) => (
              <FadeIn key={item.title} delay={i * 70}>
                <div className="group relative h-full border border-af-cyan/10 bg-af-surface p-6 transition-colors hover:border-af-cyan/25">
                  <div className="mb-6 flex items-baseline justify-between">
                    <span className="text-3xl font-bold tracking-tight af-gradient-text">
                      {item.metric}
                    </span>
                    <span className="text-[10px] tracking-widest text-af-muted uppercase">
                      {item.metricLabel}
                    </span>
                  </div>
                  <div className="mb-4 h-px w-full bg-gradient-to-r from-af-cyan/40 to-transparent" />
                  <h3 className="mb-2 text-base font-bold text-af-text">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-af-muted">{item.desc}</p>
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-af-cyan transition-all duration-500 group-hover:w-full" />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Brand story */}
      <section id="about" className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-af-surface-elevated/40 via-af-bg to-af-bg-secondary" />
        <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/3 rounded-full bg-af-cyan/5 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2">
          <FadeIn>
            <p className="mb-4 text-[11px] font-semibold tracking-[0.22em] text-af-cyan uppercase">
              Our story
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-af-text sm:text-[2.75rem] sm:leading-tight">
              Designed for Ireland.
              <br />
              <span className="text-af-muted">Built for the court.</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-af-muted">
              Aero Feather supplies quality shuttlecocks to Irish players, coaches and
              badminton clubs. From Dublin league nights to regional championships, every
              tube is selected and tested in real Irish playing conditions — because flight
              consistency shouldn&apos;t be a variable you worry about.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Goose & duck feather options for every level",
                "Cork bases calibrated for stable trajectory",
                "Speed ratings matched to hall temperature",
                "Secure checkout with Stripe",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-af-muted">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-af-cyan/10 text-af-cyan">
                    <Zap className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={120}>
            <div className="relative aspect-[4/5] overflow-hidden border border-af-cyan/15 bg-af-surface">
              <div className="absolute inset-0 af-grid-bg opacity-30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-10">
                <div className="mb-8 text-center">
                  <p className="text-6xl font-extrabold tracking-tighter af-gradient-text">AF</p>
                  <p className="mt-2 text-[11px] tracking-[0.3em] text-af-muted uppercase">
                    Precision Engineering
                  </p>
                </div>
                <div className="grid w-full grid-cols-2 gap-4">
                  {[
                    { icon: Gauge, label: "Speed Tested" },
                    { icon: Shield, label: "Quality Assured" },
                    { icon: Feather, label: "Feather Selected" },
                    { icon: Target, label: "Flight Calibrated" },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-2 border border-af-cyan/10 bg-af-bg/50 p-4"
                    >
                      <Icon className="h-5 w-5 text-af-cyan" strokeWidth={1.5} />
                      <span className="text-[11px] tracking-wide text-af-muted">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Clubs B2B */}
      <section id="clubs" className="py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn>
            <div className="relative overflow-hidden border border-af-cyan/20 bg-gradient-to-br from-af-surface-elevated via-af-surface to-af-bg-secondary p-10 sm:p-14 lg:p-16">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-af-cyan/10 blur-[80px]" />
              <div className="relative max-w-2xl">
                <p className="mb-3 text-[11px] font-semibold tracking-[0.22em] text-af-cyan uppercase">
                  B2B &amp; Clubs
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-af-text sm:text-4xl">
                  Built for clubs.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-af-muted">
                  Running training sessions, leagues or tournaments? Talk to Aero Feather
                  about club and bulk pricing — tailored packages for academies, schools
                  and competitive clubs across Ireland.
                </p>
                <Button variant="primary" size="lg" className="mt-8" asChild>
                  <a href="mailto:hello@aerofeather.ie?subject=Club%20Enquiry">
                    Club Enquiries
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-af-cyan/10 bg-af-bg-secondary py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn>
            <div className="mb-14 text-center">
              <p className="mb-3 text-[11px] font-semibold tracking-[0.22em] text-af-cyan uppercase">
                Social proof
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-af-text sm:text-4xl">
                Trusted on court.
              </h2>
            </div>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <FadeIn key={t.author} delay={i * 80}>
                <blockquote className="flex h-full flex-col border border-af-cyan/10 bg-af-surface p-8">
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-af-cyan text-af-cyan" />
                    ))}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-af-muted">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-6 border-t border-af-cyan/10 pt-6">
                    <p className="text-sm font-semibold text-af-text">{t.author}</p>
                    <p className="text-xs text-af-muted">{t.role}</p>
                  </footer>
                </blockquote>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping note */}
      <section id="shipping" className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <FadeIn>
            <h2 className="text-xl font-bold tracking-tight text-af-text">
              Shipping across Ireland &amp; EU
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-af-muted">
              Free standard delivery on orders over €75. Express options at checkout.
              EU shipping to GB, France, Germany, Netherlands and Belgium.
            </p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
