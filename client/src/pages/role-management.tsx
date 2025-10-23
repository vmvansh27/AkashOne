import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useSuperAdminAccess } from "@/hooks/use-role-access";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, Edit2, Trash2, CheckCircle2, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string;
  createdAt: string;
}

export default function RoleManagement() {
  const { hasAccess, isLoading } = useSuperAdminAccess();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!hasAccess) {
    return null;
  }

  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  // Fetch roles
  const { data: roles = [], isLoading: loadingRoles } = useQuery<Role[]>({
    queryKey: ["/api/iam/roles"],
  });

  // Fetch all permissions
  const { data: allPermissions = [] } = useQuery<Permission[]>({
    queryKey: ["/api/iam/permissions"],
  });

  // Fetch role permissions when a role is selected
  const { data: rolePermissions = [] } = useQuery<Permission[]>({
    queryKey: ["/api/iam/roles", selectedRole?.id, "permissions"],
    enabled: !!selectedRole?.id,
  });

  // Create role mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const res = await apiRequest("POST", "/api/iam/roles", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/iam/roles"] });
      setCreateDialogOpen(false);
      setRoleName("");
      setRoleDescription("");
      toast({
        title: "Role Created",
        description: "Custom role has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
    },
  });

  // Update role mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; description: string } }) => {
      const res = await apiRequest("PATCH", `/api/iam/roles/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/iam/roles"] });
      setEditDialogOpen(false);
      setSelectedRole(null);
      toast({
        title: "Role Updated",
        description: "Role has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });

  // Delete role mutation
  const deleteMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const res = await apiRequest("DELETE", `/api/iam/roles/${roleId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/iam/roles"] });
      setDeleteDialogOpen(false);
      setSelectedRole(null);
      toast({
        title: "Role Deleted",
        description: "Role has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive",
      });
    },
  });

  // Assign permission mutation
  const assignPermissionMutation = useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: string; permissionId: string }) => {
      const res = await apiRequest("POST", `/api/iam/roles/${roleId}/permissions`, {
        permissionId,
      });
      return res.json();
    },
    onSuccess: () => {
      if (selectedRole) {
        queryClient.invalidateQueries({
          queryKey: ["/api/iam/roles", selectedRole.id, "permissions"],
        });
      }
    },
  });

  // Remove permission mutation
  const removePermissionMutation = useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: string; permissionId: string }) => {
      const res = await apiRequest("DELETE", `/api/iam/roles/${roleId}/permissions/${permissionId}`);
      return res.json();
    },
    onSuccess: () => {
      if (selectedRole) {
        queryClient.invalidateQueries({
          queryKey: ["/api/iam/roles", selectedRole.id, "permissions"],
        });
      }
    },
  });

  const handleCreateRole = () => {
    if (!roleName.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({ name: roleName, description: roleDescription });
  };

  const handleUpdateRole = () => {
    if (!selectedRole || !roleName.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate({
      id: selectedRole.id,
      data: { name: roleName, description: roleDescription },
    });
  };

  const handleOpenEditDialog = (role: Role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || "");
    setEditDialogOpen(true);
  };

  const handleOpenPermissionsDialog = (role: Role) => {
    setSelectedRole(role);
    setPermissionsDialogOpen(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    const currentPermissionIds = new Set(rolePermissions.map((p) => p.id));
    const newPermissionIds = selectedPermissions;

    // Add new permissions
    for (const permId of Array.from(newPermissionIds)) {
      if (!currentPermissionIds.has(permId)) {
        await assignPermissionMutation.mutateAsync({
          roleId: selectedRole.id,
          permissionId: permId,
        });
      }
    }

    // Remove permissions
    for (const permId of Array.from(currentPermissionIds)) {
      if (!newPermissionIds.has(permId)) {
        await removePermissionMutation.mutateAsync({
          roleId: selectedRole.id,
          permissionId: permId,
        });
      }
    }

    setPermissionsDialogOpen(false);
    setSelectedRole(null);
    setSelectedPermissions(new Set());
    toast({
      title: "Permissions Updated",
      description: "Role permissions have been updated successfully.",
    });
  };

  // Group permissions by category
  const permissionsByCategory = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Initialize selected permissions when dialog opens
  const handlePermissionsDialogOpenChange = (open: boolean) => {
    if (open) {
      const currentIds = new Set(rolePermissions.map((p) => p.id));
      setSelectedPermissions(currentIds);
    }
    setPermissionsDialogOpen(open);
  };

  if (loadingRoles) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-muted-foreground">Loading roles...</p>
        </div>
      </div>
    );
  }

  const systemRoles = roles.filter((r) => r.isSystem);
  const customRoles = roles.filter((r) => !r.isSystem);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-role-management">
            Role Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create custom roles and manage permissions
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-role">
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-create-role">
            <DialogHeader>
              <DialogTitle>Create Custom Role</DialogTitle>
              <DialogDescription>
                Create a new role with custom permissions for your organization.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  placeholder="e.g., Developer, Support Agent"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  data-testid="input-role-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                  id="role-description"
                  placeholder="Describe the purpose of this role..."
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  rows={3}
                  data-testid="input-role-description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                data-testid="button-cancel-create"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateRole}
                disabled={createMutation.isPending}
                data-testid="button-confirm-create"
              >
                {createMutation.isPending ? "Creating..." : "Create Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* System Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            System Roles
          </CardTitle>
          <CardDescription>
            Built-in roles that cannot be modified or deleted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {systemRoles.map((role) => (
                  <TableRow key={role.id} data-testid={`row-role-${role.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        {role.name}
                        <Badge variant="secondary" className="ml-2">
                          System
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.description || "No description"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenPermissionsDialog(role)}
                        data-testid={`button-view-permissions-${role.id}`}
                      >
                        View Permissions
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Custom Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Roles</CardTitle>
          <CardDescription>
            {customRoles.length} custom role{customRoles.length !== 1 ? "s" : ""} in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customRoles.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No custom roles yet</h3>
              <p className="text-muted-foreground mt-2">
                Create custom roles to define specific permissions for your team.
              </p>
              <Button
                className="mt-4"
                onClick={() => setCreateDialogOpen(true)}
                data-testid="button-create-first-role"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customRoles.map((role) => (
                    <TableRow key={role.id} data-testid={`row-role-${role.id}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {role.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {role.description || "No description"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenPermissionsDialog(role)}
                            data-testid={`button-manage-permissions-${role.id}`}
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            Permissions
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditDialog(role)}
                            data-testid={`button-edit-role-${role.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRole(role);
                              setDeleteDialogOpen(true);
                            }}
                            data-testid={`button-delete-role-${role.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-role">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update the role name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role-name">Role Name</Label>
              <Input
                id="edit-role-name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                data-testid="input-edit-role-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role-description">Description</Label>
              <Textarea
                id="edit-role-description"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                rows={3}
                data-testid="input-edit-role-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={updateMutation.isPending}
              data-testid="button-confirm-edit"
            >
              {updateMutation.isPending ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog open={permissionsDialogOpen} onOpenChange={handlePermissionsDialogOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-manage-permissions">
          <DialogHeader>
            <DialogTitle>
              Manage Permissions for {selectedRole?.name}
            </DialogTitle>
            <DialogDescription>
              Select which permissions this role should have.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {Object.entries(permissionsByCategory).map(([category, permissions]) => (
              <div key={category} className="space-y-3">
                <h4 className="font-semibold text-sm">{category}</h4>
                <Separator />
                <div className="space-y-2">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-start space-x-3 p-2 rounded-md hover-elevate"
                    >
                      <Checkbox
                        id={permission.id}
                        checked={selectedPermissions.has(permission.id)}
                        onCheckedChange={(checked) => {
                          const newSet = new Set(selectedPermissions);
                          if (checked) {
                            newSet.add(permission.id);
                          } else {
                            newSet.delete(permission.id);
                          }
                          setSelectedPermissions(newSet);
                        }}
                        disabled={selectedRole?.isSystem}
                        data-testid={`checkbox-permission-${permission.id}`}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={permission.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission.name}
                        </Label>
                        {permission.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {permission.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPermissionsDialogOpen(false);
                setSelectedRole(null);
              }}
              data-testid="button-cancel-permissions"
            >
              {selectedRole?.isSystem ? "Close" : "Cancel"}
            </Button>
            {!selectedRole?.isSystem && (
              <Button
                onClick={handleSavePermissions}
                disabled={assignPermissionMutation.isPending || removePermissionMutation.isPending}
                data-testid="button-save-permissions"
              >
                {assignPermissionMutation.isPending || removePermissionMutation.isPending
                  ? "Saving..."
                  : "Save Permissions"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-role">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{selectedRole?.name}"? This action cannot be
              undone. Users with this role will lose their associated permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedRole && deleteMutation.mutate(selectedRole.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
