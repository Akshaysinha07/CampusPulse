"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Bell,
  Building2,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  Download,
  FileUp,
  GraduationCap,
  LogOut,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import {
  activityTimeline,
  adminMetrics,
  adminStudents,
  companies,
  placementAnnouncements,
  recruiterInterviews,
  recruiterPipeline,
  roleLabels,
  studentOpportunities,
  studentProfile,
} from "@/lib/mock-data";
import type { PortalSession, Role } from "@/lib/types";
import { portalSections } from "@/lib/portal-routes";
import { ThemeToggle } from "@/components/theme-toggle";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

const roleButtonMap: Record<Role, { title: string; subtitle: string; email: string; name: string }> = {
  student: {
    title: "Student",
    subtitle: "Access profile, resume records, opportunities and placement updates.",
    email: "aarav.mehta@campus.edu.in",
    name: "Aarav Mehta",
  },
  admin: {
    title: "Placement admin",
    subtitle: "Review student and company activity, compliance and placement performance.",
    email: "meera.nair@campus.edu",
    name: "Meera Nair",
  },
  recruiter: {
    title: "Recruiter",
    subtitle: "Manage candidate pipelines, drives and interview scheduling.",
    email: "rishi.agrawal@recruiter.io",
    name: "Rishi Agrawal",
  },
  super_admin: {
    title: "Super admin",
    subtitle: "Control institution settings, permissions and platform-wide governance.",
    email: "aisha.rao@campuspulse.edu",
    name: "Aisha Rao",
  },
};

const STORAGE_KEY = "campuspulse-session";

const profileSchema = z.object({
  fullName: z.string().min(2),
  universityUid: z.string().min(2),
  phoneNumber: z.string().min(8),
  department: z.string().min(2),
  degree: z.string().min(2),
  specialisation: z.string().min(2),
  graduationYear: z.string().min(4),
  currentSemester: z.string().min(2),
  cgpa: z.string().min(1),
  linkedInUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type DashboardRecord = Record<string, unknown> & { id?: string };

function usePortalData<T>(section: string, initialData: T) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/portal/${section}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as { success?: boolean; message?: string; data?: T };
        if (response.status === 401) {
          router.replace("/login");
          throw new Error("Your session has expired.");
        }
        if (!response.ok || !payload.success || payload.data === undefined) {
          throw new Error(payload.message ?? "Unable to load dashboard data.");
        }
        return payload.data;
      })
      .then((result) => {
        if (active) {
          setData(result);
          setError("");
        }
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard data.");
      });
    return () => {
      active = false;
    };
  }, [router, section]);

  return { data, error };
}

function getSession(): PortalSession | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value) as PortalSession;
  } catch {
    return null;
  }
}

function renderStatusTone(value: string) {
  const norm = value.toLowerCase();
  if (["eligible", "open", "active", "approved"].includes(norm)) return "bg-[#B9E6D3] text-[#111827]";
  if (["hot", "shortlist", "interviewing", "shortlisted"].includes(norm)) return "bg-[#E8EEFF] text-[#1d2942]";
  if (["warning", "review", "pending"].includes(norm)) return "bg-[#FCE7E7] text-[#942d2d]";
  return "bg-slate-200 text-slate-700";
}

