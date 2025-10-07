import { NetworkCard } from '../network-card';

const mockNetwork = {
  id: "net-001",
  name: "vpc-production",
  type: "vpc" as const,
  cidr: "10.0.0.0/16",
  gateway: "10.0.0.1",
  vlan: "100",
  vmCount: 12,
};

export default function NetworkCardExample() {
  return (
    <NetworkCard 
      network={mockNetwork} 
      onConfigure={(id) => console.log('Configuring:', id)}
    />
  );
}
