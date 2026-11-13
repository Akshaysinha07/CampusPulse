import { NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";
import { getPortalData } from "@/lib/portal-data";

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ success: false, message: "Authentication required.", error: { code: "UNAUTHENTICATED" } }, { status: 401 });
  }

  const notifications = getPortalData("notifications");

  return NextResponse.json({
    success: true,
    message: "Notifications fetched successfully.",
    data: {
      items: Array.isArray(notifications) ? notifications : [],
    },
  });
}
