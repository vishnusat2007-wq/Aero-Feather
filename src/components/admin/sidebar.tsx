"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  Globe,
  Wallet,
  Wrench,
  ChartColumn,
  Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/store/logo";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const overview: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
];

const finance: NavItem[] = [
  { href: "/admin/finance", label: "Revenue", icon: ChartColumn },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
];

const website: NavItem[] = [
  { href: "/admin/website", label: "Site content", icon: Globe },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
];

function NavLink({ href, label, icon: Icon }: NavItem) {
  const pathname = usePathname();
  const active =
    href === "/admin"
      ? pathname === "/admin"
      : href === "/admin/website"
        ? pathname === "/admin/website" || pathname.startsWith("/admin/website/")
        : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
        active
          ? "bg-af-cyan text-[#060b18] shadow-[0_0_20px_rgba(32,182,232,0.25)]"
          : "text-slate-300 hover:bg-white/8 hover:text-white",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="px-3 pb-1 pt-4 text-[10px] font-semibold tracking-[0.18em] text-af-cyan/70 uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}

type Props = {
  maintenanceEnabled?: boolean;
};

export function AdminSidebar({ maintenanceEnabled = false }: Props) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-[#050a14] text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <LogoMark size={36} />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-af-cyan">Admin</p>
            <p className="text-sm font-bold">Aero Feather</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {overview.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        <Section title="Finance">
          <div className="mb-1 flex items-center gap-2 px-3 text-[11px] text-slate-500">
            <Wallet className="h-3 w-3" />
            Orders & revenue
          </div>
          {finance.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </Section>

        <Section title="Website Manager">
          {website.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </Section>

        <Section title="Controls">
          <Link
            href="/admin/website#maintenance"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              maintenanceEnabled
                ? "bg-amber-500/15 text-amber-300"
                : "text-slate-300 hover:bg-white/8 hover:text-white",
            )}
          >
            <Wrench className="h-4 w-4" />
            Maintenance
            {maintenanceEnabled && (
              <span className="ml-auto text-[9px] font-bold tracking-wide uppercase">ON</span>
            )}
          </Link>
        </Section>
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/8 hover:text-white"
        >
          <Store className="h-4 w-4" />
          View store
        </Link>
      </div>
    </aside>
  );
}
