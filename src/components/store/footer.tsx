import Image from "next/image";
import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="border-t border-slate-200 bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <Image src="/logo.png" alt="" width={40} height={40} className="rounded-full" />
            <span className="font-bold tracking-wide">AERO FEATHER</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-300">
            Ireland&apos;s premium shuttlecock brand. Engineered for consistent flight,
            trusted by clubs and players nationwide.
          </p>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">Shop</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><Link href="/shop" className="hover:text-cyan">All products</Link></li>
            <li><Link href="/shop?category=professional" className="hover:text-cyan">Professional</Link></li>
            <li><Link href="/shop?category=club" className="hover:text-cyan">Club</Link></li>
            <li><Link href="/shop?category=bundles" className="hover:text-cyan">Bundles</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">Contact</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>hello@aerofeather.ie</li>
            <li>Ships across Ireland &amp; EU</li>
            <li>VAT registered in Ireland</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Aero Feather. All rights reserved.
      </div>
    </footer>
  );
}
