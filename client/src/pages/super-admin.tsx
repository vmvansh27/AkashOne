import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Server, Network, Building2, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

//todo: remove mock functionality
interface TenantNode {
  id: string;
  name: string;
  type: "platform" | "reseller" | "customer";
  gstin?: string;
  admins: number;
  customers?: number;
  vms: number;
  k8sClusters: number;
  revenue: number;
  status: "active" | "suspended" | "trial";
  children?: TenantNode[];
}

const mockTenantTree: TenantNode = {
  id: "platform-root",
  name: "AkashOne Platform",
  type: "platform",
  admins: 5,
  vms: 487,
  k8sClusters: 23,
  revenue: 2450000,
  status: "active",
  children: [
    {
      id: "res-001",
      name: "CloudTech Solutions",
      type: "reseller",
      gstin: "29ABCDE1234F1Z5",
      admins: 3,
      customers: 45,
      vms: 128,
      k8sClusters: 8,
      revenue: 245000,
      status: "active",
      children: [
        {
          id: "cust-001",
          name: "TechStart Solutions",
          type: "customer",
          gstin: "29XYZTE1234A1B2",
          admins: 2,
          vms: 12,
          k8sClusters: 2,
          revenue: 45000,
          status: "active",
        },
        {
          id: "cust-002",
          name: "Digital Ventures Ltd",
          type: "customer",
          gstin: "29PQRST5678C2D3",
          admins: 1,
          vms: 8,
          k8sClusters: 1,
          revenue: 32000,
          status: "active",
        },
      ],
    },
    {
      id: "res-002",
      name: "Enterprise Cloud Services",
      type: "reseller",
      gstin: "19MNOPQ9012R3S4",
      admins: 2,
      customers: 18,
      vms: 56,
      k8sClusters: 4,
      revenue: 124000,
      status: "active",
      children: [
        {
          id: "cust-003",
          name: "CloudOps Inc",
          type: "customer",
          gstin: "27UVWXY9012E3F4",
          admins: 2,
          vms: 15,
          k8sClusters: 2,
          revenue: 58000,
          status: "active",
        },
      ],
    },
    {
      id: "dir-001",
      name: "Direct Customers",
      type: "reseller",
      admins: 8,
      customers: 32,
      vms: 303,
      k8sClusters: 11,
      revenue: 2081000,
      status: "active",
      children: [
        {
          id: "cust-004",
          name: "Global Tech Corp",
          type: "customer",
          gstin: "07ABCXY1234Z5W6",
          admins: 5,
          vms: 45,
          k8sClusters: 3,
          revenue: 185000,
          status: "active",
        },
        {
          id: "cust-005",
          name: "Innovation Labs",
          type: "customer",
          gstin: "29DEFGH5678A1B2",
          admins: 3,
          vms: 28,
          k8sClusters: 2,
          revenue: 98000,
          status: "trial",
        },
      ],
    },
  ],
};

function TenantTreeNode({ node, level = 0 }: { node: TenantNode; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "platform":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20";
      case "reseller":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      case "customer":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      case "trial":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      case "suspended":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-2">
      <div
        className="rounded-lg border p-4 hover-elevate cursor-pointer"
        style={{ marginLeft: `${level * 2}rem` }}
        onClick={() => node.children && setIsExpanded(!isExpanded)}
        data-testid={`tenant-node-${node.id}`}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {node.children && node.children.length > 0 && (
              <Button size="icon" variant="ghost" className="h-6 w-6 flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            {(!node.children || node.children.length === 0) && <div className="w-6" />}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold" data-testid={`tenant-name-${node.id}`}>
                  {node.name}
                </h4>
                <Badge variant="outline" className={getTypeColor(node.type)}>
                  {node.type}
                </Badge>
                <Badge variant="outline" className={getStatusColor(node.status)}>
                  {node.status}
                </Badge>
              </div>
              {node.gstin && (
                <p className="text-sm text-muted-foreground font-mono mt-1">
                  GSTIN: {node.gstin}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Admins</p>
              <p className="text-sm font-semibold">{node.admins}</p>
            </div>
            {node.customers !== undefined && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Customers</p>
                <p className="text-sm font-semibold">{node.customers}</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">VMs</p>
              <p className="text-sm font-semibold">{node.vms}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">K8s</p>
              <p className="text-sm font-semibold">{node.k8sClusters}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-sm font-semibold font-mono">
                ₹{(node.revenue / 1000).toFixed(0)}K
              </p>
            </div>
            <Button size="sm" variant="outline" data-testid={`button-manage-${node.id}`}>
              Manage
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && node.children && (
        <div className="space-y-2">
          {node.children.map((child) => (
            <TenantTreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SuperAdmin() {
  const totalStats = {
    resellers: 3,
    customers: 95,
    totalVMs: 487,
    totalK8s: 23,
    totalAdmins: 18,
    totalRevenue: 2450000,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Panel</h1>
          <p className="text-muted-foreground mt-1">
            Hierarchical tenant management and platform control
          </p>
        </div>
        <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
          <Shield className="h-3 w-3 mr-1" />
          Super Admin Access
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Resellers</p>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-total-resellers-admin">
              {totalStats.resellers}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Customers</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.customers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total VMs</p>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalVMs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">K8s Clusters</p>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalK8s}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Admins</p>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalAdmins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Revenue</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalStats.totalRevenue / 100000).toFixed(1)}L</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium">Tenant Hierarchy</h3>
            <p className="text-sm text-muted-foreground">
              Hierarchical view of all tenants, resellers, and customers
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <TenantTreeNode node={mockTenantTree} />
        </CardContent>
      </Card>
    </div>
  );
}
