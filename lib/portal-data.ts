import {
  adminStudents,
  activityTimeline,
  companies,
  demoUsers,
  notifications,
  recruiterInterviews,
  recruiterPipeline,
  studentOpportunities,
  studentProfile,
  placementAnnouncements,
} from "@/lib/mock-data";
import type { Role } from "@/lib/types";

export type PortalRecord = Record<string, unknown>;

// Minimal valid PDF (268 bytes) for immediate testing and download
const SAMPLE_PDF_BASE64 = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000118 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n212\n%%EOF"
).toString("base64");

const initialData: Record<string, PortalRecord[] | PortalRecord> = {
  profile: { ...studentProfile },
  documents: [
    {
      id: "doc-1",
      name: "Aarav_Mehta_Resume_2025.pdf",
      size: 268,
      contentType: "application/pdf",
      uploadedAt: "2025-07-10T10:30:00.000Z",
      contentBase64: SAMPLE_PDF_BASE64,
    },
  ],
  companies: companies.map((company, index) => ({ id: `company-${index + 1}`, ...company })),
  applications: studentOpportunities.map((opportunity) => ({
    id: opportunity.id,
    company: opportunity.company,
    role: opportunity.role,
    package: opportunity.package,
    deadline: opportunity.deadline,
    status: opportunity.status === "Eligible" ? "Not applied" : opportunity.status,
  })),
  students: adminStudents.map((student, index) => ({ id: `student-${index + 1}`, ...student })),
  drives: studentOpportunities.map((opportunity) => ({
    id: opportunity.id,
    company: opportunity.company,
    role: opportunity.role,
    deadline: opportunity.deadline,
    status: "Open",
  })),
  compliance: [
    { id: "compliance-1", title: "Academic verification", detail: "7 student records need review", status: "Pending" },
    { id: "compliance-2", title: "Company approvals", detail: "2 company requests are waiting", status: "Pending" },
    { id: "compliance-3", title: "Eligibility checklist", detail: "Batch 2025 backlog audit complete", status: "Approved" },
  ],
  analytics: [
    { id: "analytics-1", label: "Eligible students", value: "1,842", change: "+8.4%" },
    { id: "analytics-2", label: "Open opportunities", value: "142", change: "+14" },
    { id: "analytics-3", label: "Drive success", value: "81%", change: "+5.6%" },
    { id: "analytics-4", label: "Pending verifications", value: "37", change: "-9" },
  ],
  candidates: adminStudents.map((student, index) => ({
    id: `candidate-${index + 1}`,
    ...student,
    company: "Apex Systems",
    stage: index === 0 ? "Interviewing" : index === 1 ? "Shortlisted" : index === 2 ? "Screened" : "Applied",
  })),
  jobs: studentOpportunities.map((opportunity) => ({
    id: opportunity.id,
    title: opportunity.role,
    company: opportunity.company,
    location: opportunity.location,
    package: opportunity.package,
    status: "Open",
  })),
  interviews: recruiterInterviews.map((interview, index) => ({
    id: `interview-${index + 1}`,
    ...interview,
    company: "Apex Systems",
    status: "Scheduled",
  })),
  insights: recruiterPipeline.map((stage, index) => ({ id: `insight-${index + 1}`, ...stage })),
  users: demoUsers.map(({ id, name, email, role, password }) => ({
    id,
    name,
    email,
    role,
    password: password ?? "password123",
    status: "Active",
  })),
  institutions: [
    { id: "institution-1", name: "CampusPulse Demo University", location: "India", status: "Active" },
    { id: "institution-2", name: "Apex Institute of Technology", location: "Bengaluru, India", status: "Active" },
  ],
  permissions: [
    { id: "permission-student", role: "student", access: "Profile, documents, companies, applications, notices" },
    { id: "permission-admin", role: "admin", access: "Students, drives, companies, compliance, analytics, notices" },
    { id: "permission-recruiter", role: "recruiter", access: "Jobs, candidate pipeline, interviews, applications, insights" },
    { id: "permission-super-admin", role: "super_admin", access: "Platform-wide administration, users, institutions, governance" },
  ],
  settings: {
    id: "platform-settings",
    institutionName: "CampusPulse Demo University",
    supportEmail: "support@campuspulse.edu",
    maintenanceMode: false,
    placementSeason: "2024-2025",
    portalStatus: "Online",
  },
  notifications: notifications.map((notification, index) => ({
    id: `notification-${index + 1}`,
    ...notification,
    read: false,
  })),
  activity: activityTimeline.map((activity, index) => ({ id: `activity-${index + 1}`, ...activity })),
  announcements: placementAnnouncements.map((announcement, index) => ({ id: `announcement-${index + 1}`, title: announcement })),
};

