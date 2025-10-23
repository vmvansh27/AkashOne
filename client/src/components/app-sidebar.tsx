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
import type { FeatureFlag, User } from "@shared/schema";
import { getMenuForRole, hasMenuAccess, type MenuSection, type MenuItem } from "@/lib/role-navigation";
import { Badge } from "@/components/ui/badge";
import { Building2, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const [location] = useLocation();

  // Fetch current user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  // Fetch user permissions (for team members)
  const { data: userPermissions = [] } = useQuery<string[]>({
    queryKey: ["/api/iam/me/permissions"],
    enabled: user?.accountType === "team_member",
  });

  // Fetch enabled features
  const { data: features = [] } = useQuery<FeatureFlag[]>({
    queryKey: ["/api/feature-flags"],
  });

  // Get role-based menu
  const menuSections: MenuSection[] = user
    ? getMenuForRole(user.accountType || "customer")
    : [];

  // Filter features
  const enabledFeatureKeys = new Set(
    features.filter((f) => f.enabled).map((f) => f.key)
  );

  // Filter menu items based on permissions and features
  const filterMenuItem = (item: MenuItem): boolean => {
    // Check feature flag if specified
    if (item.featureKey && !enabledFeatureKeys.has(item.featureKey)) {
      return false;
    }

    // For team members, check permissions
    if (user?.accountType === "team_member") {
      return hasMenuAccess(item, userPermissions);
    }

    return true;
  };

  const getRoleBadgeColor = (accountType: string) => {
    switch (accountType) {
      case "super_admin":
        return "bg-purple-600 text-white hover:bg-purple-700";
      case "reseller":
        return "bg-blue-600 text-white hover:bg-blue-700";
      case "customer":
        return "bg-green-600 text-white hover:bg-green-700";
      case "team_member":
        return "bg-orange-600 text-white hover:bg-orange-700";
      default:
        return "bg-gray-600 text-white hover:bg-gray-700";
    }
  };

  const getRoleLabel = (accountType: string) => {
    switch (accountType) {
      case "super_admin":
        return "Super Admin";
      case "reseller":
        return "Reseller";
      case "customer":
        return "Customer";
      case "team_member":
        return "Team Member";
      default:
        return "User";
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">AkashOne</h2>
            {user && (
              <Badge
                variant="secondary"
                className={`mt-1 text-xs ${getRoleBadgeColor(user.accountType || "customer")}`}
                data-testid="badge-user-role"
              >
                {getRoleLabel(user.accountType || "customer")}
              </Badge>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuSections.map((section, idx) => {
          const filteredItems = section.items.filter(filterMenuItem);

          // Don't render empty sections
          if (filteredItems.length === 0) {
            return null;
          }

          return (
            <SidebarGroup key={idx}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.url;

                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="space-y-2">
          {user && (
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <UserIcon className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" data-testid="text-username">
                  {user.username}
                </p>
                <p className="text-xs text-muted-foreground truncate" data-testid="text-email">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
