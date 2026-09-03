import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
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
    <div className="af-admin flex min-h-screen bg-[#060b18] text-slate-100">
      <AdminSidebar maintenanceEnabled={maintenanceEnabled} />
      <div className="flex-1 overflow-auto p-6 md:p-10">{children}</div>
    </div>
  );
}
