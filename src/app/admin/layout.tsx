import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ThemeProvider } from "@/components/store/theme-provider";
import { isAdmin } from "@/lib/data";
import { getMaintenanceEnabled } from "@/lib/site-settings";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();
  if (!admin) redirect("/admin-login");

  const maintenanceEnabled = await getMaintenanceEnabled();

  return (
    <ThemeProvider>
      <AdminShell maintenanceEnabled={maintenanceEnabled}>{children}</AdminShell>
    </ThemeProvider>
  );
}
