"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Download,
  FileUp,
  LoaderCircle,
  Plus,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { Role } from "@/lib/types";
import { ThemeToggle } from "@/components/theme-toggle";
import { portalSections } from "@/lib/portal-routes";

type Field = { key: string; label: string; options?: string[] };
type ResourceConfig = {
  title: string;
  description: string;
  fields: Field[];
  canCreate?: boolean;
  canDelete?: boolean;
  readOnly?: boolean;
};
type RecordValue = Record<string, unknown>;

const config: Record<string, ResourceConfig> = {
  profile: {
    title: "Student profile",
    description: "Review and update your placement profile, university details, and links.",
    fields: [
      { key: "fullName", label: "Full name" },
      { key: "universityUid", label: "University ID" },
      { key: "phoneNumber", label: "Phone" },
      { key: "department", label: "Department" },
      { key: "degree", label: "Degree" },
      { key: "specialisation", label: "Specialisation" },
      { key: "graduationYear", label: "Graduation year" },
      { key: "currentSemester", label: "Semester" },
      { key: "cgpa", label: "CGPA" },
      { key: "linkedInUrl", label: "LinkedIn URL" },
      { key: "githubUrl", label: "GitHub URL" },
      { key: "portfolioUrl", label: "Portfolio URL" },
    ],
  },
  documents: {
    title: "Documents & Resumes",
    description: "Manage official placement resumes. Upload valid PDF files (up to 2 MB) for company panels.",
    fields: [],
  },
  companies: {
    title: "Companies",
    description: "Explore registered recruitment partners, industry domains, and visiting organisations.",
    fields: [
      { key: "name", label: "Company name" },
      { key: "industry", label: "Industry" },
      { key: "location", label: "Location" },
      { key: "package", label: "Package range" },
      { key: "description", label: "Description" },
    ],
    canCreate: true,
    canDelete: true,
  },
  applications: {
    title: "Application Tracker",
    description: "Track recruitment pipeline progress, update candidate stages, and monitor interview status.",
    fields: [
      { key: "company", label: "Company" },
      { key: "role", label: "Role" },
      { key: "package", label: "Package" },
      { key: "deadline", label: "Deadline" },
      {
        key: "status",
        label: "Status",
        options: ["Not applied", "Applied", "Under Review", "Shortlisted", "Interviewing", "Offered", "Rejected"],
      },
    ],
    canCreate: true,
    canDelete: true,
  },
  students: {
    title: "Student Management",
    description: "Review academic standings, manage batch records, and control drive eligibility.",
    fields: [
      { key: "name", label: "Student name" },
      { key: "dept", label: "Department" },
      { key: "cgpa", label: "CGPA" },
      { key: "status", label: "Eligibility status", options: ["Eligible", "Review", "Placed", "Ineligible"] },
    ],
    canCreate: true,
    canDelete: true,
  },
  drives: {
    title: "Placement Drives",
    description: "Schedule on-campus hiring drives, set participation deadlines, and manage company visits.",
    fields: [
      { key: "company", label: "Company" },
      { key: "role", label: "Role" },
      { key: "deadline", label: "Deadline" },
      { key: "status", label: "Drive status", options: ["Open", "Ongoing", "Completed", "Closed"] },
    ],
    canCreate: true,
    canDelete: true,
  },
  compliance: {
    title: "Compliance & Verification Queue",
    description: "Audit backlog disclosures, verify transcripts, and certify company eligibility requirements.",
    fields: [
      { key: "title", label: "Task / Check" },
      { key: "detail", label: "Details" },
      { key: "status", label: "Status", options: ["Pending", "Review", "Approved", "Flagged"] },
    ],
    canCreate: true,
    canDelete: true,
  },
  analytics: {
    title: "Placement Analytics & Reports",
    description: "Real-time key performance indicators, department distributions, and placement trends.",
    fields: [],
    readOnly: true,
  },
  candidates: {
    title: "Candidate Pool",
    description: "Review verified applicants for your openings and progress them through recruitment stages.",
    fields: [
      { key: "name", label: "Candidate" },
      { key: "dept", label: "Department" },
      { key: "cgpa", label: "CGPA" },
      { key: "stage", label: "Pipeline Stage", options: ["Applied", "Screened", "Shortlisted", "Interviewing", "Offer", "Rejected"] },
    ],
    canCreate: true,
    canDelete: true,
  },
  jobs: {
    title: "Job Openings",
    description: "Publish and administer active vacancies and hiring criteria for prospective graduates.",
    fields: [
      { key: "title", label: "Role title" },
      { key: "company", label: "Company" },
      { key: "location", label: "Location" },
      { key: "package", label: "Package" },
      { key: "status", label: "Status", options: ["Open", "Interviewing", "Closed"] },
    ],
    canCreate: true,
    canDelete: true,
  },
  interviews: {
    title: "Interview Schedule",
    description: "Coordinate candidate interview slots, manage panel sessions, and record feedback.",
    fields: [
      { key: "candidate", label: "Candidate name" },
      { key: "role", label: "Target role" },
      { key: "slot", label: "Interview slot (e.g. Thu, 11:00 AM)" },
      { key: "status", label: "Status", options: ["Scheduled", "Completed", "Cancelled"] },
    ],
    canCreate: true,
    canDelete: true,
  },
  insights: {
    title: "Hiring Funnel & Insights",
    description: "Recruiter pipeline metrics from initial candidate applications through final job offers.",
    fields: [],
    readOnly: true,
  },
  users: {
    title: "Platform User Management",
    description: "Manage system accounts, user privileges, and assigned portal roles.",
    fields: [
      { key: "name", label: "User name" },
      { key: "email", label: "University email" },
      { key: "role", label: "Assigned role", options: ["student", "admin", "recruiter", "super_admin"] },
      { key: "status", label: "Status", options: ["Active", "Suspended"] },
    ],
    canCreate: true,
    canDelete: true,
  },
  institutions: {
    title: "Registered Institutions",
    description: "Configure participating campuses and academic centres across the platform.",
    fields: [
      { key: "name", label: "Institution name" },
      { key: "location", label: "Campus location" },
      { key: "status", label: "Status", options: ["Active", "Pending", "Inactive"] },
    ],
    canCreate: true,
    canDelete: true,
  },
  permissions: {
    title: "Role & Permission Matrix",
    description: "Review and enforce operational access control definitions across each portal layer.",
    fields: [
      { key: "role", label: "Role" },
      { key: "access", label: "Access scope" },
    ],
    canCreate: true,
    canDelete: true,
  },
  settings: {
    title: "Platform & Institution Settings",
    description: "Configure central university information, contact channels, and system maintenance flags.",
    fields: [
      { key: "institutionName", label: "Institution name" },
      { key: "supportEmail", label: "Support email" },
      { key: "placementSeason", label: "Placement season" },
      { key: "portalStatus", label: "Portal operational status" },
      { key: "maintenanceMode", label: "Maintenance mode (true/false)" },
    ],
  },
  notifications: {
    title: "Notifications & Alerts",
    description: "Placement bulletins, drive announcements, and recruiter communications.",
    fields: [
      { key: "title", label: "Notification" },
      { key: "detail", label: "Details" },
      { key: "time", label: "Timestamp" },
    ],
    canDelete: true,
  },
};

