import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Tag, Calendar, Users, TrendingUp } from "lucide-react";
import type { DiscountCoupon } from "@shared/schema";

export default function DiscountCouponsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<DiscountCoupon | null>(null);
  const { toast } = useToast();

  const { data: coupons = [], isLoading } = useQuery<DiscountCoupon[]>({
    queryKey: ["/api/coupons"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("/api/coupons", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      setIsCreateOpen(false);
      toast({ title: "Coupon created successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create coupon", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/coupons/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      setEditingCoupon(null);
      toast({ title: "Coupon updated successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update coupon", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest(`/api/coupons/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      toast({ title: "Coupon deleted successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete coupon", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-lg">Loading discount coupons...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-coupons">Discount Coupons</h1>
          <p className="text-muted-foreground">Create and manage discount coupons for your customers</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-coupon">
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Discount Coupon</DialogTitle>
              <DialogDescription>Create a new discount coupon for your customers</DialogDescription>
            </DialogHeader>
            <CouponForm
              onSubmit={(data) => createMutation.mutate(data)}
              isPending={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Tag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-coupons">{coupons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-active-coupons">
              {coupons.filter((c) => c.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-uses">
              {coupons.reduce((sum, c) => sum + c.timesUsed, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-expiring-soon">
              {coupons.filter((c) => {
                if (!c.validUntil) return false;
                const daysUntilExpiry = Math.ceil(
                  (new Date(c.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
          <CardDescription>Manage your discount coupons</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No coupons created yet. Create your first coupon to get started.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id} data-testid={`row-coupon-${coupon.id}`}>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-sm font-mono" data-testid={`text-code-${coupon.id}`}>
                        {coupon.code}
                      </code>
                    </TableCell>
                    <TableCell data-testid={`text-name-${coupon.id}`}>{coupon.name}</TableCell>
                    <TableCell data-testid={`text-discount-${coupon.id}`}>
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" data-testid={`badge-duration-${coupon.id}`}>
                        {coupon.durationType === "once"
                          ? "One-time"
                          : coupon.durationType === "forever"
                          ? "Forever"
                          : `${coupon.durationMonths}mo`}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-uses-${coupon.id}`}>
                      {coupon.timesUsed}
                      {coupon.maxUses ? ` / ${coupon.maxUses}` : " / ∞"}
                    </TableCell>
                    <TableCell data-testid={`text-validity-${coupon.id}`}>
                      {coupon.validUntil
                        ? new Date(coupon.validUntil).toLocaleDateString()
                        : "No expiry"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={coupon.isActive ? "default" : "secondary"}
                        data-testid={`badge-status-${coupon.id}`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog open={editingCoupon?.id === coupon.id} onOpenChange={(open) => !open && setEditingCoupon(null)}>
                          <DialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setEditingCoupon(coupon)}
                              data-testid={`button-edit-${coupon.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Coupon</DialogTitle>
                              <DialogDescription>Update coupon details</DialogDescription>
                            </DialogHeader>
                            <CouponForm
                              initialData={coupon}
                              onSubmit={(data) => updateMutation.mutate({ id: coupon.id, data })}
                              isPending={updateMutation.isPending}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Delete coupon "${coupon.code}"?`)) {
                              deleteMutation.mutate(coupon.id);
                            }
                          }}
                          data-testid={`button-delete-${coupon.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function CouponForm({
  initialData,
  onSubmit,
  isPending,
}: {
  initialData?: DiscountCoupon;
  onSubmit: (data: any) => void;
  isPending: boolean;
}) {
  const [code, setCode] = useState(initialData?.code || "");
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    (initialData?.discountType as "percentage" | "fixed") || "percentage"
  );
  const [discountValue, setDiscountValue] = useState(initialData?.discountValue?.toString() || "");
  const [durationType, setDurationType] = useState<"once" | "forever" | "repeating">(
    (initialData?.durationType as "once" | "forever" | "repeating") || "once"
  );
  const [durationMonths, setDurationMonths] = useState(initialData?.durationMonths?.toString() || "");
  const [maxUses, setMaxUses] = useState(initialData?.maxUses?.toString() || "");
  const [minOrderAmount, setMinOrderAmount] = useState(initialData?.minOrderAmount?.toString() || "");
  const [validUntil, setValidUntil] = useState(
    initialData?.validUntil ? new Date(initialData.validUntil).toISOString().split("T")[0] : ""
  );
  const [isActive, setIsActive] = useState(initialData?.isActive !== false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: any = {
      code: code.toUpperCase(),
      name,
      description: description || undefined,
      discountType,
      discountValue: parseInt(discountValue),
      durationType,
      durationMonths: durationType === "repeating" ? parseInt(durationMonths) : undefined,
      maxUses: maxUses ? parseInt(maxUses) : undefined,
      minOrderAmount: minOrderAmount ? parseInt(minOrderAmount) : undefined,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      isActive,
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Coupon Code *</Label>
          <Input
            id="code"
            data-testid="input-code"
            placeholder="SAVE20"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Display Name *</Label>
          <Input
            id="name"
            data-testid="input-name"
            placeholder="20% Off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          data-testid="input-description"
          placeholder="Optional description for internal use"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="discountType">Discount Type *</Label>
          <Select value={discountType} onValueChange={(v) => setDiscountType(v as "percentage" | "fixed")}>
            <SelectTrigger data-testid="select-discount-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountValue">
            {discountType === "percentage" ? "Percentage (1-100)" : "Amount in ₹"} *
          </Label>
          <Input
            id="discountValue"
            data-testid="input-discount-value"
            type="number"
            min="1"
            max={discountType === "percentage" ? "100" : undefined}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="durationType">Duration Type *</Label>
          <Select value={durationType} onValueChange={(v) => setDurationType(v as "once" | "forever" | "repeating")}>
            <SelectTrigger data-testid="select-duration-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="once">One-time</SelectItem>
              <SelectItem value="forever">Forever</SelectItem>
              <SelectItem value="repeating">Repeating (Monthly)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {durationType === "repeating" && (
          <div className="space-y-2">
            <Label htmlFor="durationMonths">Number of Months *</Label>
            <Input
              id="durationMonths"
              data-testid="input-duration-months"
              type="number"
              min="1"
              value={durationMonths}
              onChange={(e) => setDurationMonths(e.target.value)}
              required
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="maxUses">Max Uses (optional)</Label>
          <Input
            id="maxUses"
            data-testid="input-max-uses"
            type="number"
            min="1"
            placeholder="Unlimited"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minOrderAmount">Min Order Amount in ₹ (optional)</Label>
          <Input
            id="minOrderAmount"
            data-testid="input-min-order"
            type="number"
            min="0"
            placeholder="No minimum"
            value={minOrderAmount}
            onChange={(e) => setMinOrderAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="validUntil">Valid Until (optional)</Label>
          <Input
            id="validUntil"
            data-testid="input-valid-until"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 pt-8">
          <Switch
            id="isActive"
            data-testid="switch-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending} data-testid="button-submit-coupon">
          {isPending ? "Saving..." : initialData ? "Update Coupon" : "Create Coupon"}
        </Button>
      </div>
    </form>
  );
}
