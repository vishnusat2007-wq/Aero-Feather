import type { Metadata } from "next";
import { StoreFooter } from "@/components/store/footer";
import { StoreHeader } from "@/components/store/header";

export const metadata: Metadata = {
  title: "Aero Feather — Premium Shuttlecocks Ireland",
  description:
    "Shop tournament-grade shuttlecocks from Aero Feather. Fast delivery across Ireland. Professional, club, and practice ranges.",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  );
}
