import { PortalLayout } from "@/components/layout/portal-layout";

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}
