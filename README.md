# CampusPulse — University Placement & Recruitment Intelligence Platform

CampusPulse is a Next.js 16 full-stack university placement platform with role-based environments for **Students**, **Placement Administrators**, **Recruiters**, and **Super Admins**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 3. Build & Run Production Mode
```bash
npm run build
npm run start
```

---

## 👥 Demo User Credentials (1-Click Login Supported)

The sign-in page at `/login` provides **1-Click Demo Login** buttons and pre-fill buttons for all 4 roles:

| Role | Name | Email | Password | Direct Portal |
| --- | --- | --- | --- | --- |
| **Student** | Aarav Mehta | `aarav.mehta@campus.edu.in` | `password123` | `/student` |
| **Placement Admin** | Meera Nair | `meera.nair@campus.edu` | `password123` | `/admin` |
| **Recruiter** | Rishi Agrawal | `rishi.agrawal@recruiter.io` | `password123` | `/recruiter` |
| **Super Admin** | Aisha Rao | `aisha.rao@campuspulse.edu` | `password123` | `/super-admin` |

---

## ✨ Feature Highlights & Improvements

1. **Authentication & Session Security**:
   - Cryptographically signed HS256 session token stored in an `httpOnly`, `sameSite: lax` cookie (`campuspulse.session`).
   - Server-side role validation on every route handler and portal resource.
   - Fully working password reset flow (`/forgot-password`) supporting instant demo account credential updates.
   - Hydration-safe React 19 external store state eliminating SSR/CSR flicker.

2. **Student Portal (`/student`)**:
   - **Overview Dashboard**: Live profile completion, active applications, unread notices, and timeline.
   - **Profile Manager** (`/student/profile`): Edit contact details, CGPA, graduation year, degree, and links.
   - **Documents & Resumes** (`/student/documents`): Download valid pre-seeded PDF resumes, upload new PDF files (up to 2 MB), and delete documents.
   - **Available Opportunities & Applications** (`/student/applications`): Apply for eligible campus drives with 1-click, view live application status, or withdraw applications.
   - **Company Explorer** (`/student/companies`): Search visiting companies, package ranges, and open roles.
   - **Notifications** (`/student/notifications`): View and mark notifications as read.

3. **Placement Admin Portal (`/admin`)**:
   - **Command Center Overview**: Batch health checks, compliance queues, and quick metrics.
   - **Student Management** (`/admin/students`): Search students, filter by department, update eligibility status (`Eligible`, `Review`, `Placed`, `Ineligible`), and add new student records.
   - **Placement Drives** (`/admin/drives`): Schedule drives, set deadlines, and manage drive status (`Open`, `Ongoing`, `Completed`, `Closed`).
   - **Compliance Queue** (`/admin/compliance`): Review and approve verification checks (`Pending`, `Review`, `Approved`, `Flagged`).
   - **Placement Analytics** (`/admin/analytics`): Interactive Recharts bar charts showing department distributions and placement success rates.

4. **Recruiter Portal (`/recruiter`)**:
   - **Recruiter Workspace**: Candidate funnel metrics, shortlists, scheduled interviews, and offers.
   - **Candidate Pool** (`/recruiter/candidates`): Advance applicants through hiring stages (`Applied`, `Screened`, `Shortlisted`, `Interviewing`, `Offer`, `Rejected`).
   - **Job Postings** (`/recruiter/jobs`): Create, manage, and close company openings.
   - **Interviews** (`/recruiter/interviews`): Coordinate interview slots with scheduled and completed flags.
   - **Hiring Funnel** (`/recruiter/insights`): Interactive recruitment funnel visualization powered by Recharts.

5. **Super Admin Portal (`/super-admin`)**:
   - **Platform Governance**: Overall system metrics, registered institutions, and active role groups.
   - **User Administration** (`/super-admin/users`): Create, edit, and suspend users across all four roles; newly created users can sign in immediately.
   - **Campus Institutions** (`/super-admin/institutions`): Register partner institutions and manage campus locations.
   - **Permissions Matrix** (`/super-admin/permissions`): Audit access control policies.
   - **Platform Settings** (`/super-admin/settings`): Configure university details, placement season, and support contact channels.

6. **Design & Theming**:
   - Full Light/Dark mode with automatic local storage persistence.
   - Responsive layout for desktop, tablet, and mobile.
   - Clean, modern SaaS design inspired by modern enterprise tooling.
