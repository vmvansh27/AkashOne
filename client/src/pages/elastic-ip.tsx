import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function ElasticIP() {
  const { data: featureFlags } = useQuery<Array<{ key: string; enabled: boolean }>>({
    queryKey: ["/api/feature-flags"],
  });

  const isEnabled = featureFlags?.find(f => f.key === "elastic_ip")?.enabled;

  if (!isEnabled) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle>Elastic IP Addresses</CardTitle>
            <CardDescription>
              This feature is currently disabled. Contact your administrator to enable Elastic IP management.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Elastic IP Addresses</h1>
          <p className="text-muted-foreground mt-1">
            Reserve and manage static public IP addresses
          </p>
        </div>
        <Button data-testid="button-allocate-ip">
          <Plus className="w-4 h-4 mr-2" />
          Allocate IP
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total IPs</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-ips">0</div>
            <p className="text-xs text-muted-foreground">No IPs allocated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-assigned-ips">0</div>
            <p className="text-xs text-muted-foreground">IPs in use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-available-ips">0</div>
            <p className="text-xs text-muted-foreground">Unassigned IPs</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Elastic IPs</CardTitle>
          <CardDescription>Manage static public IP addresses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No elastic IPs</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Allocate a static public IP address to maintain consistent connectivity for your resources
            </p>
            <Button data-testid="button-allocate-first-ip">
              <Plus className="w-4 h-4 mr-2" />
              Allocate Your First IP
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
