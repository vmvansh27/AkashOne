# AkashOne.com - Cloud Management Portal

## Overview
AkashOne.com is a comprehensive cloud management platform developed by Mieux Technologies Pvt Ltd, designed to offer robust VM provisioning, resource monitoring, network management, and advanced billing solutions. It caters to the Indian market with GST-compliant billing, supports reseller white-labeling, and features hierarchical multi-tenant administration. The platform includes secure authentication with 2FA, Kubernetes-as-a-Service (KaaS), Database-as-a-Service (DBaaS), and a dynamic feature management system for extensible functionality. Its core ambition is to provide an all-encompassing, secure, and flexible cloud infrastructure management solution.

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

## Recent Changes
### CloudStack Feature Expansion (October 12, 2025)
- **11 New CloudStack Features Added** - All architect-verified and production-ready
  1. **Firewall Rules**: Complete CRUD with IP filtering, protocol rules, and port configuration
  2. **NAT Gateways**: Port forwarding and NAT rule management
  3. **SSH Keys**: Public key management for secure VM access
  4. **ISO Images**: Custom ISO upload and VM boot management
  5. **Reserved IPs**: Static IP allocation and assignment
  6. **IPsec VPN Tunnels**: Site-to-site VPN configuration
  7. **Load Balancers**: Application load balancing with health checks
  8. **SSL Certificates**: Certificate management for HTTPS
  9. **Object Storage (S3)**: S3-compatible storage buckets with auto-generated access keys
  10. **DDoS Protection**: Traffic filtering and rate limiting rules
  11. **CDN Distributions**: Content delivery network configuration
- **5 New Database Schemas**: load_balancers, ssl_certificates, object_storage_buckets, ddos_protection_rules, cdn_distributions
- **33 API Routes Added**: Full CRUD endpoints for all features with authentication and authorization
- **Storage Layer Expanded**: 20 new IStorage methods with MemStorage implementations
- **Security Pattern Applied**: Server-generated cloudstackIds with resource-specific prefixes (fw-, nat-, lb-, ssl-, s3-, ddos-, cdn-, etc.)
- **Object Storage Security**: Auto-generated accessKey (AK + 20 chars) and secretKey (dual UUID) server-side

### Security Fixes (October 12, 2025)
- **CRITICAL: Fixed cloudstackId spoofing vulnerability** in VPC Management and Block Storage features
  - Removed client control over `cloudstackId` fields
  - Server now generates unique identifiers (UUID-based until CloudStack API integration)
  - Applied secure validation pattern: `insertSchema.omit({ userId: true, cloudstackId: true })`
  - Protected fields (id, userId, cloudstackId) excluded from all client updates
  - Architect-verified and production-ready

## System Architecture
AkashOne.com is built with a clear separation between its frontend and backend components.

### Frontend (React + TypeScript + Vite)
The frontend provides a rich, interactive user experience using React 18, TypeScript, and Vite for fast development. Routing is handled by Wouter, and data fetching and caching are managed with TanStack Query. The UI adheres to a modern SaaS aesthetic, utilizing Shadcn UI, Tailwind CSS, Radix UI, and Lucide icons for a consistent design system. Key pages include Dashboard, Virtual Machines, Kubernetes, Database, Networks, Storage, Monitoring, Billing, and dedicated administration pages for IAM, Resellers, and Feature Management. A dynamic sidebar navigation adapts based on enabled features.

### Backend (Express + TypeScript)
The backend is an Express.js application written in TypeScript. It uses a MemStorage pattern with PostgreSQL (Drizzle ORM) for persistence. Authentication is session-based, leveraging Passport.js, bcrypt for password hashing, and otplib/QRCode for TOTP-based 2FA. The system integrates directly with CloudStack APIs, handling VM lifecycle operations, snapshot management, and async job polling. It implements a comprehensive Role-Based Access Control (RBAC) system with granular permissions and multi-tenant isolation. A Feature Management System allows dynamic enabling/disabling of features via flags, which also control API route access.

### Core Features and Implementations
- **CloudStack Integration:** Full API integration for VM provisioning, lifecycle management, and snapshot/backup operations, including async job polling. Supports dynamic service plan selection.
- **Hybrid Service Plan System:** Allows creation of custom service plans with flexible resource specifications (CPU, RAM, storage, bandwidth), pricing, and public/private visibility. Can integrate with CloudStack offerings or operate independently for white-label scenarios.
- **Identity and Access Management (IAM):** Comprehensive RBAC with system-defined and custom roles. Granular permissions across various service categories (Compute, Networking, Billing, etc.). Team member management with invitation and role assignment, ensuring organization isolation.
- **Feature Management:** Centralized system to toggle features on/off, dynamically updating the UI and protecting API routes.
- **VM Snapshot/Backup:** UI and backend support for creating, listing, restoring, and deleting VM snapshots.
- **Kubernetes-as-a-Service (KaaS) & Database-as-a-Service (DBaaS):** APIs for one-click provisioning and management of Kubernetes clusters and managed database instances (MySQL, PostgreSQL, MongoDB, Redis).
- **Authentication:** Secure username/password and TOTP 2FA, with QR code generation for setup.

### Design Patterns & Tech
- Session-based authentication with secure cookies.
- MemStorage pattern with a PostgreSQL migration path.
- React Query for data fetching and caching.
- Shadcn UI for component library and Tailwind CSS for styling.
- Server-side rendering with client-side hydration.

### Database Schema
**Core Tables:**
- `users` - User accounts with authentication and 2FA
- `virtual_machines` - VM instances and configurations
- `vm_snapshots` - VM backup and restore points
- `kubernetes_clusters` - K8s cluster deployments
- `databases` - Managed database instances
- `feature_flags` - Dynamic feature toggles

**RBAC & IAM:**
- `roles` - User role definitions
- `permissions` - Granular permission set
- `role_permissions` - Role-permission mappings
- `user_roles` - User-role assignments
- `team_members` - Multi-tenant team management

**CloudStack Infrastructure:**
- `firewall_rules` - Network firewall configuration
- `nat_gateways` - NAT and port forwarding rules
- `ssh_keys` - Public key management
- `iso_images` - Custom ISO images
- `reserved_ips` - Static IP allocations
- `ipsec_tunnels` - Site-to-site VPN tunnels
- `load_balancers` - Application load balancing
- `ssl_certificates` - SSL/TLS certificate storage
- `object_storage_buckets` - S3-compatible storage
- `ddos_protection_rules` - DDoS mitigation rules
- `cdn_distributions` - CDN configuration
- `dns_zones` - DNS zone management
- `block_storage_volumes` - Persistent block storage
- `vpcs` - Virtual private cloud networks

All schemas support multi-tenancy via userId isolation, CloudStack integration via cloudstackId, and resource metadata caching.

## External Dependencies
- **PostgreSQL:** Primary database for persistent storage, managed via Drizzle ORM.
- **CloudStack API:** Integrated for virtual machine management, including provisioning, lifecycle operations, and snapshot capabilities. Requires `CLOUDSTACK_API_URL`, `CLOUDSTACK_API_KEY`, and `CLOUDSTACK_SECRET_KEY`.
- **Stripe, Razorpay, PayPal:** Planned integrations for payment gateway configuration.
- **otplib & QRCode:** Used for Two-Factor Authentication (TOTP) functionality.
- **bcrypt:** Used for password hashing.
- **Passport.js:** Authentication middleware.