"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { LogoMark } from "@/components/store/logo";
import { cn } from "@/lib/utils";

const MD_BREAKPOINT = 768;

function titleForPath(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/finance")) return "Revenue";
  if (pathname.startsWith("/admin/orders")) return "Orders";
  if (pathname.startsWith("/admin/website")) return "Site content";
  if (pathname.startsWith("/admin/products")) return "Products";
  if (pathname.startsWith("/admin/inventory")) return "Inventory";
  if (pathname.startsWith("/admin/profile")) return "Profile";
  return "Admin";
}

type Props = {
  children: React.ReactNode;
  maintenanceEnabled?: boolean;
};

export function AdminShell({ children, maintenanceEnabled = false }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMobileOpen(false);
  }
  const drawerId = useId();
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (mobileOpen) {
      wasOpenRef.current = true;
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = "";
      if (wasOpenRef.current) {
        openButtonRef.current?.focus();
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= MD_BREAKPOINT) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="af-admin flex min-h-screen bg-[#060b18] text-slate-100">
      <div className="hidden md:flex md:min-h-screen">
        <AdminSidebar maintenanceEnabled={maintenanceEnabled} />
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          id={drawerId}
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
          inert={!mobileOpen ? true : undefined}
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col shadow-2xl transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <AdminSidebar
            maintenanceEnabled={maintenanceEnabled}
            onNavigate={() => setMobileOpen(false)}
            closeButton={
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close admin menu"
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/8 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            }
            className="h-full w-full"
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#050a14]/95 px-3 py-3 backdrop-blur-md md:hidden">
          <button
            ref={openButtonRef}
            type="button"
            aria-label="Open admin menu"
            aria-expanded={mobileOpen}
            aria-controls={drawerId}
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-200 transition hover:bg-white/8 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
          <LogoMark size={32} />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-af-cyan">Admin</p>
            <p className="truncate text-sm font-bold">{titleForPath(pathname)}</p>
          </div>
        </header>

        <div className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 md:p-10">{children}</div>
      </div>
    </div>
  );
}
