import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Network, Plus, Trash2, Globe } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Vpc } from "@shared/schema";

interface CreateVpcData {
  name: string;
  displayName: string;
  cidr: string;
  cloudstackId: string;
  vpcOfferingId: string;
  vpcOfferingName: string;
  zoneId: string;
  zoneName: string;
  networkDomain: string;
  region: string;
}

export default function VPC() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [vpcToDelete, setVpcToDelete] = useState<string | null>(null);

  const { data: vpcs = [], isLoading } = useQuery<Vpc[]>({
    queryKey: ["/api/vpcs"],
  });

  const [formData, setFormData] = useState<CreateVpcData>({
    name: "",
    displayName: "",
    cidr: "10.0.0.0/16",
    cloudstackId: "",
    vpcOfferingId: "",
    vpcOfferingName: "",
    zoneId: "",
    zoneName: "",
    networkDomain: "",
    region: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateVpcData) => {
      return await apiRequest("POST", "/api/vpcs", data);
    },
    onSuccess: () => {
      toast({ title: "VPC created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/vpcs"] });
      setIsCreateOpen(false);
      setFormData({
        name: "",
        displayName: "",
        cidr: "10.0.0.0/16",
        cloudstackId: "",
        vpcOfferingId: "",
        vpcOfferingName: "",
        zoneId: "",
        zoneName: "",
        networkDomain: "",
        region: "",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create VPC", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/vpcs/${id}`);
    },
    onSuccess: () => {
      toast({ title: "VPC deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/vpcs"] });
      setVpcToDelete(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete VPC", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case "enabled":
        return "bg-green-500";
      case "disabled":
        return "bg-red-500";
      case "creating":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Network className="h-8 w-8" />
            VPC Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage your Virtual Private Cloud networks</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-vpc">
          <Plus className="h-4 w-4 mr-2" />
          Create VPC
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your VPCs</CardTitle>
          <CardDescription>Virtual Private Cloud networks for isolated environments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : vpcs.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No VPCs found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first VPC to get started with isolated cloud networking
              </p>
              <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-vpc">
                <Plus className="h-4 w-4 mr-2" />
                Create VPC
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>CIDR</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Network Domain</TableHead>
                  <TableHead>Redundant Router</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vpcs.map((vpc) => (
                  <TableRow key={vpc.id} data-testid={`row-vpc-${vpc.id}`}>
                    <TableCell className="font-medium" data-testid={`text-vpc-name-${vpc.id}`}>
                      {vpc.displayName || vpc.name}
                    </TableCell>
                    <TableCell data-testid={`text-vpc-cidr-${vpc.id}`}>
                      <code className="px-2 py-1 bg-muted rounded text-sm">{vpc.cidr}</code>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStateColor(vpc.state)} data-testid={`badge-vpc-state-${vpc.id}`}>
                        {vpc.state}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-vpc-zone-${vpc.id}`}>{vpc.zoneName || vpc.zoneId}</TableCell>
                    <TableCell data-testid={`text-vpc-region-${vpc.id}`}>{vpc.region || "-"}</TableCell>
                    <TableCell data-testid={`text-vpc-domain-${vpc.id}`}>{vpc.networkDomain || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={vpc.redundantRouter ? "default" : "secondary"} data-testid={`badge-vpc-redundant-${vpc.id}`}>
                        {vpc.redundantRouter ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setVpcToDelete(vpc.id)}
                        data-testid={`button-delete-vpc-${vpc.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create VPC Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-create-vpc">
          <DialogHeader>
            <DialogTitle>Create New VPC</DialogTitle>
            <DialogDescription>
              Create a new Virtual Private Cloud for isolated network environments
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="input-vpc-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    data-testid="input-vpc-display-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidr">CIDR Block *</Label>
                  <Input
                    id="cidr"
                    placeholder="10.0.0.0/16"
                    value={formData.cidr}
                    onChange={(e) => setFormData({ ...formData, cidr: e.target.value })}
                    required
                    data-testid="input-vpc-cidr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cloudstackId">CloudStack ID *</Label>
                  <Input
                    id="cloudstackId"
                    value={formData.cloudstackId}
                    onChange={(e) => setFormData({ ...formData, cloudstackId: e.target.value })}
                    required
                    data-testid="input-vpc-cloudstack-id"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vpcOfferingId">VPC Offering ID *</Label>
                  <Input
                    id="vpcOfferingId"
                    value={formData.vpcOfferingId}
                    onChange={(e) => setFormData({ ...formData, vpcOfferingId: e.target.value })}
                    required
                    data-testid="input-vpc-offering-id"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vpcOfferingName">VPC Offering Name</Label>
                  <Input
                    id="vpcOfferingName"
                    value={formData.vpcOfferingName}
                    onChange={(e) => setFormData({ ...formData, vpcOfferingName: e.target.value })}
                    data-testid="input-vpc-offering-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zoneId">Zone ID *</Label>
                  <Input
                    id="zoneId"
                    value={formData.zoneId}
                    onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                    required
                    data-testid="input-vpc-zone-id"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zoneName">Zone Name</Label>
                  <Input
                    id="zoneName"
                    value={formData.zoneName}
                    onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
                    data-testid="input-vpc-zone-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="networkDomain">Network Domain</Label>
                  <Input
                    id="networkDomain"
                    placeholder="example.local"
                    value={formData.networkDomain}
                    onChange={(e) => setFormData({ ...formData, networkDomain: e.target.value })}
                    data-testid="input-vpc-network-domain"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    data-testid="input-vpc-region"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} data-testid="button-cancel-vpc">
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-vpc">
                {createMutation.isPending ? "Creating..." : "Create VPC"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!vpcToDelete} onOpenChange={() => setVpcToDelete(null)}>
        <DialogContent data-testid="dialog-delete-vpc">
          <DialogHeader>
            <DialogTitle>Delete VPC</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this VPC? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVpcToDelete(null)} data-testid="button-cancel-delete-vpc">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => vpcToDelete && deleteMutation.mutate(vpcToDelete)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete-vpc"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
