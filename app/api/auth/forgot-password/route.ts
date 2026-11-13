import { NextResponse } from "next/server";

import { findUserByEmail, updateUserPassword } from "@/lib/portal-data";

export async function POST(request: Request) {
  let body: { email?: unknown; newPassword?: unknown };
  try {
    body = (await request.json()) as { email?: unknown; newPassword?: unknown };
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body must be valid JSON.", error: { code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { success: false, message: "Enter a valid email address.", error: { code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  const user = findUserByEmail(email);
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "No registered account found with this email. Please check your address or use one of the demo accounts.",
        error: { code: "USER_NOT_FOUND" },
      },
      { status: 404 },
    );
  }

  // If newPassword provided, perform reset
  if (typeof body.newPassword === "string") {
    const newPassword = body.newPassword.trim();
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long.", error: { code: "VALIDATION_ERROR" } },
        { status: 400 },
      );
    }

    updateUserPassword(email, newPassword);
    return NextResponse.json({
      success: true,
      message: `Password updated successfully for ${user.name}! You can now sign in with your new credentials.`,
      data: { email: user.email },
    });
  }

  // Otherwise, verify account exists and invite password reset
  return NextResponse.json({
    success: true,
    message: `Account verified for ${user.name} (${user.role}). Enter your new password below to reset your credentials.`,
    data: {
      accountExists: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
}
