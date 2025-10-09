import { Server, Network, HardDrive, LayoutDashboard, Settings, BarChart3, Users, Shield, Receipt, Store, Palette, UserCog, Crown, UserCheck, Boxes, Database, ShoppingBag, Cloud, Globe } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Virtual Machines",
    url: "/vms",
    icon: Server,
  },
  {
    title: "Kubernetes",
    url: "/kubernetes",
    icon: Boxes,
  },
  {
    title: "Database",
    url: "/database",
    icon: Database,
  },
  {
    title: "Marketplace",
    url: "/marketplace",
    icon: ShoppingBag,
  },
  {
    title: "Object Storage",
    url: "/object-storage",
    icon: Cloud,
  },
  {
    title: "DNS",
    url: "/dns",
    icon: Globe,
  },
  {
    title: "Networks",
    url: "/networks",
    icon: Network,
  },
  {
    title: "Storage",
    url: "/storage",
    icon: HardDrive,
  },
  {
    title: "Monitoring",
    url: "/monitoring",
    icon: BarChart3,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: Receipt,
  },
];

const adminItems = [
  {
    title: "Security",
    url: "/security",
    icon: Shield,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

const resellerItems = [
  {
    title: "Resellers",
    url: "/resellers",
    icon: Store,
  },
  {
    title: "White-Label",
    url: "/whitelabel",
    icon: Palette,
  },
  {
    title: "My Customers",
    url: "/customers",
    icon: UserCog,
  },
];

const superAdminItems = [
  {
    title: "Super Admin",
    url: "/super-admin",
    icon: Crown,
  },
  {
    title: "Feature Management",
    url: "/feature-management",
    icon: Settings,
  },
  {
    title: "Admin Rights",
    url: "/admin-rights",
    icon: UserCheck,
  },
  {
    title: "All VMs",
    url: "/all-vms",
    icon: Server,
  },
  {
    title: "All Kubernetes",
    url: "/all-kubernetes",
    icon: Boxes,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Server className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">AkashOne.com</span>
            <span className="text-xs text-muted-foreground">Mieux Technologies</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Super Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {superAdminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Reseller Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resellerItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(' ', '-').replace('-', '')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase()}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
            <span className="text-sm font-medium">AD</span>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium truncate">Admin User</span>
            <span className="text-xs text-muted-foreground truncate">admin@akashone.com</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
