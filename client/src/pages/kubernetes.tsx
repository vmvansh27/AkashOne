import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Play,
  Square,
  Trash2,
  Terminal,
  Activity,
  Server,
  Boxes,
  Download,
  Settings,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { KubernetesCluster } from "@shared/schema";

export default function Kubernetes() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCluster, setNewCluster] = useState({
    name: "",
    version: "v1.28.3",
    region: "us-east-1",
    masterNodes: "3",
    workerNodes: "3",
    instanceType: "m5.large",
    autoHealing: true,
    autoScaling: true,
  });

  const { data: clusters = [], isLoading } = useQuery<KubernetesCluster[]>({
    queryKey: ["/api/kubernetes/clusters"],
  });

  const createClusterMutation = useMutation({
    mutationFn: async (data: typeof newCluster) => {
      return await apiRequest("POST", "/api/kubernetes/clusters", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kubernetes/clusters"] });
      toast({
        title: "Cluster Created",
        description: `Kubernetes cluster "${newCluster.name}" has been created successfully.`,
      });
      setCreateDialogOpen(false);
      setNewCluster({
        name: "",
        version: "v1.28.3",
        region: "us-east-1",
        masterNodes: "3",
        workerNodes: "3",
        instanceType: "m5.large",
        autoHealing: true,
        autoScaling: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create cluster",
        variant: "destructive",
      });
    },
  });

  const updateClusterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<KubernetesCluster> }) => {
      return await apiRequest("PATCH", `/api/kubernetes/clusters/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kubernetes/clusters"] });
      toast({
        title: "Cluster Updated",
        description: "Cluster has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update cluster",
        variant: "destructive",
      });
    },
  });

  const deleteClusterMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/kubernetes/clusters/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kubernetes/clusters"] });
      toast({
        title: "Cluster Deleted",
        description: "Cluster has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete cluster",
        variant: "destructive",
      });
    },
  });

  const filteredClusters = clusters.filter((cluster) =>
    cluster.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "default";
      case "stopped":
        return "secondary";
      case "creating":
        return "outline";
      case "error":
        return "destructive";
      case "updating":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "critical":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const handleCreateCluster = () => {
    createClusterMutation.mutate(newCluster);
  };

  const handleAction = (action: string, cluster: KubernetesCluster) => {
    if (action === "Start") {
      updateClusterMutation.mutate({ id: cluster.id, data: { status: "running" } });
    } else if (action === "Stop") {
      updateClusterMutation.mutate({ id: cluster.id, data: { status: "stopped" } });
    } else if (action === "Delete") {
      if (confirm(`Are you sure you want to delete "${cluster.name}"?`)) {
        deleteClusterMutation.mutate(cluster.id);
      }
    } else {
      toast({
        title: action,
        description: `${action} action for "${cluster.name}" initiated.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kubernetes Clusters</h1>
          <p className="text-muted-foreground mt-1">
            Manage your Kubernetes-as-a-Service clusters
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-cluster">
              <Plus className="h-4 w-4 mr-2" />
              Create Cluster
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Kubernetes Cluster</DialogTitle>
              <DialogDescription>
                Deploy a production-ready Kubernetes cluster with one-click
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="cluster-name">Cluster Name</Label>
                <Input
                  id="cluster-name"
                  placeholder="my-cluster"
                  value={newCluster.name}
                  onChange={(e) => setNewCluster({ ...newCluster, name: e.target.value })}
                  data-testid="input-cluster-name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="k8s-version">Kubernetes Version</Label>
                  <Select
                    value={newCluster.version}
                    onValueChange={(value) => setNewCluster({ ...newCluster, version: value })}
                  >
                    <SelectTrigger id="k8s-version" data-testid="select-k8s-version">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v1.28.3">v1.28.3 (Latest)</SelectItem>
                      <SelectItem value="v1.27.8">v1.27.8</SelectItem>
                      <SelectItem value="v1.26.11">v1.26.11</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={newCluster.region}
                    onValueChange={(value) => setNewCluster({ ...newCluster, region: value })}
                  >
                    <SelectTrigger id="region" data-testid="select-region">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                      <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                      <SelectItem value="eu-central-1">EU (Frankfurt)</SelectItem>
                      <SelectItem value="ap-south-1">Asia Pacific (Mumbai)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="master-nodes">Master Nodes</Label>
                  <Select
                    value={newCluster.masterNodes}
                    onValueChange={(value) => setNewCluster({ ...newCluster, masterNodes: value })}
                  >
                    <SelectTrigger id="master-nodes" data-testid="select-master-nodes">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 (Development)</SelectItem>
                      <SelectItem value="3">3 (Production HA)</SelectItem>
                      <SelectItem value="5">5 (High Availability)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="worker-nodes">Worker Nodes</Label>
                  <Input
                    id="worker-nodes"
                    type="number"
                    min="1"
                    max="20"
                    value={newCluster.workerNodes}
                    onChange={(e) => setNewCluster({ ...newCluster, workerNodes: e.target.value })}
                    data-testid="input-worker-nodes"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instance-type">Node Instance Type</Label>
                <Select
                  value={newCluster.instanceType}
                  onValueChange={(value) => setNewCluster({ ...newCluster, instanceType: value })}
                >
                  <SelectTrigger id="instance-type" data-testid="select-instance-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t3.medium">t3.medium (2 vCPU, 4 GB RAM)</SelectItem>
                    <SelectItem value="t3.large">t3.large (2 vCPU, 8 GB RAM)</SelectItem>
                    <SelectItem value="m5.large">m5.large (2 vCPU, 8 GB RAM)</SelectItem>
                    <SelectItem value="m5.xlarge">m5.xlarge (4 vCPU, 16 GB RAM)</SelectItem>
                    <SelectItem value="m5.2xlarge">m5.2xlarge (8 vCPU, 32 GB RAM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-Healing</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically replace unhealthy nodes
                  </p>
                </div>
                <Button
                  variant={newCluster.autoHealing ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setNewCluster({ ...newCluster, autoHealing: !newCluster.autoHealing })
                  }
                  data-testid="button-toggle-autohealing"
                >
                  {newCluster.autoHealing ? "Enabled" : "Disabled"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-Scaling</p>
                  <p className="text-sm text-muted-foreground">
                    Scale worker nodes based on load
                  </p>
                </div>
                <Button
                  variant={newCluster.autoScaling ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setNewCluster({ ...newCluster, autoScaling: !newCluster.autoScaling })
                  }
                  data-testid="button-toggle-autoscaling"
                >
                  {newCluster.autoScaling ? "Enabled" : "Disabled"}
                </Button>
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
                onClick={handleCreateCluster}
                disabled={!newCluster.name || createClusterMutation.isPending}
                data-testid="button-confirm-create"
              >
                {createClusterMutation.isPending ? "Creating..." : "Create Cluster"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clusters</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-clusters">
              {clusters.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {clusters.filter((c) => c.status === "running").length} running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-nodes">
              {clusters.reduce((sum, c) => sum + c.masterNodes + c.workerNodes, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all clusters</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running Pods</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-running-pods">
              {clusters.reduce((sum, c) => sum + c.podsRunning, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Active workloads</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Kubernetes Clusters</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search clusters..."
                  className="pl-9 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-clusters"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cluster Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Nodes</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>Pods</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClusters.map((cluster) => (
                <TableRow key={cluster.id} data-testid={`row-cluster-${cluster.id}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{cluster.name}</p>
                      <p className="text-sm text-muted-foreground">{cluster.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs">{cluster.version}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(cluster.status)} data-testid={`badge-status-${cluster.id}`}>
                      {cluster.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {cluster.health === "healthy" && (
                        <CheckCircle2 className={`h-4 w-4 ${getHealthColor(cluster.health)}`} />
                      )}
                      {cluster.health !== "healthy" && (
                        <AlertTriangle className={`h-4 w-4 ${getHealthColor(cluster.health)}`} />
                      )}
                      <span className="text-sm capitalize">{cluster.health}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>
                        <span className="font-medium">{cluster.masterNodes}</span> master
                      </p>
                      <p>
                        <span className="font-medium">{cluster.workerNodes}</span> worker
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2 min-w-32">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>CPU</span>
                          <span className="text-muted-foreground">
                            {cluster.cpuUsed}/{cluster.cpuTotal} cores
                          </span>
                        </div>
                        <Progress value={(cluster.cpuUsed / cluster.cpuTotal) * 100} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Memory</span>
                          <span className="text-muted-foreground">
                            {cluster.memoryUsed}/{cluster.memoryTotal} GB
                          </span>
                        </div>
                        <Progress value={(cluster.memoryUsed / cluster.memoryTotal) * 100} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">{cluster.podsRunning}</span>
                      <span className="text-muted-foreground">/{cluster.podsTotal}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{cluster.region}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {cluster.status === "running" && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAction("Stop", cluster)}
                            data-testid={`button-stop-${cluster.id}`}
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAction("Access", cluster)}
                            data-testid={`button-terminal-${cluster.id}`}
                          >
                            <Terminal className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {cluster.status === "stopped" && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleAction("Start", cluster)}
                          data-testid={`button-start-${cluster.id}`}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleAction("Configure", cluster)}
                        data-testid={`button-settings-${cluster.id}`}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleAction("Download Kubeconfig", cluster)}
                        data-testid={`button-download-${cluster.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleAction("Delete", cluster)}
                        disabled={deleteClusterMutation.isPending}
                        data-testid={`button-delete-${cluster.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredClusters.length === 0 && (
            <div className="text-center py-12">
              <Boxes className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No clusters found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search"
                  : "Get started by creating your first Kubernetes cluster"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-first-cluster">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Cluster
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
