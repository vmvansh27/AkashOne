import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Network, Settings } from "lucide-react";

export interface NetworkInfo {
  id: string;
  name: string;
  type: "isolated" | "shared" | "vpc";
  cidr: string;
  gateway: string;
  vlan?: string;
  vmCount: number;
}

interface NetworkCardProps {
  network: NetworkInfo;
  onConfigure?: (id: string) => void;
}

export function NetworkCard({ network, onConfigure }: NetworkCardProps) {
  const typeColors = {
    isolated: "bg-chart-1/10 text-chart-1 border-chart-1/20",
    shared: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    vpc: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  };

  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
            <Network className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm" data-testid={`network-name-${network.id}`}>{network.name}</h3>
            <p className="text-xs text-muted-foreground font-mono">{network.cidr}</p>
          </div>
        </div>
        <Badge variant="outline" className={typeColors[network.type]}>
          {network.type.toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Gateway</p>
            <p className="font-mono text-sm">{network.gateway}</p>
          </div>
          {network.vlan && (
            <div>
              <p className="text-muted-foreground">VLAN</p>
              <p className="font-medium">{network.vlan}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">VMs</p>
            <p className="font-medium">{network.vmCount}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4"
          onClick={() => onConfigure?.(network.id)}
          data-testid={`button-configure-${network.id}`}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </CardContent>
    </Card>
  );
}
