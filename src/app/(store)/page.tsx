import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Feather, Shield, Truck } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { getFeaturedProducts } from "@/lib/data";

export default async function HomePage() {
  const featured = await getFeaturedProducts(3);

  return (
    <>
      <section className="swoosh-bg relative overflow-hidden border-b border-slate-200">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan/10 px-4 py-1 text-sm font-semibold text-navy">
              <Feather className="h-4 w-4 text-cyan" />
              Made for Irish badminton
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-navy sm:text-5xl lg:text-6xl">
              Flight-perfect shuttlecocks,{" "}
              <span className="text-cyan">engineered in Ireland</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Aero Feather delivers tournament-grade goose feather shuttlecocks trusted
              by clubs, coaches, and competitive players across Ireland. Consistent speed,
              exceptional durability, delivered to your door.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="cyan" size="lg" asChild>
                <Link href="/shop">
                  Shop shuttlecocks
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/#about">Our story</Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto flex max-w-md items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-cyan/20 blur-3xl" />
            <Image
              src="/logo.png"
              alt="Aero Feather logo"
              width={420}
              height={420}
              className="relative drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Shield,
              title: "Tournament quality",
              text: "Precision-engineered for consistent flight in halls across Ireland.",
            },
            {
              icon: Truck,
              title: "Fast Irish delivery",
              text: "Order today — dispatched within 24 hours to addresses nationwide.",
            },
            {
              icon: Feather,
              title: "Speed for every venue",
              text: "76, 77, and 78 speed ratings matched to your hall temperature.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-navy text-cyan">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-navy">Featured products</h2>
              <p className="mt-2 text-slate-600">Our most popular shuttlecocks this season</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/shop">View all</Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-navy">Built for players who demand more</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Aero Feather was founded in Ireland with a simple mission: give every club
              and competitor access to shuttlecocks that fly true, session after session.
              From Dublin league nights to regional championships, our products are
              selected and tested in real Irish playing conditions.
            </p>
          </div>
          <div className="rounded-3xl bg-navy p-8 text-white">
            <p className="text-sm uppercase tracking-widest text-cyan">Why Aero Feather?</p>
            <ul className="mt-6 space-y-4 text-sm leading-relaxed text-slate-200">
              <li>✓ Goose &amp; duck feather options for every level</li>
              <li>✓ Cork bases calibrated for stable trajectory</li>
              <li>✓ Bulk pricing for clubs and academies</li>
              <li>✓ Secure checkout with Stripe</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="shipping" className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-navy">Shipping across Ireland</h2>
          <p className="mt-4 text-slate-600">
            Free standard delivery on orders over €75. Express options available at
            checkout. EU shipping available to GB, France, Germany, Netherlands, and Belgium.
          </p>
        </div>
      </section>
    </>
  );
}
