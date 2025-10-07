import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Server, Search, Power, RotateCw, Trash2 } from "lucide-react";
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
interface VM {
  id: string;
  name: string;
  tenantType: "reseller" | "customer";
  tenantName: string;
  tenantId: string;
  status: "running" | "stopped" | "error";
  cpu: number;
  ram: string;
  storage: string;
  ip: string;
  os: string;
  uptime: string;
}

const mockVMs: VM[] = [
  {
    id: "vm-001",
    name: "web-server-01",
    tenantType: "customer",
    tenantName: "TechStart Solutions",
    tenantId: "cust-001",
    status: "running",
    cpu: 4,
    ram: "8GB",
    storage: "100GB",
    ip: "192.168.1.10",
    os: "Ubuntu 22.04",
    uptime: "15d 7h",
  },
  {
    id: "vm-002",
    name: "db-primary",
    tenantType: "customer",
    tenantName: "TechStart Solutions",
    tenantId: "cust-001",
    status: "running",
    cpu: 8,
    ram: "16GB",
    storage: "500GB",
    ip: "192.168.1.11",
    os: "Ubuntu 22.04",
    uptime: "15d 7h",
  },
  {
    id: "vm-003",
    name: "app-server-01",
    tenantType: "customer",
    tenantName: "CloudOps Inc",
    tenantId: "cust-003",
    status: "running",
    cpu: 2,
    ram: "4GB",
    storage: "80GB",
    ip: "192.168.2.20",
    os: "CentOS 8",
    uptime: "8d 3h",
  },
  {
    id: "vm-004",
    name: "test-server",
    tenantType: "customer",
    tenantName: "Digital Ventures Ltd",
    tenantId: "cust-002",
    status: "stopped",
    cpu: 2,
    ram: "4GB",
    storage: "50GB",
    ip: "192.168.3.30",
    os: "Debian 11",
    uptime: "0d 0h",
  },
];

export default function AllVMs() {
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      case "stopped":
        return "bg-muted text-muted-foreground";
      case "error":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "";
    }
  };

  const filteredVMs = mockVMs.filter(
    (vm) =>
      vm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vm.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vm.ip.includes(searchQuery)
  );

  const runningVMs = mockVMs.filter((vm) => vm.status === "running").length;
  const stoppedVMs = mockVMs.filter((vm) => vm.status === "stopped").length;
  const totalCPU = mockVMs.reduce((sum, vm) => sum + vm.cpu, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Virtual Machines</h1>
          <p className="text-muted-foreground mt-1">
            Platform-wide VM management across all tenants
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total VMs</p>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-total-vms">
              {mockVMs.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Running</p>
            <Power className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{runningVMs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Stopped</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stoppedVMs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total vCPUs</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCPU}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by VM name, tenant, or IP..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-vms"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-base font-medium">Virtual Machine Inventory</h3>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>VM Name</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>vCPU</TableHead>
                  <TableHead>RAM</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>OS</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVMs.map((vm) => (
                  <TableRow key={vm.id} className="hover-elevate">
                    <TableCell className="font-medium font-mono" data-testid={`vm-name-${vm.id}`}>
                      {vm.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{vm.tenantName}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {vm.tenantType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(vm.status)}>
                        {vm.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{vm.cpu}</TableCell>
                    <TableCell>{vm.ram}</TableCell>
                    <TableCell>{vm.storage}</TableCell>
                    <TableCell className="font-mono text-sm">{vm.ip}</TableCell>
                    <TableCell className="text-sm">{vm.os}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{vm.uptime}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-power-${vm.id}`}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-restart-${vm.id}`}
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-delete-${vm.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
