import { CampusPortal } from "@/components/portal-shell";

export const dynamic = "force-dynamic";

export default function StudentPortalPage() {
  return <CampusPortal role="student" mode="portal" />;
}
