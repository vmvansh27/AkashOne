import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Store, Users, IndianRupee, Settings } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useSuperAdminAccess } from "@/hooks/use-role-access";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function Resellers() {
  const { toast } = useToast();
  const { hasAccess, isLoading: isCheckingAccess } = useSuperAdminAccess();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newReseller, setNewReseller] = useState({
    username: "",
    email: "",
    password: "",
    gstNumber: "",
    defaultDiscountPercentage: 0,
  });

  const { data: resellers = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/resellers"],
    enabled: hasAccess,
  });

  const createResellerMutation = useMutation({
    mutationFn: async (data: typeof newReseller) => {
      return await apiRequest("POST", "/api/resellers", data);
    },
    onSuccess: () => {
      toast({
        title: "Reseller Created",
        description: "New reseller account has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resellers"] });
      setCreateDialogOpen(false);
      setNewReseller({
        username: "",
        email: "",
        password: "",
        gstNumber: "",
        defaultDiscountPercentage: 0,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create reseller",
        variant: "destructive",
      });
    },
  });

  if (isCheckingAccess || isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!hasAccess) {
    return null; // Will redirect automatically
  }

  const handleCreateReseller = () => {
    if (!newReseller.username || !newReseller.email || !newReseller.password || !newReseller.gstNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createResellerMutation.mutate(newReseller);
  };

  const handleConfigureReseller = (resellerId: string) => {
    console.log("Configuring reseller:", resellerId);
    toast({
      title: "Reseller Configuration",
      description: "White-label configuration coming soon",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reseller Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage reseller partners and white-label configurations
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-reseller">
          <Plus className="h-4 w-4 mr-2" />
          Add Reseller
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Resellers</p>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-total-resellers">{resellers.length}</div>
            <p className="text-xs text-chart-2 mt-1">Active reseller accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Avg. Margin</p>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25%</div>
            <p className="text-xs text-muted-foreground mt-1">Average across resellers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium">Active Resellers</h3>
            <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
              {resellers.length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reseller Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead className="text-right">Discount %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resellers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No resellers found. Click "Add Reseller" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  resellers.map((reseller) => (
                    <TableRow key={reseller.id} className="hover-elevate">
                      <TableCell className="font-medium" data-testid={`reseller-name-${reseller.id}`}>
                        {reseller.username}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {reseller.email}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {reseller.gstNumber}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {reseller.defaultDiscountPercentage}%
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={reseller.status === "active" ? "bg-chart-2/10 text-chart-2 border-chart-2/20" : "bg-muted"}
                        >
                          {reseller.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {reseller.createdAt ? new Date(reseller.createdAt).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfigureReseller(reseller.id)}
                          data-testid={`button-configure-${reseller.id}`}
                        >
                          Configure
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent data-testid="dialog-create-reseller">
          <DialogHeader>
            <DialogTitle>Create New Reseller</DialogTitle>
            <DialogDescription>
              Add a new reseller account with their business details and discount percentage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={newReseller.username}
                onChange={(e) => setNewReseller({ ...newReseller, username: e.target.value })}
                data-testid="input-reseller-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newReseller.email}
                onChange={(e) => setNewReseller({ ...newReseller, email: e.target.value })}
                data-testid="input-reseller-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={newReseller.password}
                onChange={(e) => setNewReseller({ ...newReseller, password: e.target.value })}
                data-testid="input-reseller-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number *</Label>
              <Input
                id="gstNumber"
                value={newReseller.gstNumber}
                onChange={(e) => setNewReseller({ ...newReseller, gstNumber: e.target.value })}
                placeholder="29ABCDE1234F1Z5"
                data-testid="input-reseller-gst"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Default Discount % (Optional)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={newReseller.defaultDiscountPercentage}
                onChange={(e) => setNewReseller({ ...newReseller, defaultDiscountPercentage: parseInt(e.target.value) || 0 })}
                data-testid="input-reseller-discount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setNewReseller({
                  username: "",
                  email: "",
                  password: "",
                  gstNumber: "",
                  defaultDiscountPercentage: 0,
                });
              }}
              data-testid="button-cancel-create-reseller"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateReseller}
              disabled={createResellerMutation.isPending}
              data-testid="button-submit-create-reseller"
            >
              {createResellerMutation.isPending ? "Creating..." : "Create Reseller"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
