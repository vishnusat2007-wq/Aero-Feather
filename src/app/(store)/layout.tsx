import type { Metadata } from "next";
import { StoreFooter } from "@/components/store/footer";
import { StoreHeader } from "@/components/store/header";
import { ThemeProvider } from "@/components/store/theme-provider";

export const metadata: Metadata = {
  title: "Aero Feather — Premium Shuttlecocks Ireland",
  description:
    "Tournament-grade goose feather shuttlecocks engineered for Irish badminton. Premium flight, durability and performance.",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col bg-af-bg text-af-text">
        <StoreHeader />
        <main className="flex-1 pt-16 lg:pt-[4.5rem]">{children}</main>
        <StoreFooter />
      </div>
    </ThemeProvider>
  );
}
