# AkashOne.com - Cloud Management Portal

**Unit of Mieux Technologies Pvt Ltd**

## Overview

AkashOne.com is a comprehensive CloudStack management platform featuring VM provisioning, resource monitoring, network management, Indian GST-compliant billing, reseller white-label capabilities, hierarchical multi-tenant administration, and secure authentication with 2FA support.

## Recent Changes

### October 2025 - Major Feature Additions

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
  - Resellers - Reseller management
  - White-Label - Custom branding and domains
  - Reseller Customers - Customer management
  - Super Admin - Hierarchical tenant tree management
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
  - `/api/cloudstack/*` - CloudStack metadata (zones, templates, offerings)
  - `/api/kubernetes/clusters` - Kubernetes cluster management
  - `/api/databases` - Database instance management

### Database Schema
- **users:** User accounts with 2FA fields
- **virtual_machines:** VM cache with CloudStack IDs and metadata
- **kubernetes_clusters:** K8s cluster configurations and metrics
- **databases:** Database instance configurations and monitoring

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
