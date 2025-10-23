import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSuperAdminAccess } from "@/hooks/use-role-access";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Settings,
  Server,
  Network,
  Receipt,
  HardDrive,
  Database,
  Globe,
  CreditCard,
  Calculator,
  Zap,
  Shield,
  Cloudy,
  TrendingUp,
  Container,
} from "lucide-react";
import type { FeatureFlag } from "@shared/schema";

const iconMap: Record<string, any> = {
  Server,
  Container,
  Database,
  Globe,
  HardDrive,
  Receipt,
  CreditCard,
  Calculator,
  Network,
  Zap,
  Shield,
  Cloudy,
  TrendingUp,
};

export default function FeatureManagement() {
  const { hasAccess, isLoading: isCheckingAccess } = useSuperAdminAccess();

  if (isCheckingAccess) {
    return <div className="p-8">Loading...</div>;
  }

  if (!hasAccess) {
    return null;
  }

  const { toast } = useToast();

  // Fetch all feature flags
  const { data: features = [], isLoading } = useQuery<FeatureFlag[]>({
    queryKey: ["/api/feature-flags"],
  });

  // Toggle feature mutation
  const toggleFeatureMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      return apiRequest("PATCH", `/api/feature-flags/${id}`, { enabled });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/feature-flags"] });
      toast({
        title: variables.enabled ? "Feature Enabled" : "Feature Disabled",
        description: "Feature flag updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update feature flag",
      });
    },
  });

  // Group features by category
  const categorizedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, FeatureFlag[]>);

  const categories = Object.keys(categorizedFeatures).sort();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Feature Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Control which features are visible to resellers and customers
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Super Admin Feature Control</p>
              <p className="text-sm text-muted-foreground mt-1">
                Enable features only when your backend infrastructure is ready. Disabled features will be hidden from all users including resellers and customers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">Loading features...</div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-xl">{category}</CardTitle>
                <CardDescription>
                  {category === "Compute" && "Virtual machines, containers, and compute services"}
                  {category === "Networking" && "Network infrastructure and connectivity"}
                  {category === "Billing" && "Payment and billing management"}
                  {category === "Storage" && "Data storage and management"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Feature</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[100px] text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categorizedFeatures[category].map((feature) => {
                      const IconComponent = feature.icon ? iconMap[feature.icon] : Settings;
                      return (
                        <TableRow key={feature.id} data-testid={`row-feature-${feature.key}`}>
                          <TableCell>
                            {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium" data-testid={`text-feature-name-${feature.key}`}>
                              {feature.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground" data-testid={`text-feature-description-${feature.key}`}>
                              {feature.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={feature.enabled ? "default" : "secondary"}
                              data-testid={`badge-status-${feature.key}`}
                            >
                              {feature.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Switch
                              checked={feature.enabled}
                              onCheckedChange={(enabled) => {
                                toggleFeatureMutation.mutate({ id: feature.id, enabled });
                              }}
                              disabled={toggleFeatureMutation.isPending}
                              data-testid={`switch-toggle-${feature.key}`}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-base">Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• <strong>Enabled features</strong> appear in the navigation menu and are accessible to all users</p>
          <p>• <strong>Disabled features</strong> are completely hidden from the UI and blocked at the API level</p>
          <p>• Enable features gradually as you complete backend integration and CloudStack configuration</p>
          <p>• All feature changes take effect immediately without requiring users to reload</p>
        </CardContent>
      </Card>
    </div>
  );
}
