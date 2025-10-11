import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVirtualMachineSchema, type VirtualMachine, type VMSnapshot } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Play,
  Square,
  RotateCw,
  Trash2,
  Server,
  Cpu,
  MemoryStick,
  Network,
  Plus,
  Camera,
  History,
} from "lucide-react";
import { z } from "zod";

// Form schema for VM creation
const createVMSchema = insertVirtualMachineSchema
  .omit({
    cloudstackId: true,
    state: true,
    templateName: true,
    serviceOfferingName: true,
    zoneName: true,
    diskSize: true,
    ipAddress: true,
    publicIp: true,
    networkIds: true,
    tags: true,
  })
  .extend({
    displayName: z.string().optional(),
  });

type CreateVMFormData = z.infer<typeof createVMSchema>;

// State badge colors
const getStateBadgeVariant = (state: string) => {
  const stateMap: Record<string, "default" | "secondary" | "destructive"> = {
    Running: "default",
    Stopped: "secondary",
    Starting: "secondary",
    Stopping: "secondary",
    Creating: "secondary",
    Error: "destructive",
    Destroyed: "destructive",
  };
  return stateMap[state] || "secondary";
};

export default function VirtualMachines() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [snapshotsDialogOpen, setSnapshotsDialogOpen] = useState(false);
  const [selectedVM, setSelectedVM] = useState<VirtualMachine | null>(null);
  const [snapshotName, setSnapshotName] = useState("");
  const [snapshotDescription, setSnapshotDescription] = useState("");
  const { toast} = useToast();

  // Fetch VMs
  const { data: vms = [], isLoading: vmsLoading } = useQuery<VirtualMachine[]>({
    queryKey: ["/api/vms"],
  });

  // Fetch CloudStack metadata for provisioning
  const { data: zones = [] } = useQuery<any[]>({
    queryKey: ["/api/cloudstack/zones"],
    enabled: createDialogOpen,
  });

  const { data: serviceOfferings = [] } = useQuery<any[]>({
    queryKey: ["/api/cloudstack/service-offerings"],
    enabled: createDialogOpen,
  });

  const [selectedZone, setSelectedZone] = useState<string>("");
  const { data: templates = [] } = useQuery<any[]>({
    queryKey: ["/api/cloudstack/templates", selectedZone],
    enabled: createDialogOpen && !!selectedZone,
  });

  // Create VM mutation
  const createVMMutation = useMutation({
    mutationFn: async (data: CreateVMFormData) => {
      const res = await apiRequest("POST", "/api/vms", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vms"] });
      setCreateDialogOpen(false);
      toast({
        title: "VM Created",
        description: "Virtual machine has been deployed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // VM lifecycle mutations
  const startVMMutation = useMutation({
    mutationFn: async (vmId: string) => {
      const res = await apiRequest("POST", `/api/vms/${vmId}/start`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vms"] });
      toast({ title: "VM Started", description: "Virtual machine is now running" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const stopVMMutation = useMutation({
    mutationFn: async (vmId: string) => {
      const res = await apiRequest("POST", `/api/vms/${vmId}/stop`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vms"] });
      toast({ title: "VM Stopped", description: "Virtual machine has been stopped" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const rebootVMMutation = useMutation({
    mutationFn: async (vmId: string) => {
      const res = await apiRequest("POST", `/api/vms/${vmId}/reboot`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vms"] });
      toast({ title: "VM Rebooted", description: "Virtual machine is rebooting" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const destroyVMMutation = useMutation({
    mutationFn: async (vmId: string) => {
      const res = await apiRequest("DELETE", `/api/vms/${vmId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vms"] });
      toast({ title: "VM Destroyed", description: "Virtual machine has been deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Snapshot queries and mutations
  const { data: snapshots = [], isLoading: snapshotsLoading } = useQuery<VMSnapshot[]>({
    queryKey: ["/api/vms", selectedVM?.id, "snapshots"],
    enabled: snapshotsDialogOpen && !!selectedVM,
  });

  const createSnapshotMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVM) throw new Error("No VM selected");
      const res = await apiRequest("POST", `/api/vms/${selectedVM.id}/snapshots`, {
        name: snapshotName,
        description: snapshotDescription,
        snapshotMemory: true,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vms", selectedVM?.id, "snapshots"] });
      setSnapshotName("");
      setSnapshotDescription("");
      toast({ title: "Snapshot Created", description: "VM snapshot created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteSnapshotMutation = useMutation({
    mutationFn: async (snapshotId: string) => {
      const res = await apiRequest("DELETE", `/api/snapshots/${snapshotId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vms", selectedVM?.id, "snapshots"] });
      toast({ title: "Snapshot Deleted", description: "Snapshot removed successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const restoreSnapshotMutation = useMutation({
    mutationFn: async (snapshotId: string) => {
      const res = await apiRequest("POST", `/api/snapshots/${snapshotId}/restore`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vms", selectedVM?.id, "snapshots"] });
      setSnapshotsDialogOpen(false);
      toast({ title: "VM Restored", description: "VM restored from snapshot successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Form for creating VM
  const form = useForm<CreateVMFormData>({
    resolver: zodResolver(createVMSchema),
    defaultValues: {
      name: "",
      displayName: "",
      templateId: "",
      serviceOfferingId: "",
      zoneId: "",
      cpu: 1,
      memory: 512,
    },
  });

  const onSubmit = (data: CreateVMFormData) => {
    createVMMutation.mutate(data);
  };

  // Filter VMs by search query
  const filteredVMs = vms.filter(
    (vm) =>
      vm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vm.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vm.ipAddress?.includes(searchQuery) ||
      vm.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Virtual Machines</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your virtual machine instances
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-vm">
              <Plus className="h-4 w-4" />
              Create VM
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Deploy Virtual Machine</DialogTitle>
              <DialogDescription>
                Configure and deploy a new virtual machine instance
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="web-server-01"
                            {...field}
                            data-testid="input-vm-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Web Server 01"
                            {...field}
                            data-testid="input-vm-display-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="zoneId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region / Zone</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedZone(value);
                          // Reset template when zone changes to prevent mismatch
                          form.setValue("templateId", "");
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-zone">
                            <SelectValue placeholder="Select region / zone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {zones.length === 0 && (
                            <div className="px-2 py-3 text-sm text-muted-foreground">
                              No zones available. Please configure CloudStack API.
                            </div>
                          )}
                          {zones.map((zone: any) => (
                            <SelectItem key={zone.id} value={zone.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{zone.name}</span>
                                {zone.description && (
                                  <span className="text-xs text-muted-foreground">{zone.description}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating System Template</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-template">
                            <SelectValue placeholder="Select OS template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!selectedZone && (
                            <div className="px-2 py-3 text-sm text-muted-foreground">
                              Please select a region/zone first
                            </div>
                          )}
                          {selectedZone && templates.length === 0 && (
                            <div className="px-2 py-3 text-sm text-muted-foreground">
                              No templates available for this zone
                            </div>
                          )}
                          {templates.map((template: any) => (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{template.name}</span>
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                  {template.ostypename && <span>{template.ostypename}</span>}
                                  {template.size && <span>• {(template.size / (1024**3)).toFixed(1)} GB</span>}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceOfferingId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Machine Configuration (CPU, RAM, Storage)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-service-offering">
                            <SelectValue placeholder="Select machine configuration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceOfferings.length === 0 && (
                            <div className="px-2 py-3 text-sm text-muted-foreground">
                              No service offerings available
                            </div>
                          )}
                          {serviceOfferings.map((offering: any) => (
                            <SelectItem key={offering.id} value={offering.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{offering.name || offering.displaytext}</span>
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                  <span>{offering.cpunumber} vCPU</span>
                                  <span>•</span>
                                  <span>{(offering.memory / 1024).toFixed(1)} GB RAM</span>
                                  {offering.diskBytesReadRate && (
                                    <>
                                      <span>•</span>
                                      <span>Disk I/O Optimized</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cpu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPU Cores</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="input-cpu"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="memory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Memory (MB)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="input-memory"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createVMMutation.isPending}
                    data-testid="button-deploy-vm"
                  >
                    {createVMMutation.isPending ? "Deploying..." : "Deploy VM"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search VMs by name, IP, or state..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-vms"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Virtual Machines ({filteredVMs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vmsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading VMs...</div>
          ) : filteredVMs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {vms.length === 0 ? "No virtual machines yet. Create one to get started." : "No VMs match your search."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Resources</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVMs.map((vm) => (
                  <TableRow key={vm.id} data-testid={`row-vm-${vm.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium" data-testid={`text-vm-name-${vm.id}`}>
                          {vm.displayName || vm.name}
                        </div>
                        {vm.displayName && vm.displayName !== vm.name && (
                          <div className="text-sm text-muted-foreground">{vm.name}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStateBadgeVariant(vm.state)} data-testid={`badge-state-${vm.id}`}>
                        {vm.state}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-ip-${vm.id}`}>
                      {vm.ipAddress || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Cpu className="h-3 w-3 text-muted-foreground" />
                          <span>{vm.cpu} CPU</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MemoryStick className="h-3 w-3 text-muted-foreground" />
                          <span>{vm.memory}MB</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-zone-${vm.id}`}>
                      {vm.zoneName || vm.zoneId}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {vm.state === "Stopped" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startVMMutation.mutate(vm.id)}
                            disabled={startVMMutation.isPending}
                            data-testid={`button-start-${vm.id}`}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {vm.state === "Running" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => stopVMMutation.mutate(vm.id)}
                              disabled={stopVMMutation.isPending}
                              data-testid={`button-stop-${vm.id}`}
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => rebootVMMutation.mutate(vm.id)}
                              disabled={rebootVMMutation.isPending}
                              data-testid={`button-reboot-${vm.id}`}
                            >
                              <RotateCw className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedVM(vm);
                            setSnapshotsDialogOpen(true);
                          }}
                          data-testid={`button-snapshots-${vm.id}`}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Are you sure you want to destroy ${vm.displayName || vm.name}?`)) {
                              destroyVMMutation.mutate(vm.id);
                            }
                          }}
                          disabled={destroyVMMutation.isPending}
                          data-testid={`button-destroy-${vm.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Snapshots Dialog */}
      <Dialog open={snapshotsDialogOpen} onOpenChange={setSnapshotsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>VM Snapshots - {selectedVM?.displayName || selectedVM?.name}</DialogTitle>
            <DialogDescription>
              Create and manage snapshots for quick backup and restore
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Create Snapshot Form */}
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Create New Snapshot
              </h3>
              <div className="grid gap-3">
                <div>
                  <Label htmlFor="snapshot-name">Snapshot Name</Label>
                  <Input
                    id="snapshot-name"
                    value={snapshotName}
                    onChange={(e) => setSnapshotName(e.target.value)}
                    placeholder="e.g., before-update-2025"
                    data-testid="input-snapshot-name"
                  />
                </div>
                <div>
                  <Label htmlFor="snapshot-description">Description (optional)</Label>
                  <Input
                    id="snapshot-description"
                    value={snapshotDescription}
                    onChange={(e) => setSnapshotDescription(e.target.value)}
                    placeholder="e.g., Snapshot before system update"
                    data-testid="input-snapshot-description"
                  />
                </div>
                <Button
                  onClick={() => createSnapshotMutation.mutate()}
                  disabled={!snapshotName || createSnapshotMutation.isPending}
                  data-testid="button-create-snapshot"
                >
                  {createSnapshotMutation.isPending ? "Creating..." : "Create Snapshot"}
                </Button>
              </div>
            </div>

            {/* Existing Snapshots */}
            <div>
              <h3 className="font-medium mb-3">Existing Snapshots</h3>
              {snapshotsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading snapshots...</div>
              ) : snapshots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No snapshots yet. Create your first snapshot above.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {snapshots.map((snapshot) => (
                      <TableRow key={snapshot.id} data-testid={`row-snapshot-${snapshot.id}`}>
                        <TableCell className="font-medium" data-testid={`text-snapshot-name-${snapshot.id}`}>
                          {snapshot.name}
                        </TableCell>
                        <TableCell data-testid={`text-snapshot-description-${snapshot.id}`}>
                          {snapshot.description || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" data-testid={`badge-snapshot-state-${snapshot.id}`}>
                            {snapshot.state}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-snapshot-created-${snapshot.id}`}>
                          {new Date(snapshot.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => restoreSnapshotMutation.mutate(snapshot.id)}
                              disabled={restoreSnapshotMutation.isPending}
                              data-testid={`button-restore-${snapshot.id}`}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteSnapshotMutation.mutate(snapshot.id)}
                              disabled={deleteSnapshotMutation.isPending}
                              data-testid={`button-delete-snapshot-${snapshot.id}`}
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
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
