import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { isAdmin } from "@/lib/data";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();
  if (!admin) redirect("/login?next=/admin");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-6 md:p-10">{children}</div>
    </div>
  );
}
