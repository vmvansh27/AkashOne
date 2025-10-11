import { Server, Network, HardDrive, LayoutDashboard, Settings, BarChart3, Shield, Receipt, Store, Palette, UserCog, Crown, UserCheck, Boxes, Database, Cloud, Globe, CreditCard, Calculator, Zap, Cloudy, TrendingUp, Users, Tag, Percent, Lock, MapPin, Key, Image } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import type { FeatureFlag } from "@shared/schema";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  featureKey?: string; // Optional feature key for dynamic filtering
}

const menuItems: MenuItem[] = [
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
    title: "Networks",
    url: "/networks",
    icon: Network,
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
    featureKey: "database",
  },
  {
    title: "Object Storage",
    url: "/object-storage",
    icon: Cloud,
    featureKey: "object_storage",
  },
  {
    title: "DNS",
    url: "/dns",
    icon: Globe,
    featureKey: "dns",
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
];

const billingItems: MenuItem[] = [
  {
    title: "Billing",
    url: "/billing",
    icon: Receipt,
    featureKey: "billing",
  },
  {
    title: "Discount Coupons",
    url: "/billing/coupons",
    icon: Tag,
    featureKey: "billing",
  },
  {
    title: "User Discounts",
    url: "/billing/user-discounts",
    icon: Percent,
    featureKey: "billing",
  },
  {
    title: "Payment Gateways",
    url: "/payment-gateways",
    icon: CreditCard,
    featureKey: "payment_gateway",
  },
  {
    title: "Pricing Calculator",
    url: "/pricing-calculator",
    icon: Calculator,
    featureKey: "pricing_calculator",
  },
];

const advancedComputeItems: MenuItem[] = [
  {
    title: "GPU Instances",
    url: "/gpu-instances",
    icon: Zap,
    featureKey: "gpu_instances",
  },
  {
    title: "Auto-Scaling Groups",
    url: "/auto-scaling",
    icon: TrendingUp,
    featureKey: "vm_autoscaling",
  },
];

const networkingItems: MenuItem[] = [
  {
    title: "Load Balancer",
    url: "/load-balancer",
    icon: Network,
    featureKey: "load_balancer",
  },
  {
    title: "SSL Certificates",
    url: "/ssl-certificates",
    icon: Shield,
    featureKey: "ssl_certificates",
  },
  {
    title: "CDN Service",
    url: "/cdn",
    icon: Cloudy,
    featureKey: "cdn_service",
  },
];

const adminItems: MenuItem[] = [
  {
    title: "Team Management",
    url: "/team-management",
    icon: Users,
  },
  {
    title: "Role Management",
    url: "/role-management",
    icon: Shield,
  },
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

const resellerItems: MenuItem[] = [
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

const superAdminItems: MenuItem[] = [
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

const cloudStackItems: MenuItem[] = [
  {
    title: "Block Storage",
    url: "/volumes",
    icon: HardDrive,
    featureKey: "volumes",
  },
  {
    title: "Firewall Rules",
    url: "/firewall",
    icon: Shield,
    featureKey: "firewall",
  },
  {
    title: "Security Groups",
    url: "/security-groups",
    icon: Lock,
    featureKey: "security_groups",
  },
  {
    title: "VPC",
    url: "/vpc",
    icon: Network,
    featureKey: "vpc",
  },
  {
    title: "Elastic IP",
    url: "/elastic-ip",
    icon: MapPin,
    featureKey: "elastic_ip",
  },
  {
    title: "SSH Keys",
    url: "/ssh-keys",
    icon: Key,
    featureKey: "ssh_keys",
  },
  {
    title: "Images & Templates",
    url: "/images-templates",
    icon: Image,
    featureKey: "images_templates",
  },
  {
    title: "Resource Tags",
    url: "/resource-tags",
    icon: Tag,
    featureKey: "resource_tags",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  // Fetch feature flags
  const { data: features = [] } = useQuery<FeatureFlag[]>({
    queryKey: ["/api/feature-flags"],
  });

  // Create a map of feature keys to enabled status
  const featureMap = new Map<string, boolean>();
  features.forEach((feature) => {
    featureMap.set(feature.key, feature.enabled);
  });

  // Filter function for menu items based on feature flags
  const filterByFeature = (items: MenuItem[]) => {
    return items.filter((item) => {
      // If no feature key, always show
      if (!item.featureKey) return true;
      // Show if feature is enabled (default to false if not found)
      return featureMap.get(item.featureKey) === true;
    });
  };

  const visibleMenuItems = filterByFeature(menuItems);
  const visibleBillingItems = filterByFeature(billingItems);
  const visibleAdvancedComputeItems = filterByFeature(advancedComputeItems);
  const visibleNetworkingItems = filterByFeature(networkingItems);
  const visibleCloudStackItems = filterByFeature(cloudStackItems);

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
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/ /g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {visibleAdvancedComputeItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Advanced Compute</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleAdvancedComputeItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url}>
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/ /g, '-')}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {visibleNetworkingItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Networking</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleNetworkingItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url}>
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/ /g, '-')}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {visibleCloudStackItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Infrastructure</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleCloudStackItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url}>
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/ /g, '-')}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {visibleBillingItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Billing & Pricing</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleBillingItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url}>
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/ /g, '-')}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Super Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {superAdminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/ /g, '-')}`}>
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
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/ /g, '-')}`}>
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
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/ /g, '-')}`}>
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
