# AkashOne.com - Cloud Management Portal

**Unit of Mieux Technologies Pvt Ltd**

## Overview

AkashOne.com is a comprehensive CloudStack management platform featuring VM provisioning, resource monitoring, network management, Indian GST-compliant billing, reseller white-label capabilities, hierarchical multi-tenant administration, and secure authentication with 2FA support.

## Recent Changes

### October 2025 - Major Feature Additions

#### Feature Management System ✅
- **Super Admin Feature Toggle System:**
  - Centralized feature flag management with enable/disable controls
  - Features organized by category (Compute, Networking, Billing, Storage)
  - Dynamic sidebar navigation that shows/hides features based on flags
  - Feature flag middleware for API route protection
  - 7 new feature pages with professional placeholder UIs:
    - Payment Gateway Configuration (Stripe, Razorpay, PayPal)
    - Interactive Pricing Calculator
    - Load Balancer Service
    - GPU Instances (NVIDIA T4, A100, V100)
    - SSL Certificate Manager (Let's Encrypt integration)
    - CDN Service (Global content delivery)
    - VM Auto-Scaling Groups
  - All new features start disabled and can be enabled when backend is ready
  - Real-time navigation updates without page reload
  - Full integration with existing authentication and multi-tenant system

#### Virtual Machine Management with CloudStack Integration ✅
- Full CloudStack API integration with HMAC SHA1 authentication
- Async job polling for VM lifecycle operations
- VM provisioning wizard with zone, template, and service offering selection
- Real-time VM state management (Running, Stopped, Starting, etc.)
- VM lifecycle controls: Start, Stop, Reboot, Destroy
- Resource monitoring: CPU, memory, IP addresses
- VM caching in PostgreSQL for fast queries
- Form validation to prevent zone/template mismatches
- Complete ownership verification and multi-tenant security
- **VM Snapshot/Backup System:**
  - Create VM snapshots with custom names and descriptions
  - List all snapshots for each VM
  - Restore VM to previous snapshot state
  - Delete snapshots when no longer needed
  - Full snapshot management UI in VM dialog
  - CloudStack async job polling for all snapshot operations
  - Ownership verification on all snapshot operations

#### Kubernetes-as-a-Service (KaaS)
- One-click Kubernetes cluster deployment with version selection
- Master and worker node configuration
- Auto-healing and auto-scaling capabilities
- Resource monitoring (CPU, memory, pods)
- Cluster health monitoring
- Full CRUD operations via API

#### Database-as-a-Service (DBaaS)
- Managed database instances (MySQL, PostgreSQL, MongoDB, Redis)
- One-click provisioning with version selection
- Automated backups and Multi-AZ deployment options
- Connection management and monitoring
- Storage and resource configuration
- Full CRUD operations via API

#### Authentication System
- Username/password authentication with bcrypt hashing
- TOTP-based two-factor authentication (2FA)
- QR code generation for authenticator apps
- Session-based authentication
- Security settings page for 2FA management

#### Identity and Access Management (IAM) System ✅
- **Comprehensive RBAC (Role-Based Access Control):**
  - System roles: Admin, Editor, Viewer (predefined, cannot be deleted)
  - Custom roles: Create organization-specific roles with custom permissions
  - Granular permissions organized by category (Compute, Networking, Storage, Billing, IAM)
  - Permission categories: VM operations, Kubernetes, Database, DNS, Object Storage, Billing, Team Management
- **Team Member Management:**
  - Invite team members to organization via email
  - Team member status tracking (invited, active, inactive)
  - Assign multiple roles to team members
  - Remove team members and revoke access
  - View all team members with their assigned roles
- **Role Management UI:**
  - View all system and custom roles
  - Create custom roles with descriptive names
  - Edit custom role details (system roles are read-only)
  - Delete custom roles (with protection for system roles)
  - Manage role permissions via checkbox interface
  - Permission organization by category for easy management
- **Automatic Role Assignment:**
  - New users automatically assigned Admin role on registration
  - Enables immediate full access for organization owners
- **API Security:**
  - Permission checks on all IAM routes (team.manage, team.view, iam.manage, iam.view)
  - Organization isolation - users can only see/manage their organization's data
  - System role protection - prevents modification/deletion of built-in roles
- **Default Permissions:**
  - VM: view, create, update, delete
  - Kubernetes: view, create, delete
  - Database: view, create, delete
  - Network: view, create
  - DNS: view, manage
  - Storage: view, manage
  - Billing: view, manage
  - IAM: view, manage
  - Team: view, manage

## Project Architecture

### Frontend (React + TypeScript + Vite)
- **Pages:**
  - Dashboard - Overview of cloud infrastructure
  - Virtual Machines - VM management
  - Kubernetes - K8s cluster management
  - Database - DBaaS management
  - Networks - Network configuration
  - Storage - Storage management
  - Monitoring - Resource monitoring with real-time metrics
  - Billing - Indian GST-compliant billing with CGST/SGST/IGST
  - Payment Gateways - Payment provider configuration (Stripe, Razorpay, PayPal)
  - Pricing Calculator - Infrastructure cost estimation tool
  - Load Balancer - High-availability load balancing service
  - GPU Instances - NVIDIA GPU compute for AI/ML workloads
  - SSL Certificates - Automated SSL/TLS certificate management
  - CDN Service - Global content delivery network
  - Auto-Scaling - VM auto-scaling groups with dynamic policies
  - Resellers - Reseller management
  - White-Label - Custom branding and domains
  - Reseller Customers - Customer management
  - Super Admin - Hierarchical tenant tree management
  - Feature Management - Enable/disable features dynamically
  - Admin Rights - RBAC administration
  - Security - 2FA and security settings
  - Login - Authentication page

### Backend (Express + TypeScript)
- **Storage:** MemStorage with support for PostgreSQL (Drizzle ORM)
- **Authentication:** Session-based with passport, bcrypt, otplib, QRCode
- **CloudStack Integration:** Direct API client with async job polling
- **API Routes:**
  - `/api/auth/*` - Authentication endpoints
  - `/api/vms` - Virtual machine management with CloudStack proxy
  - `/api/vms/:vmId/snapshots` - VM snapshot management (list, create)
  - `/api/snapshots/:id` - Snapshot operations (delete)
  - `/api/snapshots/:id/restore` - Restore VM from snapshot
  - `/api/cloudstack/*` - CloudStack metadata (zones, templates, offerings)
  - `/api/kubernetes/clusters` - Kubernetes cluster management
  - `/api/databases` - Database instance management
  - `/api/feature-flags` - Feature flag management (list all, update)
  - `/api/feature-flags/:id` - Individual feature flag operations
- **Middleware:**
  - `requireFeature(key)` - Feature flag validation for API routes

### Database Schema
- **users:** User accounts with 2FA fields, organizationId, and accountType
- **virtual_machines:** VM cache with CloudStack IDs and metadata
- **vm_snapshots:** VM snapshot records with CloudStack snapshot IDs, names, descriptions, and state tracking
- **kubernetes_clusters:** K8s cluster configurations and metrics
- **databases:** Database instance configurations and monitoring
- **feature_flags:** Feature toggle system with key, name, description, category, enabled status, icon, and sort order
- **roles:** System and custom roles with organization isolation
- **permissions:** Granular permissions organized by category (Compute, Networking, Storage, Billing, IAM)
- **role_permissions:** Many-to-many relationship between roles and permissions
- **user_roles:** Many-to-many relationship between users and roles with grant tracking
- **team_members:** Team member invitations and status with organization isolation

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

## Development Notes

### Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Wouter (routing), TanStack Query
- **Backend:** Express, TypeScript, tsx (runtime)
- **Database:** PostgreSQL with Drizzle ORM
- **UI:** Shadcn UI, Tailwind CSS, Radix UI, Lucide icons
- **Auth:** Passport, bcrypt, otplib, QRCode

### Key Patterns
- Session-based authentication with secure cookies
- MemStorage pattern with PostgreSQL migration path
- React Query for data fetching and caching
- Shadcn sidebar for navigation
- Server-side rendering with client-side hydration

### Environment Secrets
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `CLOUDSTACK_API_URL` - CloudStack API endpoint (required for VM provisioning)
- `CLOUDSTACK_API_KEY` - CloudStack API key (required for VM provisioning)
- `CLOUDSTACK_SECRET_KEY` - CloudStack secret key (required for VM provisioning)
- User-specific: TOTP secrets stored encrypted in database

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/verify-2fa` - Verify TOTP code
- `GET /api/auth/me` - Get current user
- `GET /api/auth/2fa/setup` - Generate 2FA QR code
- `POST /api/auth/2fa/enable` - Enable 2FA
- `POST /api/auth/2fa/disable` - Disable 2FA
- `POST /api/auth/logout` - Logout

### Virtual Machines (CloudStack)
- `GET /api/vms` - List user's virtual machines
- `POST /api/vms` - Deploy new VM (async with job polling)
- `POST /api/vms/:id/start` - Start stopped VM
- `POST /api/vms/:id/stop` - Stop running VM
- `POST /api/vms/:id/reboot` - Reboot running VM
- `DELETE /api/vms/:id` - Destroy VM (expunge from CloudStack)
- `GET /api/cloudstack/zones` - List available zones
- `GET /api/cloudstack/templates?zoneId=X` - List OS templates for zone
- `GET /api/cloudstack/service-offerings` - List compute plans

### Kubernetes Clusters
- `GET /api/kubernetes/clusters` - List all clusters
- `POST /api/kubernetes/clusters` - Create new cluster
- `PATCH /api/kubernetes/clusters/:id` - Update cluster
- `DELETE /api/kubernetes/clusters/:id` - Delete cluster

### Databases
- `GET /api/databases` - List all database instances
- `POST /api/databases` - Create new database
- `PATCH /api/databases/:id` - Update database
- `DELETE /api/databases/:id` - Delete database

### IAM (Identity and Access Management)
- `GET /api/iam/roles` - List all roles (filtered by organization)
- `POST /api/iam/roles` - Create custom role
- `PATCH /api/iam/roles/:id` - Update role
- `DELETE /api/iam/roles/:id` - Delete role
- `GET /api/iam/permissions` - List all permissions
- `GET /api/iam/roles/:roleId/permissions` - Get role permissions
- `POST /api/iam/roles/:roleId/permissions` - Assign permission to role
- `DELETE /api/iam/roles/:roleId/permissions/:permissionId` - Remove permission from role
- `GET /api/iam/team-members` - List organization team members
- `POST /api/iam/team-members` - Invite team member
- `PATCH /api/iam/team-members/:id` - Update team member
- `DELETE /api/iam/team-members/:id` - Remove team member
- `GET /api/iam/users/:userId/roles` - Get user roles
- `POST /api/iam/users/:userId/roles` - Assign role to user
- `DELETE /api/iam/users/:userId/roles/:roleId` - Remove role from user
- `GET /api/iam/me/permissions` - Get current user permissions

## Deployment

The application runs on port 5000 with:
- Express backend serving API
- Vite dev server for frontend (development)
- Session-based authentication
- PostgreSQL database for persistence

## Future Enhancements

Based on StackBill feature analysis:
1. Marketplace with 125+ application templates
2. Advanced monitoring (StackWatch) with AI-powered alerts
3. Payment gateway integration (Stripe, Razorpay, PayPal)
4. Multi-currency support
5. DNS-as-a-Service with PowerDNS
6. Helpdesk/ticketing system
7. Terraform integration for IaC
8. Reserved instance pricing models
9. CDN service integration
10. Advanced analytics and reporting

## Contact

- Platform: AkashOne.com
- Company: Mieux Technologies Pvt Ltd
- Support: admin@akashone.com
