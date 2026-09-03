import Link from "next/link";
import { LogoMark } from "@/components/store/logo";
import { Button } from "@/components/ui/button";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#060b18] px-4 text-center">
      <LogoMark size={80} glow />
      <p className="mt-8 text-[11px] font-semibold tracking-[0.28em] text-af-cyan uppercase">
        Aero Feather
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Admin login
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
        The store is temporarily closed for maintenance. Only the store owner can sign in.
      </p>
      <Button variant="cyan" size="lg" className="mt-8" asChild>
        <Link href="/login?next=/admin">Admin login</Link>
      </Button>
    </div>
  );
}
