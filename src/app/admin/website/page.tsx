import Link from "next/link";
import { Globe, Package, Star, ToggleLeft, ToggleRight, Wrench } from "lucide-react";
import {
  savePerformanceAction,
  saveTestimonialsAction,
  toggleMaintenanceAction,
} from "@/app/admin/actions";
import { getHomepageContent, getMaintenanceEnabled } from "@/lib/site-settings";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export default async function WebsiteManagerPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const [homepage, maintenance] = await Promise.all([
    getHomepageContent(),
    getMaintenanceEnabled(),
  ]);

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-af-cyan uppercase">
          Website Manager
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">Edit storefront content</h1>
        <p className="mt-1 text-slate-400">
          Update homepage engineering cards, testimonials, products, and maintenance mode.
        </p>
      </div>

      {saved && (
        <div className="rounded-xl border border-af-cyan/30 bg-af-cyan/10 px-4 py-3 text-sm text-af-cyan">
          Saved {saved} successfully.
        </div>
      )}

      <section
        id="maintenance"
        className="scroll-mt-8 rounded-2xl border border-white/10 bg-[#0d1a34] p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-af-cyan">
              <Wrench className="h-4 w-4" />
              <h2 className="text-lg font-bold text-white">Maintenance mode</h2>
            </div>
            <p className="max-w-xl text-sm text-slate-400">
              When ON, the public store shows an admin-only login screen. Customers and
              guests cannot browse or shop — only your admin account can sign in.
            </p>
          </div>
          <form action={toggleMaintenanceAction}>
            <input type="hidden" name="enabled" value={maintenance ? "false" : "true"} />
            <Button
              type="submit"
              variant={maintenance ? "outline" : "cyan"}
              className={maintenance ? "border-amber-500/40 text-amber-300" : undefined}
            >
              {maintenance ? (
                <>
                  <ToggleRight className="h-4 w-4" />
                  Turn OFF
                </>
              ) : (
                <>
                  <ToggleLeft className="h-4 w-4" />
                  Turn ON
                </>
              )}
            </Button>
          </form>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-300">
          Status:{" "}
          <span className={maintenance ? "text-amber-300" : "text-emerald-400"}>
            {maintenance ? "ON — store locked" : "OFF — store open"}
          </span>
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/products"
          className="rounded-2xl border border-white/10 bg-[#0d1a34] p-5 transition hover:border-af-cyan/40"
        >
          <Package className="mb-3 h-5 w-5 text-af-cyan" />
          <p className="font-semibold text-white">Products</p>
          <p className="mt-1 text-sm text-slate-400">Add, edit, and hide catalogue items</p>
        </Link>
        <div className="rounded-2xl border border-white/10 bg-[#0d1a34] p-5">
          <Globe className="mb-3 h-5 w-5 text-af-cyan" />
          <p className="font-semibold text-white">Homepage sections</p>
          <p className="mt-1 text-sm text-slate-400">Edit the cards below — changes go live immediately</p>
        </div>
      </div>

      {/* Performance / Engineering */}
      <section className="rounded-2xl border border-white/10 bg-[#0d1a34] p-6">
        <h2 className="mb-1 text-lg font-bold text-white">Engineering / Performance</h2>
        <p className="mb-6 text-sm text-slate-400">
          The four metric cards under “Performance you can feel.”
        </p>
        <form action={savePerformanceAction} className="space-y-6">
          <input type="hidden" name="count" value={homepage.performance.items.length} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="perf-eyebrow">Section label</Label>
              <Input
                id="perf-eyebrow"
                name="eyebrow"
                defaultValue={homepage.performance.eyebrow}
                className="border-white/10 bg-[#060b18] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="perf-title">Headline</Label>
              <Input
                id="perf-title"
                name="title"
                defaultValue={homepage.performance.title}
                className="border-white/10 bg-[#060b18] text-white"
              />
            </div>
          </div>

          {homepage.performance.items.map((item, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-white/5 bg-[#060b18] p-4"
            >
              <p className="text-xs font-semibold tracking-widest text-af-cyan uppercase">
                Card {i + 1}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Metric</Label>
                  <Input
                    name={`metric_${i}`}
                    defaultValue={item.metric}
                    className="border-white/10 bg-[#0d1a34] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Metric label</Label>
                  <Input
                    name={`metricLabel_${i}`}
                    defaultValue={item.metricLabel}
                    className="border-white/10 bg-[#0d1a34] text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  name={`title_${i}`}
                  defaultValue={item.title}
                  className="border-white/10 bg-[#0d1a34] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  name={`desc_${i}`}
                  defaultValue={item.desc}
                  rows={3}
                  className="border-white/10 bg-[#0d1a34] text-white"
                />
              </div>
            </div>
          ))}

          <Button type="submit" variant="cyan">
            Save performance section
          </Button>
        </form>
      </section>

      {/* Testimonials */}
      <section className="rounded-2xl border border-white/10 bg-[#0d1a34] p-6">
        <div className="mb-6 flex items-center gap-2">
          <Star className="h-4 w-4 text-af-cyan" />
          <div>
            <h2 className="text-lg font-bold text-white">Social proof / Testimonials</h2>
            <p className="text-sm text-slate-400">The “Trusted on court.” quote cards</p>
          </div>
        </div>
        <form action={saveTestimonialsAction} className="space-y-6">
          <input type="hidden" name="count" value={homepage.testimonials.items.length} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Section label</Label>
              <Input
                name="eyebrow"
                defaultValue={homepage.testimonials.eyebrow}
                className="border-white/10 bg-[#060b18] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Headline</Label>
              <Input
                name="title"
                defaultValue={homepage.testimonials.title}
                className="border-white/10 bg-[#060b18] text-white"
              />
            </div>
          </div>

          {homepage.testimonials.items.map((item, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-white/5 bg-[#060b18] p-4"
            >
              <p className="text-xs font-semibold tracking-widest text-af-cyan uppercase">
                Quote {i + 1}
              </p>
              <div className="space-y-2">
                <Label>Quote</Label>
                <Textarea
                  name={`quote_${i}`}
                  defaultValue={item.quote}
                  rows={3}
                  className="border-white/10 bg-[#0d1a34] text-white"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-1">
                  <Label>Author</Label>
                  <Input
                    name={`author_${i}`}
                    defaultValue={item.author}
                    className="border-white/10 bg-[#0d1a34] text-white"
                  />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label>Role</Label>
                  <Input
                    name={`role_${i}`}
                    defaultValue={item.role}
                    className="border-white/10 bg-[#0d1a34] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rating (1–5)</Label>
                  <Input
                    name={`rating_${i}`}
                    type="number"
                    min={1}
                    max={5}
                    defaultValue={item.rating}
                    className="border-white/10 bg-[#0d1a34] text-white"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="submit" variant="cyan">
            Save testimonials
          </Button>
        </form>
      </section>
    </div>
  );
}