function StatCard({ label, value, delta, href }: { label: string; value: string; delta: string; href?: string }) {
  const content = (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#4263EB]">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-3xl font-semibold tracking-[-0.06em] text-[#111827]">{value}</p>
        <span className="rounded-full bg-[#B9E6D3] px-2.5 py-1 text-xs font-medium text-[#111827]">{delta}</span>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function StudentOverview({ session }: { session: PortalSession }) {
  const router = useRouter();
  const [profileMessage, setProfileMessage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const applications = usePortalData<DashboardRecord[]>("applications", studentOpportunities.map((item): DashboardRecord => ({ ...item })));
  const companyData = usePortalData<DashboardRecord[]>("companies", companies.map((item, index): DashboardRecord => ({ id: `company-${index + 1}`, ...item })));
  const notificationData = usePortalData<DashboardRecord[]>("notifications", []);
  const activityData = usePortalData<DashboardRecord[]>("activity", activityTimeline);
  const announcementData = usePortalData<DashboardRecord[]>("announcements", placementAnnouncements.map((title, index) => ({ id: `announcement-${index}`, title })));
  const documentsData = usePortalData<DashboardRecord[]>("documents", []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: studentProfile.fullName,
      universityUid: studentProfile.universityUid,
      phoneNumber: studentProfile.phoneNumber,
      department: studentProfile.department,
      degree: studentProfile.degree,
      specialisation: studentProfile.specialisation,
      graduationYear: studentProfile.graduationYear,
      currentSemester: studentProfile.currentSemester,
      cgpa: studentProfile.cgpa,
      linkedInUrl: studentProfile.linkedInUrl,
      githubUrl: studentProfile.githubUrl,
      portfolioUrl: studentProfile.portfolioUrl,
    },
  });

  useEffect(() => {
    let active = true;
    void fetch("/api/portal/profile", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as { success?: boolean; message?: string; data?: ProfileFormValues };
        if (response.status === 401) {
          router.replace("/login");
          throw new Error("Your session has expired.");
        }
        if (!response.ok || !payload.success || !payload.data) throw new Error(payload.message ?? "Unable to load your profile.");
        if (active) form.reset(payload.data);
      })
      .catch((error: unknown) => {
        if (active) setProfileMessage(error instanceof Error ? error.message : "Unable to load your profile.");
      });
    return () => {
      active = false;
    };
  }, [form, router]);

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSavingProfile(true);
    setProfileMessage("");
    try {
      const response = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: values }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) throw new Error(payload.message ?? "Unable to save profile.");
      setProfileMessage(payload.message ?? "Profile changes saved successfully.");
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  async function downloadDocument(id: string, name?: string) {
    try {
      const res = await fetch(`/api/portal/documents?download=${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error("Could not download document.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name ?? "resume.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.alert("Unable to download document.");
    }
  }

  const eligibleCount = applications.data.filter((item) => item.status !== "Applied").length;
  const activeCount = applications.data.filter((item) => item.status === "Applied" || item.status === "Interviewing").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Profile completion" value="92%" delta="+6%" href="/student/profile" />
        <StatCard label="Eligible roles" value={String(eligibleCount)} delta="See openings" href="/student/applications" />
        <StatCard label="Active applications" value={String(activeCount)} delta="Live status" href="/student/applications" />
        <StatCard
          label="Unread notices"
          value={String(notificationData.data.filter((item) => item.read !== true).length)}
          delta="View updates"
          href="/student/notifications"
        />
      </div>

      {(applications.error || companyData.error || notificationData.error || activityData.error || announcementData.error) && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {applications.error || companyData.error || notificationData.error || activityData.error || announcementData.error}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Welcome back</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-[-0.05em] text-[#111827]">{session.name}</h2>
            </div>
            <div className="rounded-full bg-[#B9E6D3] px-3 py-1.5 text-xs font-medium text-[#111827]">Student</div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {applications.data.map((job, index) => (
              <div key={String(job.id ?? index)} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100/60">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#111827]">{String(job.company ?? "Company")}</p>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${renderStatusTone(String(job.status ?? "Open"))}`}>
                    {String(job.status ?? "Open")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{String(job.role ?? "Placement opportunity")}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>{String(job.location ?? `Opportunity ${index + 1}`)}</span>
                  <span>{String(job.package ?? "")}</span>
                </div>
                <Link href="/student/applications" className="mt-4 inline-flex text-xs font-semibold text-[#4263EB] hover:underline">
                  View application options →
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-[#111827]">Activity timeline</h3>
            <Sparkles className="h-4 w-4 text-[#4263EB]" />
          </div>
          <div className="mt-5 space-y-4">
            {activityData.data.map((entry, index) => (
              <div key={String(entry.id ?? entry.time ?? index)} className="flex gap-3 border-l border-slate-200 pl-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#4263EB]" />
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{String(entry.time ?? "")}</p>
                  <p className="mt-1 text-sm text-slate-700">{String(entry.event ?? "")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-[#111827]">Student profile</h3>
              <p className="text-xs text-slate-500">Keep your academic and contact details up-to-date.</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-[#16845B]" />
          </div>
          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <input className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm" {...form.register("fullName")} placeholder="Full Name" />
            <input className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm" {...form.register("universityUid")} placeholder="University UID" />
            <input className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm" {...form.register("phoneNumber")} placeholder="Phone Number" />
            <input className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm" {...form.register("department")} placeholder="Department" />
            <input className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm" {...form.register("degree")} placeholder="Degree" />
            <input className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm" {...form.register("specialisation")} placeholder="Specialisation" />
            <input className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm" {...form.register("graduationYear")} placeholder="Graduation Year" />
            <input className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm" {...form.register("currentSemester")} placeholder="Current Semester" />
            <input className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm" {...form.register("cgpa")} placeholder="CGPA" />
            <input className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm md:col-span-2" {...form.register("linkedInUrl")} placeholder="LinkedIn URL" />
            <input className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm" {...form.register("githubUrl")} placeholder="GitHub URL" />
            <input className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm" {...form.register("portfolioUrl")} placeholder="Portfolio URL" />
            <button
              type="submit"
              disabled={isSavingProfile}
              className="md:col-span-2 inline-flex items-center justify-center rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1d2942] disabled:opacity-60"
            >
              {isSavingProfile ? "Saving..." : "Save changes"}
            </button>
            {profileMessage && <p role="status" className="md:col-span-2 text-sm font-medium text-emerald-700">{profileMessage}</p>}
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[#111827]">Resume manager</h3>
                <p className="text-xs text-slate-500">Official resumes attached to placement applications.</p>
              </div>
              <FileUp className="h-5 w-5 text-[#4263EB]" />
            </div>

            <div className="mt-5 rounded-[22px] border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-600">
              <p className="font-semibold text-[#111827]">Placement Resumes (PDF)</p>
              <p className="mt-1 text-xs text-slate-500">Max size: 2 MB · Validated against recruiter specs</p>
              <div className="mt-4 flex justify-center gap-3">
                <Link
                  href="/student/documents"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#1d2942]"
                >
                  <FileUp className="h-3.5 w-3.5" /> Upload & Manage
                </Link>
                <Link
                  href="/student/documents"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" /> View all
                </Link>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              {documentsData.data.length > 0 ? (
                documentsData.data.map((doc) => (
                  <div key={String(doc.id)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="truncate font-medium text-slate-800">{String(doc.name ?? "resume.pdf")}</p>
                      <p className="text-[11px] text-slate-500">{doc.size ? `${Math.round(Number(doc.size) / 1024)} KB` : "PDF document"}</p>
                    </div>
                    <button
                      onClick={() => void downloadDocument(String(doc.id), String(doc.name))}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="h-3.5 w-3.5 text-[#4263EB]" /> Download
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-slate-200 p-3 text-xs text-slate-500 text-center">
                  No resumes uploaded yet. Visit <Link href="/student/documents" className="text-[#4263EB] font-medium">Documents</Link> to add your resume.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-[#111827]">Placement Announcements</h3>
            <div className="mt-5 space-y-3">
              {announcementData.data.map((item, index) => (
                <div key={String(item.id ?? index)} className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16845B]" />
                  <span>{String(item.title ?? "")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#111827]">Company explorer</h3>
            <p className="text-sm text-slate-500">Discover participating recruitment organizations.</p>
          </div>
          <Link href="/student/companies" className="text-xs font-semibold text-[#4263EB] hover:underline">
            View directory →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {companyData.data.map((company) => (
            <div key={String(company.id ?? company.name)} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-[#111827]">{String(company.name ?? "")}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {String(company.industry ?? "")} • {String(company.location ?? "")}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${renderStatusTone(String(company.hiringStatus ?? "Open"))}`}>
                  {String(company.hiringStatus ?? "Open")}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{String(company.description ?? "")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(Array.isArray(company.roles) ? company.roles : []).map((jobRole) => (
                  <span key={String(jobRole)} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600">
                    {String(jobRole)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminOverview() {
  const analytics = usePortalData<DashboardRecord[]>("analytics", adminMetrics);
  const students = usePortalData<DashboardRecord[]>("students", adminStudents);
  const compliance = usePortalData<DashboardRecord[]>("compliance", []);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-4">
        {analytics.data.map((item, index) => (
          <StatCard
            key={String(item.id ?? item.label ?? index)}
            label={String(item.label ?? "Metric")}
            value={String(item.value ?? "—")}
            delta={String(item.change ?? item.delta ?? "")}
            href="/admin/analytics"
          />
        ))}
      </div>
      {(analytics.error || students.error || compliance.error) && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {analytics.error || students.error || compliance.error}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-[#111827]">Candidate batch status</h3>
              <p className="text-xs text-slate-500">Eligibility overview across departments.</p>
            </div>
            <Link href="/admin/students" className="text-xs font-semibold text-[#4263EB] hover:underline">
              Manage all students →
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {students.data.map((student, index) => (
              <div key={String(student.id ?? student.name ?? index)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="font-semibold text-[#111827]">{String(student.name ?? "")}</p>
                  <p className="text-xs text-slate-500">
                    {String(student.dept ?? student.department ?? "")} • CGPA {String(student.cgpa ?? "—")}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${renderStatusTone(String(student.status ?? "Review"))}`}>
                  {String(student.status ?? "Review")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-[#111827]">Compliance & audit queue</h3>
              <p className="text-xs text-slate-500">Pending academic verifications.</p>
            </div>
            <Link href="/admin/compliance" className="text-xs font-semibold text-[#4263EB] hover:underline">
              Open queue →
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {compliance.data.map((task, index) => (
              <div key={String(task.id ?? index)} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16845B]" />
                <div>
                  <p className="font-medium text-slate-900">{String(task.title ?? "Verification item")}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{String(task.detail ?? task.status ?? "")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecruiterOverview() {
  const pipeline = usePortalData<DashboardRecord[]>("insights", recruiterPipeline);
  const jobs = usePortalData<DashboardRecord[]>("jobs", []);
  const candidates = usePortalData<DashboardRecord[]>("candidates", []);
  const interviews = usePortalData<DashboardRecord[]>("interviews", recruiterInterviews);
  const openJobs = jobs.data.filter((job) => job.status === "Open").length || 3;
  const shortlisted = candidates.data.filter((candidate) => candidate.stage === "Shortlisted" || candidate.stage === "Shortlist").length || 1;
  const offers = candidates.data.filter((candidate) => candidate.stage === "Offer" || candidate.stage === "Offered").length || 1;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Active job roles" value={String(openJobs)} delta="Live" href="/recruiter/jobs" />
        <StatCard label="Shortlisted pool" value={String(shortlisted)} delta="Verified" href="/recruiter/candidates" />
        <StatCard label="Interview panels" value={String(interviews.data.length)} delta="Scheduled" href="/recruiter/interviews" />
        <StatCard label="Offers extended" value={String(offers)} delta="2025 batch" href="/recruiter/insights" />
      </div>
      {(pipeline.error || jobs.error || candidates.error || interviews.error) && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {pipeline.error || jobs.error || candidates.error || interviews.error}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-[#111827]">Hiring candidate funnel</h3>
            <Link href="/recruiter/insights" className="text-xs font-semibold text-[#4263EB] hover:underline">
              Detailed metrics →
            </Link>
          </div>
          <div className="mt-6 space-y-3">
            {pipeline.data.map((stage, index) => (
              <div key={String(stage.id ?? stage.name ?? index)}>
                <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                  <span className="font-medium text-slate-800">{String(stage.name ?? `Stage ${index + 1}`)}</span>
                  <span className="font-semibold text-slate-900">{String(stage.value ?? 0)} candidates</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div className="h-2.5 rounded-full bg-[#4263EB]" style={{ width: `${Math.min(100, (Number(stage.value ?? 0) / 240) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-[#111827]">Upcoming interview slots</h3>
            <Link href="/recruiter/interviews" className="text-xs font-semibold text-[#4263EB] hover:underline">
              Manage schedule →
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {interviews.data.map((candidate, index) => (
              <div key={String(candidate.id ?? candidate.candidate ?? index)} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold text-[#111827]">{String(candidate.candidate ?? "Candidate")}</p>
                <p className="mt-0.5 text-sm text-slate-600">{String(candidate.role ?? "")}</p>
                <p className="mt-2 text-xs font-medium text-[#4263EB]">{String(candidate.slot ?? "")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SuperAdminOverview() {
  const users = usePortalData<DashboardRecord[]>("users", []);
  const institutions = usePortalData<DashboardRecord[]>("institutions", []);
  const permissions = usePortalData<DashboardRecord[]>("permissions", []);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Platform users" value={String(users.data.length)} delta="All roles" href="/super-admin/users" />
        <StatCard label="Institutions" value={String(institutions.data.length)} delta="Registered" href="/super-admin/institutions" />
        <StatCard label="Role groups" value={String(permissions.data.length)} delta="Configured" href="/super-admin/permissions" />
        <StatCard label="System status" value="Online" delta="Operational" href="/super-admin/settings" />
      </div>
      {(users.error || institutions.error || permissions.error) && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {users.error || institutions.error || permissions.error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/super-admin/users" className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#4263EB]">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3FF] text-[#4263EB]">
            <Users className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold text-[#111827]">Manage platform users</h2>
          <p className="mt-2 text-sm text-slate-500">Create, edit, and audit student, admin, recruiter, and super admin accounts.</p>
        </Link>
        <Link href="/super-admin/institutions" className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#4263EB]">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3FF] text-[#4263EB]">
            <Building2 className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold text-[#111827]">Campus institutions</h2>
          <p className="mt-2 text-sm text-slate-500">Configure partner universities, branches, and placement criteria.</p>
        </Link>
        <Link href="/super-admin/settings" className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#4263EB]">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3FF] text-[#4263EB]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold text-[#111827]">Platform configuration</h2>
          <p className="mt-2 text-sm text-slate-500">Update institution contact emails, maintenance flags, and portal season.</p>
        </Link>
      </div>
    </div>
  );
}

function PortalDashboard({ role, session }: { role: Role; session: PortalSession }) {
  if (role === "student") return <StudentOverview session={session} />;
  if (role === "admin") return <AdminOverview />;
  if (role === "recruiter") return <RecruiterOverview />;
  return <SuperAdminOverview />;
}

export function CampusPortal({ role, mode }: { role: Role | null; mode: "login" | "portal" }) {
  const router = useRouter();
  const mounted = useMounted();
  const [session, setSession] = useState<PortalSession | null>(() => getSession());
  const [selectedPortal, setSelectedPortal] = useState<Role>("student");
  const [emailInput, setEmailInput] = useState(roleButtonMap.student.email);
  const [passwordInput, setPasswordInput] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [portalError, setPortalError] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    // Verify session with server API
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (res) => {
        if (res.ok) {
          const payload = (await res.json()) as { success?: boolean; data?: { user?: PortalSession } };
          if (payload.data?.user) {
            setSession(payload.data.user);
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.data.user));
          }
        }
      })
      .catch(() => {
        // Ignore background sync errors
      });
  }, []);

  const selectPortalTab = (portal: Role) => {
    setSelectedPortal(portal);
    setEmailInput(roleButtonMap[portal].email);
    setPasswordInput("password123");
    setLoginError("");
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput, rememberMe: true }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: { user?: { id: string; role: Role; name: string; email: string } };
      };
      if (!response.ok || !payload.success || !payload.data?.user) {
        throw new Error(payload.message ?? "Authentication failed.");
      }
      if (payload.data.user.role !== selectedPortal) {
        throw new Error(`This account belongs to the ${roleButtonMap[payload.data.user.role].title} portal.`);
      }
      const nextSession: PortalSession = payload.data.user;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      router.push(nextSession.role === "super_admin" ? "/super-admin" : `/${nextSession.role}`);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantDemoLogin = async (portal: Role) => {
    setIsSubmitting(true);
    setLoginError("");
    setSelectedPortal(portal);
    const demoInfo = roleButtonMap[portal];
    setEmailInput(demoInfo.email);
    setPasswordInput("password123");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoInfo.email, password: "password123", rememberMe: true }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: { user?: { id: string; role: Role; name: string; email: string } };
      };
      if (!response.ok || !payload.success || !payload.data?.user) {
        throw new Error(payload.message ?? "Authentication failed.");
      }
      const nextSession: PortalSession = payload.data.user;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      router.push(nextSession.role === "super_admin" ? "/super-admin" : `/${nextSession.role}`);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const signOut = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("The server could not revoke the session.");
    } catch (error) {
      setPortalError(error instanceof Error ? `${error.message}` : "Session cleared.");
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setSession(null);
    setAccountMenuOpen(false);
    router.push("/login");
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F6F2]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#4263EB]" />
      </div>
    );
  }

  if (mode === "login") {
    return (
      <div className="min-h-screen bg-[#F7F6F2] px-6 py-12 text-[#111827]">
        <div className="mx-auto max-w-6xl rounded-[30px] border border-slate-200 bg-white/90 p-8 shadow-[0_30px_80px_rgba(17,24,39,0.08)]">
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#4263EB]">CampusPulse Secure Access</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em]">Welcome back</h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                Back to home
              </Link>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Select portal role</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["student", "admin", "recruiter", "super_admin"] as Role[]).map((portal) => (
                  <button
                    key={portal}
                    type="button"
                    onClick={() => selectPortalTab(portal)}
                    className={`rounded-[22px] border p-4 text-left transition ${
                      selectedPortal === portal ? "border-[#4263EB] bg-[#EEF3FF] shadow-sm" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#111827] text-white">
                      {portal === "student" ? (
                        <GraduationCap className="h-5 w-5" />
                      ) : portal === "admin" ? (
                        <ShieldCheck className="h-5 w-5" />
                      ) : portal === "recruiter" ? (
                        <BriefcaseBusiness className="h-5 w-5" />
                      ) : (
                        <Users className="h-5 w-5" />
                      )}
                    </div>
                    <p className="font-semibold text-[#111827]">{roleLabels[portal]}</p>
                    <p className="mt-1 text-xs text-slate-500">{roleButtonMap[portal].title}</p>
                  </button>
                ))}
              </div>

              {/* 1-Click Demo Login Box */}
              <div className="mt-6 rounded-2xl border border-blue-200 bg-[#F4F7FF] p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4263EB]">
                  <Sparkles className="h-4 w-4" /> 1-Click Demo Testing
                </div>
                <p className="mt-1.5 text-xs text-slate-600">
                  Click any role button below to instantly sign in without typing passwords:
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(["student", "admin", "recruiter", "super_admin"] as Role[]).map((portal) => (
                    <button
                      key={portal}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => void handleInstantDemoLogin(portal)}
                      className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-800 transition hover:border-[#4263EB] hover:bg-[#EEF3FF] disabled:opacity-50"
                    >
                      <span className="block font-semibold text-[#4263EB]">{roleButtonMap[portal].title}</span>
                      <span className="truncate block text-[10px] text-slate-500">{roleButtonMap[portal].name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#4263EB]">Sign in</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.05em] text-[#111827]">{roleLabels[selectedPortal]}</h2>
                </div>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                  {roleButtonMap[selectedPortal].title}
                </span>
              </div>

              <form className="space-y-4" onSubmit={handleLoginSubmit}>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                    University email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#4263EB]"
                    placeholder="name@university.edu"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-xs font-medium text-[#4263EB]">
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#4263EB]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                  <span className="text-xs text-slate-500">
                    Demo password: <code className="rounded bg-slate-200 px-1 py-0.5 font-mono text-slate-800">password123</code>
                  </span>
                  <Link href="/forgot-password" className="text-xs font-medium text-[#4263EB] hover:underline">
                    Forgot password?
                  </Link>
                </div>

                {loginError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{loginError}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-[#111827] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1d2942] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Signing in..." : `Continue as ${roleButtonMap[selectedPortal].title}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeRole = session?.role ?? role;

  if (!session || activeRole !== role || !role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F6F2] px-6">
        <div className="max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_50px_rgba(17,24,39,0.07)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[#4263EB]">Access required</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#111827]">
            {session ? `Logged in as ${roleLabels[session.role]}` : "You need a valid role-based session."}
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {session
              ? `You are currently logged in with the ${session.role} account (${session.email}). This portal requires the ${role ?? "appropriate"} role.`
              : "Please sign in to access your placement dashboard and private student records."}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            {session && (
              <Link
                href={session.role === "super_admin" ? "/super-admin" : `/${session.role}`}
                className="inline-flex justify-center rounded-full bg-[#4263EB] px-5 py-3 text-sm font-medium text-white"
              >
                Go to my {roleLabels[session.role]}
              </Link>
            )}
            <Link href="/login" className="inline-flex justify-center rounded-full bg-[#111827] px-5 py-3 text-sm font-medium text-white">
              Sign in with another account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = portalSections[role];
  const portalPath = role === "super_admin" ? "/super-admin" : `/${role}`;
  const accountPath =
    role === "student"
      ? `${portalPath}/profile`
      : role === "super_admin"
        ? `${portalPath}/settings`
        : `${portalPath}/${role === "admin" ? "students" : "jobs"}`;

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#111827]">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between px-6 py-4 lg:px-12">
          <Link href={portalPath} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111827] text-sm font-semibold text-[#F7F6F2]">
              CP
            </div>
            <div>
              <p className="text-lg font-semibold">CampusPulse</p>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{roleLabels[role]}</p>
            </div>
          </Link>

          <nav className="order-3 flex w-full items-center gap-5 overflow-x-auto py-2 md:order-none md:w-auto md:max-w-[50vw]" aria-label="Portal navigation">
            {navItems.map((item) => (
              <Link
                key={item.slug || "overview"}
                href={item.slug ? `${portalPath}/${item.slug}` : portalPath}
                className="whitespace-nowrap text-sm font-medium text-slate-600 transition hover:text-[#111827]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={`${portalPath}/notifications`}
              aria-label="Notifications"
              className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            >
              <Bell className="h-4 w-4" />
            </Link>
            <ThemeToggle />
            <div className="relative">
              <button
                type="button"
                aria-expanded={accountMenuOpen}
                onClick={() => setAccountMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 transition hover:bg-slate-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#B9E6D3] text-xs font-semibold text-[#111827]">
                  {session.name.charAt(0)}
                </span>
                <span className="hidden text-left md:block">
                  <span className="block text-xs font-medium text-[#111827]">{session.name}</span>
                  <span className="block text-[10px] text-slate-500">{session.email}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>
              {accountMenuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="text-xs font-semibold text-slate-900">{session.name}</p>
                    <p className="text-[11px] text-slate-500">{roleLabels[session.role]}</p>
                  </div>
                  <Link
                    href={accountPath}
                    onClick={() => setAccountMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {role === "student" ? "My student profile" : role === "super_admin" ? "Platform settings" : "Workspace records"}
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setAccountMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Switch portal role
                  </Link>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className="w-full text-left rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-3.5 py-2 text-xs font-medium text-white transition hover:bg-[#1d2942]"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
        {portalError && <p role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{portalError}</p>}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6 flex flex-col gap-4 rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#4263EB]">Live Workspace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#111827]">
              {role === "student"
                ? `Welcome back, ${session.name.split(" ")[0]}`
                : role === "admin"
                  ? "Placement Control Center"
                  : role === "recruiter"
                    ? "Recruiter Workspace"
                    : "Platform Administration"}
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#B9E6D3] px-3 py-1.5 text-xs font-medium text-[#111827]">
            <span className="h-2 w-2 rounded-full bg-[#16845B]" /> Real-time sync active
          </div>
        </motion.div>

        <PortalDashboard role={role} session={session} />
      </main>
    </div>
  );
}
