# Track Mo: University MOA Monitoring System
**Midterm Project for Professional Elective 2**  
**Author:** Bai Sakina Abad  
**Institution:** New Era University  
**Live Application:** [neu-track-mo.vercel.app](https://neu-track-mo.vercel.app)

_some features are still being developed and tested_

---

## 1. Project Overview
**Track Mo** is a centralized web-based repository engineered for New Era University (NEU) to meticulously manage and monitor Memorandum of Agreements (MOAs). The platform facilitates the entire partnership lifecycle—from initial legal review and processing to final approval and expiration tracking. It serves as a "single source of truth," ensuring that all university departments maintain valid, active, and legally compliant collaborations with Host Training Establishments (HTEs).

## 2. Problem Statement
The conventional methodology for tracking university MOAs is often characterized by fragmented physical filing systems or localized spreadsheets. This lack of digitization presents several critical institutional risks:
*   **Operational Blind Spots:** Inability to track the real-time status of pending agreements across diverse colleges.
*   **Compliance & Legal Risk:** Unintentional reliance on expired agreements due to the absence of automated monitoring and renewal alerts.
*   **Data Siloing:** Redundant or conflicting records of the same partnership across different departments, leading to administrative confusion.
*   **Audit Deficiencies:** Difficulty in maintaining a transparent, immutable trail of administrative modifications and endorsements.

## 3. System Architecture
The application is built on a modern, cloud-native serverless architecture designed for real-time data synchronization and secure, role-based access:

1.  **Authentication Layer (Firebase Auth):** Enforces security by restricting access to institutional `@neu.edu.ph` Google accounts. 
2.  **Onboarding & Identity Management:** A specialized flow captures the user's College Department upon first login, anchoring their identity within the system.
3.  **Data Persistence Layer (Cloud Firestore):** A NoSQL document database stores MOA records, user profiles, and audit logs. Security rules at the database level ensure strict data isolation based on user roles.
4.  **Admin Intelligence Dashboard:** Aggregates live Firestore data into actionable insights, providing real-time statistics on partnership distribution and agreement statuses.
5.  **Immutable Audit Engine:** Automated logging of every CRUD operation (Create, Read, Update, Delete) to ensure total accountability and data integrity.

## 4. Functional Requirements

### **Administrative Control (Admin)**
*   **User Governance:** Monitor last login activity and the ability to block/unblock accounts.
*   **Comprehensive Audit Trail:** Visibility into the system's history for compliance monitoring.
*   **Global CRUD Access:** Full lifecycle management of all MOA records across the institution.
*   **System Analytics:** Access to the high-level dashboard with partnership distribution charts.

### **Faculty & Staff Operations (Faculty)**
*   **Departmental Management:** Create and update MOA records specific to their endorsed college.
*   **Status Tracking:** Monitor the real-time processing stage of their department's partnerships.
*   **Soft-Delete Recovery:** Ability to recover archived records from the system's "Recycle Bin."

### **Student View (Student)**
*   **Repository Access:** Read-only access to the list of active, approved, and valid HTE partnerships.
*   **Discovery Tools:** Advanced filtering by industry type or company name to facilitate internship searching.

## 5. Technical Stack
*   **Frontend Framework:** [Next.js 15+](https://nextjs.org/) (App Router) – Utilizing React Server Components (RSC) for performance and SEO.
*   **Interface Design:** [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/) – Providing a responsive, professional, and accessible UI.
*   **Backend as a Service (BaaS):** [Firebase](https://firebase.google.com/)
    *   **Firestore:** Real-time NoSQL database for flexible data modeling.
    *   **Authentication:** Secure Google OAuth with domain-specific filtering.
*   **Hosting & CI/CD:** [Vercel](https://vercel.com/) – Optimized deployment and automated build pipelines.
*   **AI Integration:** [Genkit & Gemini](https://firebase.google.com/docs/genkit) – Future-ready architecture for intelligent partnership analysis.

---
© 2026 New Era University | Professional Elective 2 Midterm Project