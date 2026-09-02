import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";

const shopLinks = [
  { href: "/shop", label: "All Shuttlecocks" },
  { href: "/shop?category=professional", label: "Professional" },
  { href: "/shop?category=club", label: "Club" },
  { href: "/shop?category=bundles", label: "Bundles" },
];

const companyLinks = [
  { href: "/#about", label: "About" },
  { href: "/#clubs", label: "Clubs & Teams" },
  { href: "/#contact", label: "Contact" },
  { href: "/#shipping", label: "Shipping" },
  { href: "#", label: "Returns" },
  { href: "#", label: "Privacy" },
  { href: "#", label: "Terms" },
];

export function StoreFooter() {
  return (
    <footer id="contact" className="relative border-t border-af-cyan/10 bg-af-bg-secondary">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-af-cyan/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="mb-6 flex items-center gap-3">
              <Image src="/logo.png" alt="Aero Feather" width={44} height={44} />
              <div>
                <p className="text-sm font-bold tracking-[0.16em] text-af-text">AERO FEATHER</p>
                <p className="text-[11px] tracking-widest text-af-muted uppercase">
                  Premium Shuttlecocks, Ireland
                </p>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-af-muted">
              Tournament-grade goose feather shuttlecocks engineered for consistent
              flight and durability — developed for clubs and competitive players
              across Ireland.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="mailto:hello@aerofeather.ie"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-af-cyan/20 text-af-muted transition-colors hover:border-af-cyan/40 hover:text-af-cyan"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-af-cyan/20 text-[11px] font-bold tracking-wider text-af-muted transition-colors hover:border-af-cyan/40 hover:text-af-cyan"
                aria-label="Instagram"
              >
                IG
              </a>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-5 lg:col-start-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-4 text-xs font-semibold tracking-[0.2em] text-af-cyan uppercase">
                Shop
              </h3>
              <ul className="space-y-2.5">
                {shopLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-af-muted transition-colors hover:text-af-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-xs font-semibold tracking-[0.2em] text-af-cyan uppercase">
                Company
              </h3>
              <ul className="space-y-2.5">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-af-muted transition-colors hover:text-af-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3 lg:col-start-10">
            <h3 className="mb-4 text-xs font-semibold tracking-[0.2em] text-af-cyan uppercase">
              Ireland
            </h3>
            <p className="text-sm leading-relaxed text-af-muted">
              Based in Ireland
              <br />
              Fast nationwide delivery
              <br />
              VAT registered
              <br />
              hello@aerofeather.ie
            </p>
          </div>
        </div>

        <div className="section-divider mt-14 mb-6" />

        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-af-muted">
            © {new Date().getFullYear()} Aero Feather — Premium Shuttlecocks, Ireland.
          </p>
          <p className="text-xs text-af-muted/70">
            Engineered for flight. Built for the court.
          </p>
        </div>
      </div>
    </footer>
  );
}
