import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { getInitialThemeScript } from "@/lib/theme";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Aero Feather — Premium Shuttlecocks Ireland",
  description:
    "Tournament-grade goose feather shuttlecocks engineered for Irish badminton. Premium flight, durability and performance.",
  icons: { icon: "/logo-mark-circle.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="af-theme-init" strategy="beforeInteractive">
          {getInitialThemeScript()}
        </Script>
      </head>
      <body className={`${jakarta.variable} antialiased`}>{children}</body>
    </html>
  );
}
