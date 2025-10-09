import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Percent, Users, TrendingDown, Save } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface User {
  id: string;
  username: string;
  email: string;
  gstNumber: string;
  accountType: string;
  defaultDiscountPercentage: number;
  status: string;
}

export default function UserDiscounts() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [discountValue, setDiscountValue] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const updateDiscountMutation = useMutation({
    mutationFn: async ({ userId, discountPercentage }: { userId: string; discountPercentage: number }) => {
      const response = await fetch(`/api/users/${userId}/discount`, {
        method: "PATCH",
        body: JSON.stringify({ discountPercentage }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update discount");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "Discount percentage updated successfully",
      });
      setSelectedUser(null);
      setDiscountValue("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update discount percentage",
        variant: "destructive",
      });
    },
  });

  const handleEditDiscount = (user: User) => {
    setSelectedUser(user);
    setDiscountValue(user.defaultDiscountPercentage?.toString() || "0");
  };

  const handleSaveDiscount = () => {
    if (!selectedUser) return;

    const discount = parseFloat(discountValue);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      toast({
        title: "Invalid Value",
        description: "Discount percentage must be between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    updateDiscountMutation.mutate({
      userId: selectedUser.id,
      discountPercentage: discount,
    });
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "super_admin":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20";
      case "reseller":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      case "customer":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      case "suspended":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "invited":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      default:
        return "";
    }
  };

  // Filter users (exclude super_admins and team_members)
  const eligibleUsers = users.filter(
    (user) => user.accountType === "reseller" || user.accountType === "customer"
  );

  // Apply search filter
  const filteredUsers = eligibleUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.gstNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalUsers = eligibleUsers.length;
  const usersWithDiscounts = eligibleUsers.filter(
    (user) => user.defaultDiscountPercentage > 0
  ).length;
  const averageDiscount =
    eligibleUsers.length > 0
      ? eligibleUsers.reduce((sum, user) => sum + (user.defaultDiscountPercentage || 0), 0) /
        eligibleUsers.length
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Discount Management</h1>
          <p className="text-muted-foreground mt-1">
            Assign permanent discount percentages to resellers and customers
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Eligible Users</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-total-users">
              {totalUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Resellers & Customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Users with Discounts</p>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-discounted-users">
              {usersWithDiscounts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalUsers > 0 ? Math.round((usersWithDiscounts / totalUsers) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Average Discount</p>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-avg-discount">
              {averageDiscount.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all users</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-base font-medium">User Discounts</h3>
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search by name, email, or GST..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-users"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No users found matching your search" : "No eligible users found"}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>GST Number</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Discount %</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover-elevate">
                      <TableCell className="font-medium" data-testid={`user-name-${user.id}`}>
                        {user.username}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="font-mono text-sm">{user.gstNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getAccountTypeColor(user.accountType)}>
                          {user.accountType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium" data-testid={`discount-${user.id}`}>
                        {user.defaultDiscountPercentage || 0}%
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditDiscount(user)}
                          data-testid={`button-edit-discount-${user.id}`}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent data-testid="dialog-edit-discount">
          <DialogHeader>
            <DialogTitle>Set Discount Percentage</DialogTitle>
            <DialogDescription>
              Assign a permanent discount percentage to {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>User Details</Label>
              <div className="rounded-md border p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Username:</span>
                  <span className="text-sm font-medium">{selectedUser?.username}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm font-medium">{selectedUser?.email}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Account Type:</span>
                  <Badge variant="outline" className={getAccountTypeColor(selectedUser?.accountType || "")}>
                    {selectedUser?.accountType}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount-percentage">Discount Percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="discount-percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="Enter discount percentage"
                  data-testid="input-discount-percentage"
                />
                <span className="text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This discount will be permanently applied to all invoices for this user
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedUser(null)}
              data-testid="button-cancel-discount"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDiscount}
              disabled={updateDiscountMutation.isPending}
              data-testid="button-save-discount"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateDiscountMutation.isPending ? "Saving..." : "Save Discount"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
