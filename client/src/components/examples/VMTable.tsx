import { VMTable } from '../vm-table';

const mockVMs = [
  {
    id: "vm-001",
    name: "web-server-01",
    status: "running" as const,
    ip: "10.0.1.10",
    template: "Ubuntu 22.04 LTS",
    cpu: "2 vCPU",
    memory: "4GB",
    zone: "Zone 1",
  },
  {
    id: "vm-002",
    name: "db-primary",
    status: "stopped" as const,
    ip: "10.0.1.15",
    template: "CentOS 8",
    cpu: "4 vCPU",
    memory: "8GB",
    zone: "Zone 1",
  },
];

export default function VMTableExample() {
  return (
    <VMTable 
      vms={mockVMs} 
      onAction={(action, id) => console.log(action, id)}
    />
  );
}
