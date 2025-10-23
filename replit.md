# AkashOne.com - Cloud Management Portal

## Overview
AkashOne.com is a comprehensive cloud management platform by Mieux Technologies Pvt Ltd, offering VM provisioning, resource monitoring, network management, and advanced GST-compliant billing for the Indian market. It features reseller white-labeling, hierarchical multi-tenant administration, secure 2FA authentication, Kubernetes-as-a-Service (KaaS), Database-as-a-Service (DBaaS), and dynamic feature management. The platform aims to be an all-encompassing, secure, and flexible cloud infrastructure management solution.

## User Preferences
### Branding
- Main Brand: **AkashOne.com**
- Company: **Mieux Technologies Pvt Ltd**
- Domain focus: Cloud infrastructure management for Indian market
- GST-compliant billing required

### Design System
- Theme: Dark mode primary with light mode support
- Fonts: Inter (UI), JetBrains Mono (code/technical)
- Color Scheme: Modern SaaS dashboard aesthetic
- Components: Shadcn UI with Tailwind CSS

### Features Priority
1. Kubernetes-as-a-Service (KaaS) with one-click deployment ✅
2. Database-as-a-Service (DBaaS) with MySQL/PostgreSQL/MongoDB/Redis ✅
3. Authentication with password and 2FA support ✅
4. Indian GST billing with invoice management ✅
5. Reseller white-label capabilities ✅
6. Super admin hierarchical tenant management ✅
7. Marketplace/Templates for application stacks (Pending)
8. Advanced monitoring with real-time alerts (Pending)
9. Payment gateway integration (Stripe, Razorpay, PayPal) (Pending)
10. DNS-as-a-Service (Pending)
11. Helpdesk/Support tickets system (Pending)
12. Terraform integration (Pending)

## System Architecture
AkashOne.com employs a clear separation between its frontend and backend components.

### UI/UX Decisions
The frontend, built with React, TypeScript, and Vite, uses Wouter for routing and TanStack Query for data management. The UI follows a modern SaaS aesthetic with Shadcn UI, Tailwind CSS, Radix UI, and Lucide icons, supporting both dark and light modes. Dynamic sidebar navigation adapts based on user roles and enabled features.

### Technical Implementations
The backend is an Express.js application in TypeScript, utilizing a MemStorage pattern with PostgreSQL (Drizzle ORM) for persistence. Authentication is session-based via Passport.js, bcrypt for password hashing, and otplib/QRCode for TOTP 2FA. It integrates with CloudStack APIs for VM lifecycle management and employs a comprehensive Role-Based Access Control (RBAC) system with multi-tenant isolation. A Feature Management System dynamically controls UI elements and API access. Key features include KaaS, DBaaS, VM Snapshot/Backup, and a hybrid service plan system. The GST billing system handles automated tax calculations with fractional paise precision and generates compliant invoices.

### Feature Specifications
- **CloudStack Integration:** Full API integration for VM provisioning, lifecycle, and snapshot operations, including async job polling and dynamic service plan selection.
- **Hybrid Service Plan System:** Custom service plans with flexible resource specifications, pricing, and visibility.
- **Identity and Access Management (IAM):** Comprehensive RBAC with system-defined and custom roles, granular permissions, and multi-tenant team management.
- **Feature Management:** Centralized system for dynamic feature toggling, impacting UI and API routes.
- **VM Snapshot/Backup:** UI and backend support for creating, listing, restoring, and deleting VM snapshots.
- **Kubernetes-as-a-Service (KaaS) & Database-as-a-Service (DBaaS):** One-click provisioning and management of Kubernetes clusters and managed database instances (MySQL, PostgreSQL, MongoDB, Redis).
- **Authentication:** Secure username/password and TOTP 2FA.
- **GST-Compliant Billing:** Automated tax calculation (CGST/SGST/IGST), usage tracking, and invoice generation adhering to Indian tax laws (HSN/SAC codes, state-based logic, fractional paise precision).
- **CloudStack Features:** Includes Firewall Rules, NAT Gateways, SSH Keys, ISO Images, Reserved IPs, IPsec VPN Tunnels, Load Balancers, SSL Certificates, Object Storage (S3), DDoS Protection, and CDN Distributions.

### System Design Choices
- Session-based authentication with secure cookies.
- MemStorage pattern with PostgreSQL migration path.
- React Query for data fetching and caching.
- Server-side rendering with client-side hydration.
- Multi-tenancy achieved via `userId` isolation, `cloudstackId` for CloudStack integration, and resource metadata caching across all database schemas.

### Database Schema Highlights
- **Core:** `users`, `virtual_machines`, `vm_snapshots`, `kubernetes_clusters`, `databases`, `feature_flags`.
- **RBAC & IAM:** `roles`, `permissions`, `role_permissions`, `user_roles`, `team_members`.
- **CloudStack Infrastructure:** `firewall_rules`, `nat_gateways`, `ssh_keys`, `iso_images`, `reserved_ips`, `ipsec_tunnels`, `load_balancers`, `ssl_certificates`, `object_storage_buckets`, `ddos_protection_rules`, `cdn_distributions`, `dns_zones`, `block_storage_volumes`, `vpcs`.
- **GST-Compliant Billing:** `billing_addresses`, `invoices`, `invoice_line_items`, `usage_records`, `payment_methods`, `payment_transactions`, `tax_calculations`.

## External Dependencies
- **PostgreSQL:** Primary database for persistent storage, managed via Drizzle ORM.
- **CloudStack API:** Integrated for VM management, provisioning, lifecycle operations, and snapshots. Requires `CLOUDSTACK_API_URL`, `CLOUDSTACK_API_KEY`, and `CLOUDSTACK_SECRET_KEY`.
- **Stripe, Razorpay, PayPal:** Planned integrations for payment gateways.
- **otplib & QRCode:** Used for Two-Factor Authentication (TOTP).
- **bcrypt:** Used for password hashing.
- **Passport.js:** Authentication middleware.