import { createFileRoute, Outlet } from "@tanstack/react-router";
import AdminLayout from "@/components/AdminLayout";
import { requireAdmin } from "@/lib/routeGuards";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    await requireAdmin();
  },

  component: AdminLayoutWrapper,
});

function AdminLayoutWrapper() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
