import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Shield, UserPlus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

//todo: remove mock functionality
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "platform_admin" | "reseller_admin" | "customer_admin";
  tenantId: string;
  tenantName: string;
  permissions: {
    manageVMs: boolean;
    manageNetworks: boolean;
    manageStorage: boolean;
    manageK8s: boolean;
    manageBilling: boolean;
    manageUsers: boolean;
    manageTenants: boolean;
    viewReports: boolean;
  };
  status: "active" | "inactive";
  lastLogin: string;
}

const mockAdmins: AdminUser[] = [
  {
    id: "admin-001",
    name: "John Doe",
    email: "john@cloudstack.io",
    role: "super_admin",
    tenantId: "platform-root",
    tenantName: "CloudStack Platform",
    permissions: {
      manageVMs: true,
      manageNetworks: true,
      manageStorage: true,
      manageK8s: true,
      manageBilling: true,
      manageUsers: true,
      manageTenants: true,
      viewReports: true,
    },
    status: "active",
    lastLogin: "2024-10-07 10:30 AM",
  },
  {
    id: "admin-002",
    name: "Sarah Johnson",
    email: "sarah@cloudtech.com",
    role: "reseller_admin",
    tenantId: "res-001",
    tenantName: "CloudTech Solutions",
    permissions: {
      manageVMs: true,
      manageNetworks: true,
      manageStorage: true,
      manageK8s: true,
      manageBilling: true,
      manageUsers: true,
      manageTenants: false,
      viewReports: true,
    },
    status: "active",
    lastLogin: "2024-10-07 09:15 AM",
  },
  {
    id: "admin-003",
    name: "Mike Chen",
    email: "mike@techstart.com",
    role: "customer_admin",
    tenantId: "cust-001",
    tenantName: "TechStart Solutions",
    permissions: {
      manageVMs: true,
      manageNetworks: true,
      manageStorage: true,
      manageK8s: false,
      manageBilling: false,
      manageUsers: true,
      manageTenants: false,
      viewReports: true,
    },
    status: "active",
    lastLogin: "2024-10-07 08:45 AM",
  },
];

export default function AdminRights() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const { toast } = useToast();

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20";
      case "platform_admin":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      case "reseller_admin":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      case "customer_admin":
        return "bg-chart-4/10 text-chart-4 border-chart-4/20";
      default:
        return "";
    }
  };

  const handleAddAdmin = () => {
    toast({
      title: "Add Administrator",
      description: "Opening admin creation wizard",
    });
  };

  const handleEditPermissions = (admin: AdminUser) => {
    setSelectedAdmin(admin);
  };

  const filteredAdmins = mockAdmins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.tenantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Rights Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage administrator roles and permissions across all tenants
          </p>
        </div>
        <Button onClick={handleAddAdmin} data-testid="button-add-admin">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Administrator
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Super Admins</p>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">Full platform access</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Platform Admins</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Platform level</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Reseller Admins</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">Reseller level</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Customer Admins</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">Customer level</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="text-base font-medium">Administrator List</CardTitle>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or tenant..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-admins"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map((admin) => (
                    <TableRow key={admin.id} className="hover-elevate">
                      <TableCell className="font-medium" data-testid={`admin-name-${admin.id}`}>
                        {admin.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {admin.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleColor(admin.role)}>
                          {admin.role.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{admin.tenantName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {admin.lastLogin}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            admin.status === "active"
                              ? "bg-chart-2/10 text-chart-2 border-chart-2/20"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {admin.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPermissions(admin)}
                          data-testid={`button-edit-${admin.id}`}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              {selectedAdmin ? "Edit Permissions" : "Permission Overview"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAdmin ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">{selectedAdmin.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedAdmin.email}</p>
                  <Badge variant="outline" className={getRoleColor(selectedAdmin.role)}>
                    {selectedAdmin.role.replace("_", " ")}
                  </Badge>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="perm-vms" className="text-sm">
                      Manage VMs
                    </Label>
                    <Switch
                      id="perm-vms"
                      checked={selectedAdmin.permissions.manageVMs}
                      data-testid="switch-manage-vms"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="perm-networks" className="text-sm">
                      Manage Networks
                    </Label>
                    <Switch
                      id="perm-networks"
                      checked={selectedAdmin.permissions.manageNetworks}
                      data-testid="switch-manage-networks"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="perm-storage" className="text-sm">
                      Manage Storage
                    </Label>
                    <Switch
                      id="perm-storage"
                      checked={selectedAdmin.permissions.manageStorage}
                      data-testid="switch-manage-storage"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="perm-k8s" className="text-sm">
                      Manage Kubernetes
                    </Label>
                    <Switch
                      id="perm-k8s"
                      checked={selectedAdmin.permissions.manageK8s}
                      data-testid="switch-manage-k8s"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="perm-billing" className="text-sm">
                      Manage Billing
                    </Label>
                    <Switch
                      id="perm-billing"
                      checked={selectedAdmin.permissions.manageBilling}
                      data-testid="switch-manage-billing"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="perm-users" className="text-sm">
                      Manage Users
                    </Label>
                    <Switch
                      id="perm-users"
                      checked={selectedAdmin.permissions.manageUsers}
                      data-testid="switch-manage-users"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="perm-tenants" className="text-sm">
                      Manage Tenants
                    </Label>
                    <Switch
                      id="perm-tenants"
                      checked={selectedAdmin.permissions.manageTenants}
                      disabled={selectedAdmin.role !== "super_admin"}
                      data-testid="switch-manage-tenants"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="perm-reports" className="text-sm">
                      View Reports
                    </Label>
                    <Switch
                      id="perm-reports"
                      checked={selectedAdmin.permissions.viewReports}
                      data-testid="switch-view-reports"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" data-testid="button-save-permissions">
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAdmin(null)}
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select an administrator from the list to view and edit their permissions.
                </p>
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="text-sm font-medium">Permission Types:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Manage VMs</li>
                    <li>• Manage Networks</li>
                    <li>• Manage Storage</li>
                    <li>• Manage Kubernetes</li>
                    <li>• Manage Billing</li>
                    <li>• Manage Users</li>
                    <li>• Manage Tenants</li>
                    <li>• View Reports</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
