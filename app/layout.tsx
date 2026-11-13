import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusPulse | Placement management platform",
  description: "Premium university placement and hiring intelligence platform for students, recruiters, and placement administrators.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#F7F6F2] text-[#111827]">{children}</body>
    </html>
  );
}
