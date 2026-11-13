import { CampusPortal } from "@/components/portal-shell";

export const dynamic = "force-dynamic";

export default function SuperAdminPortalPage() {
  return <CampusPortal role="super_admin" mode="portal" />;
}
