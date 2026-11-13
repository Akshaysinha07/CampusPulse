import { NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";
import { getPortalData } from "@/lib/portal-data";

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ success: false, message: "Authentication required.", error: { code: "UNAUTHENTICATED" } }, { status: 401 });
  }

  if (!["admin", "super_admin"].includes(session.role)) {
    return NextResponse.json({ success: false, message: "Access denied: insufficient permissions.", error: { code: "FORBIDDEN" } }, { status: 403 });
  }

  const students = getPortalData("students");

  return NextResponse.json({
    success: true,
    message: "Student records fetched successfully.",
    data: Array.isArray(students) ? students : [],
  });
}
