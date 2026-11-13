"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, KeyRound, Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

const demoAccounts = [
  { role: "Student", email: "aarav.mehta@campus.edu.in" },
  { role: "Placement Admin", email: "meera.nair@campus.edu" },
  { role: "Recruiter", email: "rishi.agrawal@recruiter.io" },
  { role: "Super Admin", email: "aisha.rao@campuspulse.edu" },
];

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"lookup" | "reset" | "completed">("lookup");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "No account found.");
      }
      setMessage(payload.message ?? "Account verified.");
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify email.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Password reset failed.");
      }
      setMessage(payload.message ?? "Password updated successfully!");
      setStep("completed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F6F2] px-6 py-12 text-[#111827]">
      <section className="w-full max-w-lg rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_20px_50px_rgba(17,24,39,0.07)]">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/login" className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#4263EB]">
          <KeyRound className="h-4 w-4" /> Account recovery
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
          {step === "completed" ? "Password reset complete" : step === "reset" ? "Set your new password" : "Forgot your password?"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {step === "completed"
            ? "Your new password is now active. You can proceed directly to sign in."
            : step === "reset"
              ? `Create a secure new password for ${email}.`
              : "Enter your registered email address to verify your account and reset your credentials."}
        </p>

        {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        {message && <div role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}

        {step === "lookup" && (
          <>
            <form onSubmit={handleLookup} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Registered email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none transition focus:border-[#4263EB]"
                  placeholder="name@campus.edu"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#111827] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1d2942] disabled:opacity-60"
              >
                {isSubmitting ? "Verifying..." : "Continue"}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Sparkles className="h-3.5 w-3.5 text-[#4263EB]" /> Demo accounts
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => setEmail(acc.email)}
                    className="truncate rounded-lg border border-slate-200 bg-white p-2 text-left font-medium text-slate-700 hover:border-[#4263EB]"
                  >
                    <span className="block text-[11px] text-slate-400">{acc.role}</span>
                    <span className="truncate">{acc.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === "reset" && (
          <form onSubmit={handleReset} className="mt-6 space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">New password</label>
              <input
                id="newPassword"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none transition focus:border-[#4263EB]"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none transition focus:border-[#4263EB]"
                placeholder="Re-enter password"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#111827] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1d2942] disabled:opacity-60"
            >
              {isSubmitting ? "Updating..." : "Update password"}
            </button>
            <button
              type="button"
              onClick={() => setStep("lookup")}
              className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Use a different email
            </button>
          </form>
        )}

        {step === "completed" && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-900">
              <CheckCircle2 className="h-6 w-6 text-[#16845B]" />
              <div className="text-sm">
                <p className="font-semibold">Ready to sign in</p>
                <p className="text-xs text-emerald-700">Your account is updated with the new credentials.</p>
              </div>
            </div>
            <Link
              href="/login"
              className="block w-full rounded-xl bg-[#111827] py-3 text-center text-sm font-medium text-white transition hover:bg-[#1d2942]"
            >
              Sign in with new password
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
