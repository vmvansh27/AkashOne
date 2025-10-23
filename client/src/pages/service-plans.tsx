import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useSuperAdminAccess } from "@/hooks/use-role-access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertServicePlanSchema, type ServicePlan } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  IndianRupee,
} from "lucide-react";
import { z } from "zod";

// Form schema
const servicePlanFormSchema = insertServicePlanSchema.extend({
  price: z.coerce.number().min(0),
  cpu: z.coerce.number().min(1),
  memory: z.coerce.number().min(512),
  storage: z.coerce.number().min(10),
  bandwidth: z.coerce.number().optional(),
  sortOrder: z.coerce.number().optional(),
});

type ServicePlanFormData = z.infer<typeof servicePlanFormSchema>;

export default function ServicePlans() {
  const { hasAccess, isLoading: isCheckingAccess } = useSuperAdminAccess();

  if (isCheckingAccess) {
    return <div className="p-8">Loading...</div>;
  }

  if (!hasAccess) {
    return null;
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
  const { toast } = useToast();

  // Fetch service plans
  const { data: plans = [], isLoading } = useQuery<ServicePlan[]>({
    queryKey: ["/api/service-plans"],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: ServicePlanFormData) => {
      const res = await apiRequest("POST", "/api/service-plans", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-plans"] });
      setCreateDialogOpen(false);
      createForm.reset();
      toast({ title: "Success", description: "Service plan created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<ServicePlanFormData> & { id: string }) => {
      const { id, ...updateData } = data;
      const res = await apiRequest("PATCH", `/api/service-plans/${id}`, updateData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-plans"] });
      setEditDialogOpen(false);
      setSelectedPlan(null);
      toast({ title: "Success", description: "Service plan updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/service-plans/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-plans"] });
      toast({ title: "Success", description: "Service plan deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Create form
  const createForm = useForm<ServicePlanFormData>({
    resolver: zodResolver(servicePlanFormSchema),
    defaultValues: {
      name: "",
      description: "",
      cpu: 2,
      memory: 2048,
      storage: 50,
      bandwidth: 1000,
      price: 1000,
      isActive: true,
      isPublic: true,
      sortOrder: 0,
    },
  });

  // Edit form
  const editForm = useForm<ServicePlanFormData>({
    resolver: zodResolver(servicePlanFormSchema),
  });

  const onCreateSubmit = (data: ServicePlanFormData) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: ServicePlanFormData) => {
    if (!selectedPlan) return;
    updateMutation.mutate({ ...data, id: selectedPlan.id });
  };

  const handleEdit = (plan: ServicePlan) => {
    setSelectedPlan(plan);
    editForm.reset({
      name: plan.name,
      description: plan.description || "",
      cpu: plan.cpu,
      memory: plan.memory,
      storage: plan.storage,
      bandwidth: plan.bandwidth || undefined,
      price: plan.price,
      cloudstackOfferingId: plan.cloudstackOfferingId || undefined,
      isActive: plan.isActive,
      isPublic: plan.isPublic,
      sortOrder: plan.sortOrder,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (plan: ServicePlan) => {
    if (confirm(`Are you sure you want to delete "${plan.name}"?`)) {
      deleteMutation.mutate(plan.id);
    }
  };

  // Filter plans
  const filteredPlans = plans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Plans</h1>
          <p className="text-muted-foreground mt-1">
            Manage machine configuration templates for VM provisioning
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-plan">
              <Plus className="h-4 w-4" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Service Plan</DialogTitle>
              <DialogDescription>
                Define a new machine configuration template
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Standard Medium" {...field} data-testid="input-plan-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Perfect for web applications"
                          {...field}
                          data-testid="input-plan-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="cpu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPU (vCores)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-plan-cpu" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="memory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Memory (MB)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-plan-memory" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="storage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Storage (GB)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-plan-storage" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="bandwidth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bandwidth (Mbps)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-plan-bandwidth" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (INR/month)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-plan-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="cloudstackOfferingId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CloudStack Offering ID (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Maps to CloudStack" {...field} data-testid="input-cloudstack-id" />
                        </FormControl>
                        <FormDescription>
                          Links this plan to a CloudStack service offering
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Available for VM creation
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-plan-active"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Public</FormLabel>
                          <FormDescription>
                            Visible to all organizations
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-plan-public"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-plan">
                    {createMutation.isPending ? "Creating..." : "Create Plan"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search service plans..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-plans"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Service Plans ({filteredPlans.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading service plans...</div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No service plans found. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Configuration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id} data-testid={`row-plan-${plan.id}`}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {plan.description || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Cpu className="h-3 w-3" />
                          {plan.cpu} vCPU
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <MemoryStick className="h-3 w-3" />
                          {(plan.memory / 1024).toFixed(1)} GB
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <HardDrive className="h-3 w-3" />
                          {plan.storage} GB
                        </Badge>
                        {plan.bandwidth && (
                          <Badge variant="outline" className="gap-1">
                            <Network className="h-3 w-3" />
                            {plan.bandwidth} Mbps
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        {plan.price.toLocaleString()}/mo
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {plan.isActive ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        {plan.isPublic && <Badge variant="outline">Public</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(plan)}
                          data-testid={`button-edit-${plan.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(plan)}
                          data-testid={`button-delete-${plan.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog - Similar structure to create */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service Plan</DialogTitle>
            <DialogDescription>
              Update the machine configuration template
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              {/* Same fields as create form */}
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="cpu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPU (vCores)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="memory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Memory (MB)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="storage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage (GB)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="bandwidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bandwidth (Mbps)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (INR/month)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="cloudstackOfferingId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CloudStack Offering ID (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>Available for VM creation</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Public</FormLabel>
                        <FormDescription>Visible to all organizations</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Plan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
