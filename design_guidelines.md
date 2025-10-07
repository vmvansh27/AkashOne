# CloudStack Management Portal - Design Guidelines

## Design Approach

**Selected Approach:** Modern SaaS Dashboard System
- **Primary References:** Linear (clean aesthetics), Vercel Dashboard (developer-focused), AWS Console (enterprise patterns)
- **Rationale:** Cloud infrastructure management requires clarity, efficiency, and trust. We'll combine Linear's minimal aesthetic with enterprise-grade component patterns for a professional yet modern feel.

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background Base: 220 15% 8%
- Background Elevated: 220 12% 12%
- Background Subtle: 220 10% 15%
- Text Primary: 220 10% 95%
- Text Secondary: 220 8% 65%
- Text Muted: 220 8% 45%
- Primary Brand: 213 94% 68% (Blue - trust/tech)
- Success: 142 76% 45% (Green - running VMs)
- Warning: 38 92% 58% (Amber - alerts)
- Error: 0 84% 60% (Red - stopped/failed)
- Border: 220 10% 20%

**Light Mode:**
- Background Base: 0 0% 100%
- Background Elevated: 220 15% 98%
- Text Primary: 220 15% 10%
- Text Secondary: 220 10% 35%
- Primary Brand: 213 94% 50%

### B. Typography

**Font Families:**
- Primary: 'Inter' (Google Fonts) - UI, tables, forms
- Monospace: 'JetBrains Mono' - code, IPs, resource IDs

**Type Scale:**
- Display: 2.5rem (40px), font-weight: 700
- H1: 2rem (32px), font-weight: 600
- H2: 1.5rem (24px), font-weight: 600
- H3: 1.25rem (20px), font-weight: 600
- Body: 0.875rem (14px), font-weight: 400
- Small: 0.75rem (12px), font-weight: 400
- Mono: 0.8125rem (13px), font-weight: 400

### C. Layout System

**Spacing Units:** Use Tailwind spacing primitives of 1, 2, 4, 6, 8, 12, 16, 24
- Component padding: p-4, p-6
- Section gaps: gap-6, gap-8
- Page margins: px-6, py-8
- Card spacing: p-6
- Table cells: px-4 py-3

**Grid System:**
- Sidebar: 240px fixed width
- Main content: flex-1 with max-w-7xl
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Resource lists: Single column with full-width tables

### D. Component Library

**Navigation:**
- Top bar: Fixed height (h-16), dark background with logo, search, user menu
- Sidebar: Fixed left, collapsible on mobile, grouped nav items with icons (Heroicons)
- Breadcrumbs: Text-sm with chevron separators

**Dashboard Cards:**
- Metric Cards: Background elevated, rounded-lg, p-6, border
- Components: Large number (text-3xl font-bold), label (text-sm text-muted), trend indicator
- Grid layout: 4 columns on desktop (VMs Running, CPU Usage, Memory, Storage)

**Data Tables:**
- Header: Background subtle, sticky, font-weight: 600, text-sm
- Rows: Hover background, border-b, alternating subtle backgrounds
- Actions: Icon buttons at row end, dropdown menus for bulk actions
- Pagination: Bottom-right, showing "1-10 of 234"
- Filters: Top-left with search, status dropdowns, date ranges

**Forms:**
- Input Fields: Background elevated, border, rounded-md, h-10, px-3
- Labels: text-sm font-medium mb-1.5
- VM Creation Wizard: Multi-step with progress indicator at top
- Dropdowns: Custom styled with Heroicons chevron-down
- Validation: Inline error messages in error color

**Status Indicators:**
- Running: Green dot + text
- Stopped: Gray dot + text
- Error: Red dot + text
- Loading: Animated pulse

**Action Buttons:**
- Primary: Background primary brand, rounded-md, px-4 py-2, font-medium
- Secondary: Border with outline variant, background transparent
- Destructive: Error color background for delete actions
- Icon-only: p-2 with Heroicons, hover background subtle

**Modals/Dialogs:**
- Overlay: Background black with 50% opacity
- Container: max-w-2xl, background elevated, rounded-lg, shadow-2xl
- Header: p-6 border-b
- Actions: Bottom-right, gap-3

**Charts & Graphs:**
- Use Chart.js or Recharts for resource monitoring
- Line charts: CPU/Memory over time
- Donut charts: Storage distribution
- Color scheme: Match palette (primary for main metrics)

### E. Key Screens Structure

**Dashboard (Home):**
- Top metrics row: 4 cards (VMs, CPU, Memory, Storage)
- Recent activity feed: 2-column layout (activity list + resource alerts)
- Quick actions: "Create VM", "Manage Networks", "View Billing"

**VM Management:**
- Header with "Create VM" button
- Filters bar: Search, status, template, zone
- Table: Checkbox, Name, State, IP, Template, CPU/RAM, Actions
- Bulk actions toolbar when rows selected

**VM Details Page:**
- Header: VM name, state badge, action buttons (Start/Stop/Restart/Delete)
- Tabs: Overview, Metrics, Networking, Storage, Snapshots, Console
- Overview: 2-column grid (Specs + Network Info)
- Metrics: Real-time charts for CPU, Memory, Disk I/O, Network

**Resource Monitoring:**
- Grid of metric cards with sparkline charts
- Filterable by zone, host, time range
- Alert table below metrics

**Network Management:**
- VPC list with expand/collapse for details
- Firewall rules table
- Public IP assignment interface

**Billing Section:**
- Usage summary cards
- Detailed invoice table
- Cost breakdown charts

### Images

**Hero/Empty States Only:**
- Dashboard empty state: Subtle illustration of cloud infrastructure (abstract servers/networks)
- No VMs state: Friendly illustration with "Create your first VM" prompt
- Empty network view: Network topology illustration
- No hero images - this is a utility application

**Icons:**
- Use Heroicons exclusively via CDN
- Consistent 20px size for inline icons
- 24px for action buttons

### Animations

**Minimal & Purposeful:**
- Loading spinners: Simple rotation
- Table row hover: Subtle background transition (150ms)
- Modal entry: Fade + scale (200ms ease-out)
- NO scroll animations, parallax, or decorative motion

### Accessibility

- All interactive elements: min height 44px (touch target)
- Focus rings: 2px ring with primary color
- Tables: Proper thead/tbody/th structure
- Forms: Label association, aria-labels
- Consistent dark mode across all inputs/selects

This design creates a professional, efficient cloud management interface that prioritizes clarity and usability over visual flair, while maintaining a modern, polished aesthetic.