const data = structuredClone(initialData);

export const sectionRoles: Record<string, string[]> = {
  profile: ["student"],
  documents: ["student"],
  companies: ["student", "admin", "super_admin"],
  applications: ["student", "admin", "recruiter", "super_admin"],
  students: ["admin", "super_admin"],
  drives: ["admin", "super_admin"],
  compliance: ["admin", "super_admin"],
  analytics: ["admin", "super_admin"],
  candidates: ["recruiter", "admin", "super_admin"],
  jobs: ["recruiter", "admin", "super_admin"],
  interviews: ["recruiter", "admin", "super_admin"],
  insights: ["recruiter", "admin", "super_admin"],
  users: ["super_admin"],
  institutions: ["super_admin"],
  permissions: ["super_admin"],
  settings: ["super_admin"],
  notifications: ["student", "admin", "recruiter", "super_admin"],
  activity: ["student", "admin", "recruiter", "super_admin"],
  announcements: ["student", "admin", "super_admin"],
};

export function getPortalData(section: string) {
  const value = data[section];
  if (!value) return null;
  return structuredClone(value);
}

export function createPortalRecord(section: string, record: PortalRecord) {
  const current = data[section];
  if (!Array.isArray(current)) return null;
  const created = { ...record, id: crypto.randomUUID() };
  current.push(created);
  return created;
}

export function updatePortalRecord(section: string, id: string | undefined, updates: PortalRecord) {
  const current = data[section];
  if (!current) return null;

  if (!Array.isArray(current)) {
    const updated = { ...current, ...updates };
    data[section] = updated;
    return structuredClone(updated);
  }

  const index = current.findIndex((record) => record.id === id);
  if (index < 0) return null;
  current[index] = { ...current[index], ...updates };
  return structuredClone(current[index]);
}

export function deletePortalRecord(section: string, id: string) {
  const current = data[section];
  if (!Array.isArray(current)) return false;
  const index = current.findIndex((record) => record.id === id);
  if (index < 0) return false;
  current.splice(index, 1);
  return true;
}

export function getDocumentContent(id: string) {
  const current = data.documents;
  if (!Array.isArray(current)) return null;
  return current.find((record) => record.id === id) ?? null;
}

export function verifyUserCredentials(email: string, password: string) {
  const users = data.users;
  if (Array.isArray(users)) {
    const user = users.find((u) => String(u.email).toLowerCase() === email.toLowerCase());
    if (user && (user.password === password || (!user.password && password === "password123"))) {
      return {
        id: String(user.id),
        role: user.role as Role,
        name: String(user.name),
        email: String(user.email),
      };
    }
  }

  // Fallback to static demoUsers
  const fallback = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (fallback && fallback.password === password) {
    return {
      id: fallback.id,
      role: fallback.role,
      name: fallback.name,
      email: fallback.email,
    };
  }

  return null;
}

export function findUserByEmail(email: string) {
  const users = data.users;
  if (Array.isArray(users)) {
    const user = users.find((u) => String(u.email).toLowerCase() === email.toLowerCase());
    if (user) {
      return {
        id: String(user.id),
        name: String(user.name),
        email: String(user.email),
        role: user.role as Role,
      };
    }
  }
  const fallback = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (fallback) {
    return {
      id: fallback.id,
      name: fallback.name,
      email: fallback.email,
      role: fallback.role,
    };
  }
  return null;
}

export function findUserById(id: string) {
  const users = data.users;
  if (Array.isArray(users)) {
    const user = users.find((u) => String(u.id) === id);
    if (user) {
      return {
        id: String(user.id),
        name: String(user.name),
        email: String(user.email),
        role: user.role as Role,
      };
    }
  }
  const fallback = demoUsers.find((u) => u.id === id);
  if (fallback) {
    return {
      id: fallback.id,
      name: fallback.name,
      email: fallback.email,
      role: fallback.role,
    };
  }
  return null;
}

export function updateUserPassword(email: string, newPassword: string) {
  const users = data.users;
  if (Array.isArray(users)) {
    const user = users.find((u) => String(u.email).toLowerCase() === email.toLowerCase());
    if (user) {
      user.password = newPassword;
      return true;
    }
  }
  return false;
}
