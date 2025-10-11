import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function SecurityGroups() {
  const { data: featureFlags } = useQuery<Array<{ key: string; enabled: boolean }>>({
    queryKey: ["/api/feature-flags"],
  });

  const isEnabled = featureFlags?.find(f => f.key === "security_groups")?.enabled;

  if (!isEnabled) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle>Security Groups</CardTitle>
            <CardDescription>
              This feature is currently disabled. Contact your administrator to enable security groups.
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
          <h1 className="text-3xl font-semibold">Security Groups</h1>
          <p className="text-muted-foreground mt-1">
            Manage VM security groups with custom rules
          </p>
        </div>
        <Button data-testid="button-create-security-group">
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Groups</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-groups">0</div>
            <p className="text-xs text-muted-foreground">No groups created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-rules">0</div>
            <p className="text-xs text-muted-foreground">Total active rules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected VMs</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-protected-vms">0</div>
            <p className="text-xs text-muted-foreground">VMs in groups</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Security Groups</CardTitle>
          <CardDescription>Manage security groups and their rules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No security groups</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Create security groups to organize and apply firewall rules to multiple VMs
            </p>
            <Button data-testid="button-create-first-group">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Group
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