function display(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Enabled" : "Disabled";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function getTone(value: string) {
  const normalized = value.toLowerCase();
  if (["eligible", "open", "active", "approved", "scheduled", "offer", "shortlisted"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (["applied", "hot", "shortlist", "interviewing", "screened"].includes(normalized)) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (["review", "pending", "ongoing"].includes(normalized)) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (["ineligible", "closed", "flagged", "cancelled", "rejected", "suspended"].includes(normalized)) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export function PortalResourcePage({ role, section }: { role: Role; section: string }) {
  const router = useRouter();
  const [data, setData] = useState<RecordValue | RecordValue[] | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [createValues, setCreateValues] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<RecordValue[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const page = config[section];

  const records = useMemo(() => {
    const source = Array.isArray(data) ? data : data ? [data] : [];
    return searchResults ?? source;
  }, [data, searchResults]);

  const loadData = useCallback(async (query = "") => {
    try {
      const suffix = query ? `?search=${encodeURIComponent(query)}` : "";
      const response = await fetch(`/api/portal/${section}${suffix}`, { cache: "no-store" });
      const payload = (await response.json()) as { success?: boolean; message?: string; data?: RecordValue | RecordValue[] };
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok || !payload.success || payload.data === undefined) {
        throw new Error(payload.message ?? "Unable to load page records.");
      }
      setError("");
      const loadedData = payload.data;
      setData(loadedData);
      setSearchResults(null);
      if (!Array.isArray(loadedData) && loadedData && page?.fields) {
        // Fix: do NOT put '—' into editable form fields
        setFormValues(
          Object.fromEntries(
            page.fields.map(({ key }) => {
              const value = loadedData[key];
              return [key, typeof value === "boolean" ? String(value) : value === null || value === undefined ? "" : String(value)];
            })
          )
        );
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load records.");
    } finally {
      setLoading(false);
    }
  }, [page, router, section]);

  useEffect(() => {
    let active = true;
    fetch(`/api/portal/${section}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as { success?: boolean; message?: string; data?: RecordValue | RecordValue[] };
        if (response.status === 401) {
          router.replace("/login");
          throw new Error("Your session has expired.");
        }
        if (!response.ok || !payload.success || payload.data === undefined) {
          throw new Error(payload.message ?? "Unable to load page records.");
        }
        return payload.data;
      })
      .then((loadedData) => {
        if (!active) return;
        setData(loadedData);
        if (!Array.isArray(loadedData) && loadedData && page?.fields) {
          // Fix: Clean form values without em dash placeholders
          setFormValues(
            Object.fromEntries(
              page.fields.map(({ key }) => {
                const value = loadedData[key];
                return [key, typeof value === "boolean" ? String(value) : value === null || value === undefined ? "" : String(value)];
              })
            )
          );
        }
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Unable to load records.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, router, section]);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      if (!search.trim()) {
        setSearchResults(null);
        return;
      }
      try {
        const response = await fetch(`/api/portal/${section}?search=${encodeURIComponent(search.trim())}`, { cache: "no-store" });
        const payload = (await response.json()) as { success?: boolean; message?: string; data?: RecordValue | RecordValue[] };
        if (!response.ok || !payload.success) throw new Error(payload.message ?? "Search failed.");
        setSearchResults(Array.isArray(payload.data) ? payload.data : payload.data ? [payload.data] : []);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Search failed.");
      }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [search, section]);

  async function mutate(method: "POST" | "PATCH" | "DELETE", body?: Record<string, unknown>, id?: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/portal/${section}${method === "DELETE" ? `?id=${encodeURIComponent(id ?? "")}` : ""}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "DELETE" ? undefined : JSON.stringify(body ?? {}),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) throw new Error(payload.message ?? "The operation could not be completed.");
      setNotice(payload.message ?? "Operation completed.");
      setShowCreateForm(false);
      await loadData(search);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The operation could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadFile(file?: File) {
    if (!file) return;
    if (file.type !== "application/pdf" || file.size > 2 * 1024 * 1024) {
      setError("Please choose a valid PDF file smaller than 2 MB.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const contentBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Unable to read this file."));
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.readAsDataURL(file);
      });
      const response = await fetch(`/api/portal/${section}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type, contentBase64 }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) throw new Error(payload.message ?? "Resume upload failed.");
      setNotice(payload.message ?? "Resume uploaded successfully.");
      await loadData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Resume upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadFile(id: string) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/portal/${section}?download=${encodeURIComponent(id)}`);
      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Unable to download this document.");
      }
      const file = await response.blob();
      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = url;
      const targetRecord = records.find((item) => item.id === id);
      anchor.download = targetRecord?.name ? String(targetRecord.name) : "resume.pdf";
      anchor.click();
      URL.revokeObjectURL(url);
      setNotice(`Downloaded ${anchor.download}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to download document.");
    } finally {
      setBusy(false);
    }
  }

  if (!page) return null;

  const dashboardPath = role === "super_admin" ? "/super-admin" : `/${role}`;
  const canCreate = Boolean(page.canCreate && section !== "applications");
  const isSingleRecord = !Array.isArray(data) && data !== null;

  // Chart data for insights
  const funnelData = [
    { name: "Applied", candidates: 240 },
    { name: "Screened", candidates: 180 },
    { name: "Shortlisted", candidates: 122 },
    { name: "Interviewing", candidates: 64 },
    { name: "Offers", candidates: 18 },
  ];

  // Department distribution for analytics
  const departmentData = [
    { department: "CSE", placed: 142, total: 160 },
    { department: "ECE", placed: 98, total: 120 },
    { department: "IT", placed: 84, total: 95 },
    { department: "ME", placed: 62, total: 80 },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 text-slate-900 lg:px-12">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href={dashboardPath} className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> Back to overview
          </Link>
          <h1 className="text-3xl font-semibold tracking-[-0.05em]">{page.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{page.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {canCreate && (
            <button
              type="button"
              onClick={() => {
                setShowCreateForm((shown) => !shown);
                setCreateValues({});
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1d2942]"
            >
              <Plus className="h-4 w-4" />
              {showCreateForm ? "Cancel" : `Add ${page.title.replace(/s$/, "")}`}
            </button>
          )}
        </div>
      </div>

      {/* Portal section navigation */}
      <nav aria-label="Portal sections" className="mb-6 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2">
        {portalSections[role].map((item) => {
          const href = item.slug ? `${dashboardPath}/${item.slug}` : dashboardPath;
          const active = item.slug === section;
          return (
            <Link
              key={item.slug || "overview"}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                active ? "bg-[#111827] text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Alerts */}
      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      {/* Special View: Documents Upload */}
      {section === "documents" && (
        <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-[#111827]">Upload placement resume</h2>
            <p className="mt-1 text-sm text-slate-500">Only PDF files are supported. Maximum allowed file size is 2 MB.</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1d2942]">
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            Choose PDF file
            <input type="file" accept="application/pdf" className="sr-only" disabled={busy} onChange={(event) => void uploadFile(event.target.files?.[0])} />
          </label>
        </section>
      )}

      {/* Special View: Student Application Opportunities */}
      {section === "applications" && role === "student" && (
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#111827]">Available Placement Drives</h2>
              <p className="mt-1 text-sm text-slate-500">Submit an application to participate in campus recruitment rounds.</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Live Campus Drive</span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {records.map((item) => {
              const isApplied = item.status === "Applied" || item.status === "Under Review" || item.status === "Shortlisted" || item.status === "Interviewing";
              return (
                <div key={String(item.id)} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">{display(item.company)}</p>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getTone(String(item.status ?? "Open"))}`}>
                        {display(item.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{display(item.role)}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>Package: <strong className="text-slate-700">{display(item.package)}</strong></span>
                      <span>Deadline: {display(item.deadline)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200">
                    {isApplied ? (
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Applied
                        </span>
                        <button
                          disabled={busy}
                          onClick={() => void mutate("POST", { withdrawId: item.id })}
                          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-red-600 disabled:opacity-50"
                        >
                          Withdraw
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={busy}
                        onClick={() => void mutate("POST", { opportunityId: item.id })}
                        className="w-full rounded-lg bg-[#111827] py-2 text-xs font-medium text-white transition hover:bg-[#1d2942] disabled:opacity-50"
                      >
                        Apply for role
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Special View: Analytics Visual Dashboard */}
      {section === "analytics" && (
        <section className="mb-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-slate-500">Eligible Students</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-semibold text-[#111827]">1,842</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">+8.4%</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-slate-500">Active Opportunities</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-semibold text-[#111827]">142</span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">+14 drives</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-slate-500">Drive Success Rate</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-semibold text-[#111827]">81%</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">+5.6%</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-slate-500">Pending Reviews</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-semibold text-[#111827]">37</span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">-9 verifications</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#111827]">Department Placement Distribution</h3>
                <p className="text-sm text-slate-500">Placed candidates vs eligible batch size by department.</p>
              </div>
              <BarChart3 className="h-5 w-5 text-[#4263EB]" />
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="department" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="placed" name="Placed Students" fill="#4263EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" name="Eligible Students" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* Special View: Recruiter Insights Pipeline */}
      {section === "insights" && (
        <section className="mb-8 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#111827]">Recruiter Hiring Funnel</h3>
                <p className="text-sm text-slate-500">Candidate progression through recruitment milestones.</p>
              </div>
              <TrendingUp className="h-5 w-5 text-[#16845B]" />
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis dataKey="name" type="category" stroke="#64748b" width={90} />
                  <Tooltip />
                  <Bar dataKey="candidates" name="Candidates" fill="#4263EB" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* Profile Form */}
      {section === "profile" && isSingleRecord && (
        <form
          className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void mutate("PATCH", { updates: formValues });
          }}
        >
          <div className="md:col-span-2 mb-2">
            <h2 className="text-xl font-semibold text-[#111827]">Edit Profile Details</h2>
            <p className="text-sm text-slate-500">Update verified contact and university placement credentials.</p>
          </div>
          {page.fields.map((field) => (
            <label key={field.key} className="grid gap-1.5 text-sm font-medium text-slate-700">
              {field.label}
              <input
                value={formValues[field.key] ?? ""}
                onChange={(event) => setFormValues((values) => ({ ...values, [field.key]: event.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-normal outline-none transition focus:border-[#4263EB] focus:bg-white"
              />
            </label>
          ))}
          <div className="md:col-span-2 mt-2">
            <button
              disabled={busy}
              type="submit"
              className="rounded-xl bg-[#111827] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#1d2942] disabled:opacity-50"
            >
              {busy ? "Saving..." : "Save profile changes"}
            </button>
          </div>
        </form>
      )}

      {/* Settings Form */}
      {section === "settings" && isSingleRecord && (
        <form
          className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void mutate("PATCH", {
              updates: {
                ...formValues,
                maintenanceMode: formValues.maintenanceMode === "true",
              },
            });
          }}
        >
          <div className="md:col-span-2 mb-2">
            <h2 className="text-xl font-semibold text-[#111827]">Platform Configuration</h2>
            <p className="text-sm text-slate-500">Administer institutional parameters and maintenance switches.</p>
          </div>
          {page.fields.map((field) => (
            <label key={field.key} className="grid gap-1.5 text-sm font-medium text-slate-700">
              {field.label}
              <input
                value={formValues[field.key] ?? ""}
                onChange={(event) => setFormValues((values) => ({ ...values, [field.key]: event.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-normal outline-none transition focus:border-[#4263EB] focus:bg-white"
              />
            </label>
          ))}
          <div className="md:col-span-2 mt-2">
            <button
              disabled={busy}
              type="submit"
              className="rounded-xl bg-[#111827] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#1d2942] disabled:opacity-50"
            >
              {busy ? "Updating..." : "Save platform settings"}
            </button>
          </div>
        </form>
      )}

      {/* Create Record Form */}
      {showCreateForm && canCreate && (
        <form
          className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void mutate("POST", createValues);
            setCreateValues({});
          }}
        >
          <div className="md:col-span-2 mb-2 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#111827]">New {page.title.replace(/s$/, "")} Record</h2>
              <p className="text-sm text-slate-500">Fill in the required information to create this item.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Dismiss
            </button>
          </div>
          {page.fields.map((field) => (
            <label key={field.key} className="grid gap-1.5 text-sm font-medium text-slate-700">
              {field.label}
              {field.options ? (
                <select
                  required
                  value={createValues[field.key] ?? field.options[0]}
                  onChange={(event) => setCreateValues((values) => ({ ...values, [field.key]: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal outline-none focus:border-[#4263EB]"
                >
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  required
                  value={createValues[field.key] ?? ""}
                  onChange={(event) => setCreateValues((values) => ({ ...values, [field.key]: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-normal outline-none transition focus:border-[#4263EB] focus:bg-white"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )}
            </label>
          ))}
          <div className="md:col-span-2 mt-2">
            <button
              disabled={busy}
              type="submit"
              className="rounded-xl bg-[#111827] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#1d2942] disabled:opacity-50"
            >
              {busy ? "Saving..." : `Create ${page.title.replace(/s$/, "")}`}
            </button>
          </div>
        </form>
      )}

      {/* Search Filter for list records */}
      {Array.isArray(data) && data.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${page.title.toLowerCase()} by name, role, department or status...`}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-xs text-slate-400 hover:text-slate-600">
              Clear
            </button>
          )}
        </div>
      )}

      {/* Main Records List / Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin text-[#4263EB]" />
            Loading {page.title.toLowerCase()}...
          </div>
        ) : error && !data ? (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-600">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError("");
                void loadData(search);
              }}
              className="mt-3 text-sm font-semibold text-[#4263EB] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-slate-800">No {page.title.toLowerCase()} found</p>
            <p className="mt-1 text-sm text-slate-500">
              {search ? "No records matched your search query." : "New records will be listed here as they become available."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {records.map((record, index) => {
              const id = String(record.id ?? index);
              const readOnly = page.readOnly;
              const hasStatus = record.status !== undefined;
              const hasStage = record.stage !== undefined;

              return (
                <article key={id} className="flex flex-col gap-4 p-5 transition hover:bg-slate-50/50 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-[#111827]">
                        {display(
                          record.name ??
                            record.title ??
                            record.label ??
                            record.company ??
                            record.role ??
                            record.candidate ??
                            record.institutionName ??
                            `Record ${index + 1}`
                        )}
                      </h2>
                      {hasStatus && (
                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${getTone(String(record.status))}`}>
                          {display(record.status)}
                        </span>
                      )}
                      {hasStage && (
                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${getTone(String(record.stage))}`}>
                          Stage: {display(record.stage)}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 grid gap-x-6 gap-y-1 text-sm text-slate-500 sm:grid-cols-2 xl:grid-cols-3">
                      {Object.entries(record)
                        .filter(([key]) => !["id", "contentBase64", "name", "title", "label", "company", "role", "candidate", "status", "stage"].includes(key))
                        .map(([key, value]) => (
                          <p key={key}>
                            <span className="capitalize text-slate-400">{key.replace(/([A-Z])/g, " $1")}: </span>
                            <span className="text-slate-700">{display(value)}</span>
                          </p>
                        ))}
                      {["company", "role", "candidate"]
                        .filter((key) => record[key] !== undefined)
                        .map((key) => (
                          <p key={key} className="capitalize">
                            <span className="text-slate-400">{key}: </span>
                            <span className="text-slate-700">{display(record[key])}</span>
                          </p>
                        ))}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {/* Document download */}
                    {section === "documents" && typeof record.id === "string" && (
                      <button
                        onClick={() => void downloadFile(record.id as string)}
                        disabled={busy}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        <Download className="h-3.5 w-3.5 text-[#4263EB]" /> Download
                      </button>
                    )}

                    {/* Notification mark as read */}
                    {section === "notifications" && record.read !== true && typeof record.id === "string" && (
                      <button
                        onClick={() => void mutate("PATCH", { id: record.id, updates: { read: true } })}
                        disabled={busy}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50"
                      >
                        Mark as read
                      </button>
                    )}

                    {/* Stage selector for candidates */}
                    {hasStage && !readOnly && typeof record.id === "string" && (
                      <select
                        disabled={busy}
                        value={String(record.stage)}
                        onChange={(e) => void mutate("PATCH", { id: record.id, updates: { stage: e.target.value } })}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm outline-none hover:border-slate-300"
                      >
                        {["Applied", "Screened", "Shortlisted", "Interviewing", "Offer", "Rejected"].map((stage) => (
                          <option key={stage} value={stage}>
                            Stage: {stage}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Status selector for status-bearing resources */}
                    {hasStatus && !readOnly && typeof record.id === "string" && section !== "notifications" && (
                      <select
                        disabled={busy}
                        value={String(record.status)}
                        onChange={(e) => void mutate("PATCH", { id: record.id, updates: { status: e.target.value } })}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm outline-none hover:border-slate-300"
                      >
                        {section === "applications" &&
                          ["Not applied", "Applied", "Under Review", "Shortlisted", "Interviewing", "Offered", "Rejected"].map((st) => (
                            <option key={st} value={st}>
                              Status: {st}
                            </option>
                          ))}
                        {section === "drives" &&
                          ["Open", "Ongoing", "Completed", "Closed"].map((st) => (
                            <option key={st} value={st}>
                              Status: {st}
                            </option>
                          ))}
                        {section === "students" &&
                          ["Eligible", "Review", "Placed", "Ineligible"].map((st) => (
                            <option key={st} value={st}>
                              Status: {st}
                            </option>
                          ))}
                        {section === "compliance" &&
                          ["Pending", "Review", "Approved", "Flagged"].map((st) => (
                            <option key={st} value={st}>
                              Status: {st}
                            </option>
                          ))}
                        {section === "jobs" &&
                          ["Open", "Interviewing", "Closed"].map((st) => (
                            <option key={st} value={st}>
                              Status: {st}
                            </option>
                          ))}
                        {section === "interviews" &&
                          ["Scheduled", "Completed", "Cancelled"].map((st) => (
                            <option key={st} value={st}>
                              Status: {st}
                            </option>
                          ))}
                        {section === "institutions" &&
                          ["Active", "Pending", "Inactive"].map((st) => (
                            <option key={st} value={st}>
                              Status: {st}
                            </option>
                          ))}
                        {section === "users" &&
                          ["Active", "Suspended"].map((st) => (
                            <option key={st} value={st}>
                              Status: {st}
                            </option>
                          ))}
                        {![
                          "applications",
                          "drives",
                          "students",
                          "compliance",
                          "jobs",
                          "interviews",
                          "institutions",
                          "users",
                        ].includes(section) &&
                          ["Open", "Closed"].map((st) => (
                            <option key={st} value={st}>
                              Status: {st}
                            </option>
                          ))}
                      </select>
                    )}

                    {/* Delete action */}
                    {page.canDelete && typeof record.id === "string" && (
                      <button
                        aria-label={`Delete record`}
                        onClick={() => void mutate("DELETE", undefined, record.id as string)}
                        disabled={busy}
                        title="Delete this record"
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition hover:border-red-200 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
