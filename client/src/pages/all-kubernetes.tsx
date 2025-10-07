import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Network, Search, Activity, BarChart3 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

//todo: remove mock functionality
interface K8sCluster {
  id: string;
  name: string;
  tenantType: "reseller" | "customer";
  tenantName: string;
  tenantId: string;
  status: "healthy" | "degraded" | "critical";
  version: string;
  nodes: number;
  pods: number;
  cpu: string;
  memory: string;
  namespace: number;
}

const mockClusters: K8sCluster[] = [
  {
    id: "k8s-001",
    name: "prod-cluster-01",
    tenantType: "customer",
    tenantName: "TechStart Solutions",
    tenantId: "cust-001",
    status: "healthy",
    version: "1.28.2",
    nodes: 5,
    pods: 42,
    cpu: "65%",
    memory: "72%",
    namespace: 8,
  },
  {
    id: "k8s-002",
    name: "staging-cluster",
    tenantType: "customer",
    tenantName: "TechStart Solutions",
    tenantId: "cust-001",
    status: "healthy",
    version: "1.28.2",
    nodes: 3,
    pods: 18,
    cpu: "42%",
    memory: "58%",
    namespace: 5,
  },
  {
    id: "k8s-003",
    name: "prod-main",
    tenantType: "customer",
    tenantName: "CloudOps Inc",
    tenantId: "cust-003",
    status: "healthy",
    version: "1.27.5",
    nodes: 8,
    pods: 76,
    cpu: "78%",
    memory: "81%",
    namespace: 12,
  },
  {
    id: "k8s-004",
    name: "dev-cluster",
    tenantType: "customer",
    tenantName: "Digital Ventures Ltd",
    tenantId: "cust-002",
    status: "degraded",
    version: "1.26.8",
    nodes: 2,
    pods: 12,
    cpu: "35%",
    memory: "45%",
    namespace: 3,
  },
];

export default function AllKubernetes() {
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      case "degraded":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "";
    }
  };

  const filteredClusters = mockClusters.filter(
    (cluster) =>
      cluster.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cluster.tenantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalNodes = mockClusters.reduce((sum, c) => sum + c.nodes, 0);
  const totalPods = mockClusters.reduce((sum, c) => sum + c.pods, 0);
  const healthyClusters = mockClusters.filter((c) => c.status === "healthy").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kubernetes Clusters</h1>
          <p className="text-muted-foreground mt-1">
            Platform-wide Kubernetes management across all tenants
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Clusters</p>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-total-clusters">
              {mockClusters.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Healthy</p>
            <Activity className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{healthyClusters}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Nodes</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNodes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Pods</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPods}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by cluster name or tenant..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-clusters"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-base font-medium">Cluster Inventory</h3>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cluster Name</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="text-right">Nodes</TableHead>
                  <TableHead className="text-right">Pods</TableHead>
                  <TableHead className="text-right">Namespaces</TableHead>
                  <TableHead>CPU Usage</TableHead>
                  <TableHead>Memory</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClusters.map((cluster) => (
                  <TableRow key={cluster.id} className="hover-elevate">
                    <TableCell className="font-medium font-mono" data-testid={`cluster-name-${cluster.id}`}>
                      {cluster.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{cluster.tenantName}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {cluster.tenantType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(cluster.status)}>
                        {cluster.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{cluster.version}</TableCell>
                    <TableCell className="text-right">{cluster.nodes}</TableCell>
                    <TableCell className="text-right">{cluster.pods}</TableCell>
                    <TableCell className="text-right">{cluster.namespace}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-chart-2"
                            style={{ width: cluster.cpu }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{cluster.cpu}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-chart-3"
                            style={{ width: cluster.memory }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{cluster.memory}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        data-testid={`button-manage-${cluster.id}`}
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
