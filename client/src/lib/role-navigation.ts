import {
  Server,
  Network,
  HardDrive,
  LayoutDashboard,
  Settings,
  BarChart3,
  Shield,
  Receipt,
  Store,
  Palette,
  UserCog,
  Crown,
  UserCheck,
  Boxes,
  Database,
  Cloud,
  Globe,
  CreditCard,
  Calculator,
  Zap,
  Cloudy,
  TrendingUp,
  Users,
  Tag,
  Percent,
  Lock,
  MapPin,
  Key,
  Image,
  ShieldCheck,
  FileCode,
  Route,
  FileText,
} from "lucide-react";

export interface MenuItem {
  title: string;
  url: string;
  icon: any;
  featureKey?: string;
  requiredPermissions?: string[]; // Any of these permissions grants access
  requiredRoles?: string[]; // Any of these account types grants access
}

export interface MenuSection {
  label: string;
  items: MenuItem[];
  requiredRoles?: string[]; // Who can see this entire section
}

// Super Admin sees EVERYTHING
export const superAdminMenu: MenuSection[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { title: "Virtual Machines", url: "/vms", icon: Server },
      { title: "Kubernetes", url: "/kubernetes", icon: Boxes },
      { title: "Database", url: "/database", icon: Database },
      { title: "Block Storage", url: "/storage", icon: HardDrive },
      { title: "Object Storage", url: "/object-storage", icon: Cloud },
    ],
  },
  {
    label: "Networking",
    items: [
      { title: "VPC Networks", url: "/networks", icon: Network },
      { title: "DNS", url: "/dns", icon: Globe },
      { title: "Firewall", url: "/firewall", icon: Shield },
      { title: "NAT Gateway", url: "/nat-gateway", icon: Route },
      { title: "Load Balancers", url: "/load-balancers", icon: Network },
      { title: "IPsec Tunnels", url: "/ipsec-tunnels", icon: Lock },
      { title: "Reserved IPs", url: "/reserved-ips", icon: MapPin },
    ],
  },
  {
    label: "Security & CDN",
    items: [
      { title: "SSL Certificates", url: "/ssl-certificates", icon: ShieldCheck },
      { title: "SSH Keys", url: "/ssh-keys", icon: Key },
      { title: "DDoS Protection", url: "/ddos-protection", icon: Shield },
      { title: "CDN", url: "/cdn", icon: Cloudy },
      { title: "ISO Images", url: "/iso-images", icon: Image },
    ],
  },
  {
    label: "Billing & Finance",
    items: [
      { title: "Billing", url: "/billing", icon: Receipt },
      { title: "HSN/SAC Codes", url: "/hsn-codes", icon: FileText },
      { title: "Discount Coupons", url: "/billing/coupons", icon: Tag },
      { title: "User Discounts", url: "/billing/user-discounts", icon: Percent },
      { title: "Payment Gateways", url: "/payment-gateways", icon: CreditCard },
      { title: "Pricing Calculator", url: "/pricing-calculator", icon: Calculator },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Service Plans", url: "/service-plans", icon: Settings },
      { title: "IAM", url: "/iam", icon: UserCog },
      { title: "Resellers", url: "/resellers", icon: Store },
      { title: "Feature Management", url: "/features", icon: Crown },
      { title: "White Label", url: "/whitelabel", icon: Palette },
      { title: "Monitoring", url: "/monitoring", icon: BarChart3 },
    ],
  },
];

// Reseller sees: Their customers, billing, white-label, limited infrastructure
export const resellerMenu: MenuSection[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "My Infrastructure",
    items: [
      { title: "Virtual Machines", url: "/vms", icon: Server },
      { title: "Kubernetes", url: "/kubernetes", icon: Boxes },
      { title: "Database", url: "/database", icon: Database },
      { title: "Storage", url: "/storage", icon: HardDrive },
      { title: "Networks", url: "/networks", icon: Network },
    ],
  },
  {
    label: "Customer Management",
    items: [
      { title: "My Customers", url: "/resellers", icon: Users },
      { title: "Customer Billing", url: "/billing", icon: Receipt },
      { title: "HSN/SAC Codes", url: "/hsn-codes", icon: FileText },
      { title: "User Discounts", url: "/billing/user-discounts", icon: Percent },
      { title: "Discount Coupons", url: "/billing/coupons", icon: Tag },
    ],
  },
  {
    label: "Branding & Services",
    items: [
      { title: "White Label", url: "/whitelabel", icon: Palette },
      { title: "Service Plans", url: "/service-plans", icon: Settings },
      { title: "IAM", url: "/iam", icon: UserCog },
      { title: "Pricing Calculator", url: "/pricing-calculator", icon: Calculator },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { title: "Monitoring", url: "/monitoring", icon: BarChart3 },
    ],
  },
];

