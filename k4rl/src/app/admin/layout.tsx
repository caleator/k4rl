import { AdminPortalLayout } from "@/components/layout/admin-portal-layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminPortalLayout>{children}</AdminPortalLayout>;
}
