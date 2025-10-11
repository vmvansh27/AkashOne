import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HardDrive, Plus, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Volumes() {
  const { data: featureFlags } = useQuery<Array<{ key: string; enabled: boolean }>>({
    queryKey: ["/api/feature-flags"],
  });

  const isEnabled = featureFlags?.find(f => f.key === "volumes")?.enabled;

  if (!isEnabled) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <HardDrive className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle>Block Storage Volumes</CardTitle>
            <CardDescription>
              This feature is currently disabled. Contact your administrator to enable block storage management.
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
          <h1 className="text-3xl font-semibold">Block Storage Volumes</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage persistent block storage volumes
          </p>
        </div>
        <Button data-testid="button-create-volume">
          <Plus className="w-4 h-4 mr-2" />
          Create Volume
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volumes</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-volumes">0</div>
            <p className="text-xs text-muted-foreground">No volumes created yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attached</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-attached-volumes">0</div>
            <p className="text-xs text-muted-foreground">Volumes in use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-storage">0 GB</div>
            <p className="text-xs text-muted-foreground">Total provisioned</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Volumes</CardTitle>
          <CardDescription>Manage your block storage volumes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <HardDrive className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No volumes yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Create your first block storage volume to attach persistent storage to your virtual machines
            </p>
            <Button data-testid="button-create-first-volume">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Volume
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
