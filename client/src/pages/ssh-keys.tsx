import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function SSHKeys() {
  const { data: featureFlags } = useQuery<Array<{ key: string; enabled: boolean }>>({
    queryKey: ["/api/feature-flags"],
  });

  const isEnabled = featureFlags?.find(f => f.key === "ssh_keys")?.enabled;

  if (!isEnabled) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Key className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle>SSH Key Management</CardTitle>
            <CardDescription>
              This feature is currently disabled. Contact your administrator to enable SSH key management.
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
          <h1 className="text-3xl font-semibold">SSH Key Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage SSH key pairs for secure VM access
          </p>
        </div>
        <Button data-testid="button-add-ssh-key">
          <Plus className="w-4 h-4 mr-2" />
          Add SSH Key
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-keys">0</div>
            <p className="text-xs text-muted-foreground">No keys registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-keys">0</div>
            <p className="text-xs text-muted-foreground">In use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected VMs</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-protected-vms-ssh">0</div>
            <p className="text-xs text-muted-foreground">VMs with SSH keys</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your SSH Keys</CardTitle>
          <CardDescription>Register and manage SSH key pairs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No SSH keys</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Register your SSH public key to securely access your virtual machines
            </p>
            <Button data-testid="button-add-first-key">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First SSH Key
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
