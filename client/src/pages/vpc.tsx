import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function VPC() {
  const { data: featureFlags } = useQuery<Array<{ key: string; enabled: boolean }>>({
    queryKey: ["/api/feature-flags"],
  });

  const isEnabled = featureFlags?.find(f => f.key === "vpc")?.enabled;

  if (!isEnabled) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Network className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle>Virtual Private Cloud</CardTitle>
            <CardDescription>
              This feature is currently disabled. Contact your administrator to enable VPC networking.
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
          <h1 className="text-3xl font-semibold">Virtual Private Cloud</h1>
          <p className="text-muted-foreground mt-1">
            Create isolated VPC networks with custom CIDR
          </p>
        </div>
        <Button data-testid="button-create-vpc">
          <Plus className="w-4 h-4 mr-2" />
          Create VPC
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total VPCs</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-vpcs">0</div>
            <p className="text-xs text-muted-foreground">No VPCs created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Tiers</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-network-tiers">0</div>
            <p className="text-xs text-muted-foreground">Total network tiers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ACL Rules</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-acl-rules">0</div>
            <p className="text-xs text-muted-foreground">Network ACL rules</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your VPCs</CardTitle>
          <CardDescription>Manage isolated virtual private cloud networks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Network className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No VPCs yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Create a Virtual Private Cloud to isolate your resources in a custom network topology
            </p>
            <Button data-testid="button-create-first-vpc">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First VPC
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
