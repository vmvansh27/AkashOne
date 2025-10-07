import { NetworkCard, NetworkInfo } from "@/components/network-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

//todo: remove mock functionality
const mockNetworks: NetworkInfo[] = [
  {
    id: "net-001",
    name: "vpc-production",
    type: "vpc",
    cidr: "10.0.0.0/16",
    gateway: "10.0.0.1",
    vlan: "100",
    vmCount: 12,
  },
  {
    id: "net-002",
    name: "isolated-dev",
    type: "isolated",
    cidr: "172.16.0.0/24",
    gateway: "172.16.0.1",
    vmCount: 5,
  },
  {
    id: "net-003",
    name: "shared-public",
    type: "shared",
    cidr: "192.168.1.0/24",
    gateway: "192.168.1.1",
    vlan: "200",
    vmCount: 8,
  },
  {
    id: "net-004",
    name: "vpc-staging",
    type: "vpc",
    cidr: "10.1.0.0/16",
    gateway: "10.1.0.1",
    vlan: "150",
    vmCount: 6,
  },
];

export default function Networks() {
  const { toast } = useToast();

  const handleConfigure = (networkId: string) => {
    console.log("Configuring network:", networkId);
    toast({
      title: "Network Configuration",
      description: `Opening configuration for network ${networkId}`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Networks</h1>
          <p className="text-muted-foreground mt-1">
            Manage VPCs, isolated, and shared networks
          </p>
        </div>
        <Button data-testid="button-create-network">
          <Plus className="h-4 w-4 mr-2" />
          Create Network
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockNetworks.map((network) => (
          <NetworkCard
            key={network.id}
            network={network}
            onConfigure={handleConfigure}
          />
        ))}
      </div>
    </div>
  );
}
