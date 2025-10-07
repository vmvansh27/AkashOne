import { useState } from "react";
import { VMTable, VirtualMachine } from "@/components/vm-table";
import { CreateVMDialog } from "@/components/create-vm-dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

//todo: remove mock functionality
const mockVMs: VirtualMachine[] = [
  {
    id: "vm-001",
    name: "web-server-01",
    status: "running",
    ip: "10.0.1.10",
    template: "Ubuntu 22.04 LTS",
    cpu: "2 vCPU",
    memory: "4GB",
    zone: "Zone 1",
  },
  {
    id: "vm-002",
    name: "db-primary",
    status: "running",
    ip: "10.0.1.15",
    template: "CentOS 8",
    cpu: "4 vCPU",
    memory: "8GB",
    zone: "Zone 1",
  },
  {
    id: "vm-003",
    name: "app-server-02",
    status: "stopped",
    ip: "10.0.1.20",
    template: "Ubuntu 22.04 LTS",
    cpu: "2 vCPU",
    memory: "4GB",
    zone: "Zone 2",
  },
  {
    id: "vm-004",
    name: "cache-redis-01",
    status: "running",
    ip: "10.0.2.5",
    template: "Debian 11",
    cpu: "1 vCPU",
    memory: "2GB",
    zone: "Zone 1",
  },
  {
    id: "vm-005",
    name: "backup-server",
    status: "error",
    ip: "10.0.2.10",
    template: "Windows Server 2022",
    cpu: "2 vCPU",
    memory: "4GB",
    zone: "Zone 3",
  },
];

export default function VirtualMachines() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleVMAction = (action: string, vmId: string) => {
    console.log(`Action ${action} on VM ${vmId}`);
    toast({
      title: `VM Action: ${action}`,
      description: `Executing ${action} on virtual machine ${vmId}`,
    });
  };

  const handleCreateVM = (data: any) => {
    console.log("Creating VM with data:", data);
    toast({
      title: "VM Creation Started",
      description: `Creating virtual machine: ${data.name}`,
    });
  };

  const filteredVMs = mockVMs.filter((vm) =>
    vm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vm.ip.includes(searchQuery) ||
    vm.template.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Virtual Machines</h1>
          <p className="text-muted-foreground mt-1">
            Manage your virtual machine instances
          </p>
        </div>
        <CreateVMDialog onCreateVM={handleCreateVM} />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search VMs by name, IP, or template..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-vms"
          />
        </div>
      </div>

      <VMTable vms={filteredVMs} onAction={handleVMAction} />
    </div>
  );
}
