import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { useLocation } from "wouter";
import { useEffect } from "react";

/**
 * Hook to check if current user has required role
 */
export function useRoleAccess(allowedRoles: string[]) {
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (!isLoading) {
      // If no user (unauthenticated), redirect to login
      if (!user) {
        setLocation("/login");
        return;
      }
      
      // If user doesn't have required role, redirect to dashboard
      if (!allowedRoles.includes(user.accountType || "customer")) {
        setLocation("/");
      }
    }
  }, [user, isLoading, allowedRoles, setLocation]);

  return {
    hasAccess: user ? allowedRoles.includes(user.accountType || "customer") : false,
    isLoading,
    userRole: user?.accountType,
  };
}

/**
 * Hook to check if current user has required permissions
 */
export function usePermissionAccess(requiredPermissions: string[]) {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: userPermissions = [], isLoading } = useQuery<string[]>({
    queryKey: ["/api/iam/me/permissions"],
    enabled: !!user,
  });

  const hasPermission = requiredPermissions.some(permission =>
    userPermissions.includes(permission)
  );

  return {
    hasPermission,
    isLoading,
    userPermissions,
  };
}

/**
 * Check if user is Super Admin
 */
export function useSuperAdminAccess() {
  return useRoleAccess(["super_admin"]);
}

/**
 * Check if user is Reseller or Super Admin
 */
export function useResellerAccess() {
  return useRoleAccess(["super_admin", "reseller"]);
}

/**
 * Get current user's account type for conditional rendering
 */
export function useUserRole() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  return {
    accountType: user?.accountType || "customer",
    isSuperAdmin: user?.accountType === "super_admin",
    isReseller: user?.accountType === "reseller",
    isCustomer: user?.accountType === "customer",
    isTeamMember: user?.accountType === "team_member",
  };
}
