# AkashOne.com - Azure-Inspired Cloud Management Portal Design Guidelines

## Design Approach

**Selected System:** Microsoft Azure Design Language
- **Primary Reference:** Azure Portal (enterprise cloud management)
- **Supporting References:** Fluent Design System, Microsoft 365 Admin Center
- **Rationale:** CloudStack management demands the same enterprise-grade professionalism as Azure. We'll adopt Microsoft's refined blue palette, Fluent typography, and proven dashboard patterns for immediate familiarity and trust.
- **Brand Identity:** AkashOne.com - unit of Mieux Technologies Pvt Ltd

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background Base: 220 20% 10%
- Background Elevated: 220 18% 14%
- Background Hover: 220 16% 18%
- Text Primary: 0 0% 100%
- Text Secondary: 210 10% 70%
- Text Muted: 210 8% 50%
- Primary Azure: 207 100% 50% (Azure Blue #0078D4)
- Primary Hover: 207 90% 45%
- Accent Light: 205 100% 85% (Light Azure accents)
- Success: 142 70% 45%
- Warning: 40 95% 55%
- Error: 0 85% 58%
- Border: 220 15% 25%
- Border Subtle: 220 12% 20%

**Light Mode:**
- Background Base: 0 0% 100%
- Background Elevated: 0 0% 98%
- Background Hover: 210 20% 96%
- Text Primary: 210 15% 15%
- Text Secondary: 210 10% 40%
- Primary Azure: 207 100% 42%
- Border: 210 15% 85%

### B. Typography

**Font Families:**
- Primary: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Inter' fallback (Microsoft standard)
- Monospace: 'Cascadia Code', 'JetBrains Mono' fallback

**Type Scale:**
- Page Title: 2rem (32px), weight: 600, tracking: -0.02em
- Section Header: 1.5rem (24px), weight: 600
- Card Title: 1.125rem (18px), weight: 600
- Body: 0.875rem (14px), weight: 400
- Small: 0.75rem (12px), weight: 400
- Data/Mono: 0.8125rem (13px), weight: 400

### C. Layout System

**Spacing Primitives:** 2, 3, 4, 6, 8, 12, 16, 20, 24
- Card padding: p-6
- Section spacing: gap-8, py-12
- Component gaps: gap-4, gap-6
- Table cells: px-4 py-3
- Form elements: gap-3

**Grid Containers:**
- Sidebar: 260px fixed, collapsible to 60px (icon-only)
- Content: max-w-[1600px] mx-auto px-8
- Dashboard metrics: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
- Resource cards: grid-cols-1 xl:grid-cols-2 gap-6

### D. Component Library

**Navigation Architecture:**
- **Command Bar:** Fixed top (h-12), Azure blue background, white text, breadcrumb navigation, search, notifications, user avatar
- **Left Sidebar:** Dark elevated background, grouped sections with expanders, Heroicons (24px), active state with vertical Azure accent bar (4px left border)
- **Page Header:** Background elevated, p-6 pb-4, includes page title, description, primary action button

**Dashboard Cards:**
- **Metric Cards:** Elevated background, rounded-lg, p-6, subtle border, hover effect (lift shadow)
  - Large metric: text-4xl font-semibold in Azure blue
  - Label: text-sm text-secondary uppercase tracking-wide
  - Trend: Small sparkline chart (Chart.js) or arrow indicator with percentage
  - Grid: 4 columns (Total VMs, Running Instances, Total vCPUs, Memory Used)

**Data Tables (Azure Pattern):**
- **Header Row:** Background hover, border-b-2 border-Azure, text-xs font-semibold uppercase tracking-wider
- **Data Rows:** Border-b border-subtle, hover background-hover, 48px min-height
- **Columns:** Checkbox (40px), Status indicator (dot + text), Name (bold), Technical details (mono font), Actions (right-aligned)
- **Toolbar:** Top section with search bar (w-80), filter chips, action buttons, bulk operations when selected
- **Pagination:** Bottom bar with "1-50 of 234 items", page size selector, prev/next buttons

**Forms & Inputs:**
- **Text Inputs:** Background elevated, border-2 border, rounded-md, h-10, px-3, focus:border-Azure focus:ring-2 ring-Azure/20
- **Dropdowns:** Azure Fluent style with chevron, max-height for scroll
- **VM Creation Wizard:** Stepped progression (5 steps: Basics, Size, Disks, Networking, Review), Azure blue progress bar, step numbers in circles
- **Toggle Switches:** Fluent design pill style, Azure blue when active
- **Validation:** Inline below field, error color with error icon

**Status & Badges:**
- **Running:** Green dot (h-2 w-2 rounded-full), text in success color
- **Stopped:** Gray dot, muted text
- **Failed:** Red dot, error text
- **Starting/Stopping:** Animated pulse dot, Azure text
- **Badge Style:** px-2.5 py-0.5 rounded-full text-xs font-medium

**Buttons (Azure Fluent):**
- **Primary:** bg-Azure text-white rounded px-4 py-2 font-medium hover:bg-Azure-hover, min-w-24
- **Secondary:** border-2 border-Azure text-Azure bg-transparent, hover:bg-Azure/5
- **Danger:** bg-error text-white for destructive actions
- **Icon Buttons:** p-2 rounded hover:bg-hover with Heroicons

**Panels & Modals:**
- **Side Panel (Details):** Slides from right, w-[640px], elevated background, shadow-2xl
- **Modal:** Centered, max-w-3xl, rounded-lg, shadow-2xl, backdrop blur
- **Header:** Azure blue accent bar (h-1) at top, p-6 pb-4
- **Footer:** p-6 pt-4 border-t, actions right-aligned

**Charts & Monitoring:**
- **Line Charts:** Azure blue primary line, light blue fill gradient, Chart.js
- **Donut Charts:** Multi-color segments with Azure dominant
- **Metric Tiles:** Current value large, mini historical sparkline below
- **Time Range Selector:** Pills for 1h, 6h, 24h, 7d, 30d

### E. Key Screen Structures

**Dashboard:**
- **Command Bar** with "Overview" breadcrumb
- **Quick Actions Row:** 3 large cards (Create VM, Deploy from Template, Network Setup) with icons, hover lift
- **Metrics Grid:** 4 metric cards with real-time data
- **Recent Resources:** Table showing 10 most recent VMs with quick actions
- **Alerts Panel:** Right sidebar (360px) with warning/error notifications, expandable

**VM Management:**
- **Page Header:** "Virtual Machines" title, "Create VM" primary button, "Refresh" secondary
- **Filters Bar:** Search input (icon left), Status dropdown, Zone selector, Template filter, "Clear all" link
- **Data Table:** Columns - Checkbox, Status, Name, Public IP (mono), Template, Size, Zone, Actions (3-dot menu)
- **Selected Actions Bar:** Appears when items checked, bulk Start/Stop/Delete

**VM Details:**
- **Header:** VM name (h1), status badge, action buttons row (Start/Stop/Restart/Console/Delete)
- **Tab Navigation:** Overview, Monitoring, Networking, Storage, Snapshots, Settings (Azure tab style with bottom border on active)
- **Overview Tab:** 2-column layout - Left: Specs card, Right: Network & Security card
- **Monitoring Tab:** Time range selector top-right, 2x2 grid of charts (CPU, Memory, Disk I/O, Network)

**Create VM Wizard:**
- **Progress Header:** 5 steps with connected line, current step in Azure blue
- **Step Content:** Max-w-2xl centered, form fields with descriptions
- **Navigation:** Previous/Next buttons bottom-right, "Review + create" on final step
- **Review Step:** Summary cards grouped by category, "Create" primary button

**Billing Dashboard:**
- **Current Cost Card:** Large number with month-to-date label, trend vs last month
- **Cost Breakdown:** Donut chart with legend showing VM instances, storage, network, snapshots
- **Invoice Table:** Sortable by date, amount, status with download PDF action

### Images

**Strategic Placement:**
- **Dashboard Empty State:** Abstract cloud infrastructure illustration (servers, network topology) in Azure blue/gray tones, centered with "No resources yet" message
- **VM List Empty:** Cloud server icon illustration with "Create your first virtual machine" CTA
- **Network Empty State:** Minimalist network diagram illustration

**NO hero images** - this is a utility dashboard application. Focus on data density and functional clarity.

### Icons & Assets

- **Icon Library:** Heroicons via CDN exclusively
- **Sizes:** 20px inline, 24px buttons, 48px empty states
- **Style:** Outline variant for navigation, solid for status indicators

### Animations

**Minimal Motion:**
- Table hover: background transition (100ms)
- Button hover: subtle lift (150ms)
- Modal/panel entry: fade + slide (250ms ease-out)
- Loading states: Azure blue spinner animation
- **NO** scroll effects or decorative animations

### Accessibility

- Focus rings: 2px ring-Azure ring-offset-2
- Min touch target: 44px
- Table semantic structure: proper thead/tbody
- Form labels: associated with inputs, aria-labels for icon buttons
- Dark mode consistency: all inputs maintain elevated background

This design creates an enterprise-grade cloud management interface with Microsoft Azure's proven visual language, prioritizing professional clarity and operational efficiency.