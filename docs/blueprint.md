# **App Name**: MOA Track

## Core Features:

- Secure User Authentication: User login via institutional Google accounts (@neu.edu.ph emails only), enforcing a secure and familiar authentication method.
- Role-Based Access Control: Strict enforcement of permissions based on user roles: Students view limited 'APPROVED' MOAs, Faculty view all active MOAs (excluding audit trails), and Admins have full CRUD access, user management capabilities, and audit trail visibility.
- MOA Data Management: Admins can add, edit, soft-delete, and recover MOA entries with comprehensive fields including HTEID, company details, industry type, effective dates, status, endorsed college, and a dedicated audit trail.
- MOA Status & Tracking: System to classify and display MOAs by current status (APPROVED with sub-statuses, PROCESSING, EXPIRED, EXPIRING) across relevant user dashboards.
- Interactive Dashboards & Filtering: Role-specific dashboards providing tailored views of MOAs, including statistical cards for MOA counts (active, processing, expired) filterable by college and date range, with a general search bar by college, industry type, status, contact, and company information.
- Comprehensive Audit Trail: Automated logging of all MOA modifications (creation, edits, soft-deletions) including the user, timestamp, and specific operation, accessible exclusively to Administrators to ensure data integrity and accountability.

## Style Guidelines:

- Primary Color: A deep institutional blue (#023876) reflecting professionalism and university branding, used for interactive elements and key headings. Derived from HSL(214, 96%, 23%).
- Background Color: Crisp white (#FFFFFF) for main content areas, ensuring maximum readability and a clean aesthetic as requested.
- Accent Color: A vibrant, clear turquoise-cyan (#30E8DD) used sparingly for highlights, calls-to-action, and to draw attention to important information, providing an analogous contrast. Derived from HSL(184, 80%, 55%).
- Font: 'Inter' (sans-serif) for all text elements. This modern, objective, and highly legible typeface ensures clarity and consistency across dashboards, tables, and forms, suitable for a professional university application.
- Utilize a consistent set of clear, functional, and professional system icons that support quick understanding of actions and information without unnecessary stylistic flourishes.
- Implement a clean, hierarchical layout with dashboard-centric views for each user role. Employ clear data tables for MOA listings and intuitive input forms for data management. Ensure a responsive design to maintain usability across various devices.
- Incorporate subtle hover effects on clickable elements and smooth transitions for state changes or dashboard filters to provide a polished user experience without distractions.