// End Customer sees: Only their own resources
export const customerMenu: MenuSection[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Compute",
    items: [
      { title: "Virtual Machines", url: "/vms", icon: Server },
      { title: "Kubernetes", url: "/kubernetes", icon: Boxes },
    ],
  },
  {
    label: "Storage & Database",
    items: [
      { title: "Database", url: "/database", icon: Database },
      { title: "Block Storage", url: "/storage", icon: HardDrive },
      { title: "Object Storage", url: "/object-storage", icon: Cloud },
    ],
  },
  {
    label: "Networking",
    items: [
      { title: "VPC Networks", url: "/networks", icon: Network },
      { title: "DNS", url: "/dns", icon: Globe },
      { title: "Firewall", url: "/firewall", icon: Shield },
      { title: "Load Balancers", url: "/load-balancers", icon: Network },
      { title: "Reserved IPs", url: "/reserved-ips", icon: MapPin },
    ],
  },
  {
    label: "Security",
    items: [
      { title: "SSL Certificates", url: "/ssl-certificates", icon: ShieldCheck },
      { title: "SSH Keys", url: "/ssh-keys", icon: Key },
      { title: "DDoS Protection", url: "/ddos-protection", icon: Shield },
    ],
  },
  {
    label: "Billing & Account",
    items: [
      { title: "Billing", url: "/billing", icon: Receipt },
      { title: "Team Members", url: "/iam", icon: UserCog },
      { title: "Monitoring", url: "/monitoring", icon: BarChart3 },
    ],
  },
];

// Team Member sees: Based on assigned permissions
export const teamMemberMenu: MenuSection[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { title: "Virtual Machines", url: "/vms", icon: Server, requiredPermissions: ["vm.view", "vm.create", "vm.manage"] },
      { title: "Kubernetes", url: "/kubernetes", icon: Boxes, requiredPermissions: ["kubernetes.view", "kubernetes.create"] },
      { title: "Database", url: "/database", icon: Database, requiredPermissions: ["database.view", "database.create"] },
      { title: "Storage", url: "/storage", icon: HardDrive, requiredPermissions: ["storage.view", "storage.create"] },
    ],
  },
  {
    label: "Networking",
    items: [
      { title: "Networks", url: "/networks", icon: Network, requiredPermissions: ["network.view", "network.create"] },
      { title: "DNS", url: "/dns", icon: Globe, requiredPermissions: ["dns.view", "dns.create"] },
      { title: "Firewall", url: "/firewall", icon: Shield, requiredPermissions: ["firewall.view", "firewall.create"] },
    ],
  },
  {
    label: "Billing",
    items: [
      { title: "Billing", url: "/billing", icon: Receipt, requiredPermissions: ["billing.view"] },
    ],
  },
];

/**
 * Get menu sections based on user account type
 */
export function getMenuForRole(accountType: string): MenuSection[] {
  switch (accountType) {
    case "super_admin":
      return superAdminMenu;
    case "reseller":
      return resellerMenu;
    case "customer":
      return customerMenu;
    case "team_member":
      return teamMemberMenu;
    default:
      return customerMenu; // Default to customer menu
  }
}

/**
 * Check if user has access to a menu item based on permissions
 */
export function hasMenuAccess(
  item: MenuItem,
  userPermissions: string[]
): boolean {
  // If no permissions required, everyone has access
  if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
    return true;
  }

  // Check if user has ANY of the required permissions
  return item.requiredPermissions.some(permission =>
    userPermissions.includes(permission)
  );
}
