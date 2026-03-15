# Track Mo: University MOA Monitoring System
**Midterm Project for Software Development 2**  
**Live Application:** [neu-track-mo.vercel.app](https://neu-track-mo.vercel.app)

---

## 1. Project Overview
**Track Mo** is a centralized web-based repository designed for New Era University (NEU) to manage and monitor Memorandum of Agreements (MOAs) between the institution and its various Host Training Establishments (HTEs). The system streamlines the partnership lifecycle—from initial processing and legal review to final approval and expiration tracking—ensuring that all university departments maintain valid and active collaborations.

## 2. Problem Statement
The traditional method of tracking university MOAs often relies on fragmented physical filing systems or disparate spreadsheets managed by individual colleges. This manual approach leads to several critical issues:
*   **Lack of Visibility:** Difficulty in tracking the real-time status of pending agreements across different colleges.
*   **Compliance Risks:** Unintentional use of expired agreements due to the absence of automated renewal alerts.
*   **Data Inconsistency:** Redundant or conflicting records of the same partnership across different departments.
*   **Audit Difficulty:** No centralized trail of who modified a record or when a partnership was officially endorsed.

Digitalizing MOA tracking is necessary to ensure institutional compliance, improve administrative efficiency, and provide a single source of truth for all university-industry partnerships.

## 3. System Architecture
The application follows a modern cloud-native architecture designed for real-time synchronization and secure access:

1.  **Authentication Layer (Firebase Auth):** Users authenticate using institutional `@neu.edu.ph` accounts. The system enforces domain-specific access control.
2.  **Authorization & Onboarding:** Upon first login, users are routed to an onboarding flow to select their College Department, which is stored in their profile.
3.  **Data Layer (Cloud Firestore):** All MOA records, user profiles, and audit logs are stored in a NoSQL document database. Security rules ensure that users only access data permitted by their roles.
4.  **Admin Dashboard:** A centralized interface that aggregates Firestore data into real-time statistics (Active vs. Expired MOAs) and college-wise distribution charts.
5.  **Audit Engine:** Every creation, update, or deletion triggers a background audit log entry, ensuring a transparent history of administrative actions.

## 4. Functional Requirements

### **Admin Features**
*   **User Management:** Ability to block/unblock users and monitor last login activities.
*   **Audit Trail:** View and export a comprehensive log of all system operations.
*   **System Overview:** Access to the full dashboard with partnership distribution analytics.
*   **Full CRUD:** Create, read, update, and "soft delete" any MOA record.

### **Faculty Features**
*   **Partnership Management:** Create and update MOA records specifically for their endorsed college.
*   **Dashboard Access:** View real-time status of agreements belonging to their department.
*   **Recycle Bin:** Recover accidentally deleted records via the soft-delete mechanism.

### **Student Features**
*   **Repository Access:** View-only access to a list of active and approved partnerships.
*   **Search & Filter:** Easily find HTEs by industry type or company name for internship opportunities.

## 5. Technical Stack
*   **Framework:** [Next.js 15+](https://nextjs.org/) (App Router) for high-performance server-side rendering and routing.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) and [ShadCN UI](https://ui.shadcn.com/) for a modern, responsive, and accessible user interface.
*   **Backend-as-a-Service:** [Firebase](https://firebase.google.com/)
    *   **Firestore:** Real-time NoSQL database for MOA and User data.
    *   **Authentication:** Secure Google and Email/Password sign-in with institutional domain filtering.
*   **Deployment:** [Vercel](https://vercel.com/) for continuous integration and global hosting.
*   **AI Integration:** [Genkit & Gemini](https://firebase.google.com/docs/genkit) for future-proofing with intelligent partnership insights.

## 6. Database Schema
The system utilizes three primary collections in Cloud Firestore:

### **`users` Collection**
Stores profile information and access levels.
*   `id` (String): Unique Firebase UID.
*   `name` (String): Full name of the user.
*   `email` (String): Institutional email address.
*   `role` (Enum): `ADMIN`, `FACULTY`, or `STUDENT`.
*   `college` (String): The associated college (e.g., CICS, CET, CBA).
*   `isBlocked` (Boolean): Flag for administrative access control.

### **`moas` Collection**
The core repository of partnership agreements.
*   `companyName` (String): Official name of the HTE.
*   `status` (String): Current phase (e.g., `APPROVED_SIGNED`, `PROCESSING_LEGAL`).
*   `effectiveDate` / `expiryDate` (ISO Date): Agreement duration.
*   `endorsedByCollege` (String): The college that initiated the partnership.
*   `isDeleted` (Boolean): Used for soft-deletion and recovery.

### **`audit_logs` Collection**
Immutable record of system changes.
*   `operation` (String): `CREATE`, `UPDATE`, `SOFT_DELETE`, `RECOVER`.
*   `userId` / `userName` (String): Identifies the actor.
*   `moaName` (String): The target record of the operation.
*   `timestamp` (ISO DateTime): Precise time of the action.

---
© 2024 New Era University - Midterm Project in Software Development 2