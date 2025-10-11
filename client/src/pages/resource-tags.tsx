import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function ResourceTags() {
  const { data: featureFlags } = useQuery<Array<{ key: string; enabled: boolean }>>({
    queryKey: ["/api/feature-flags"],
  });

  const isEnabled = featureFlags?.find(f => f.key === "resource_tags")?.enabled;

  if (!isEnabled) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Tag className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle>Resource Tags</CardTitle>
            <CardDescription>
              This feature is currently disabled. Contact your administrator to enable resource tagging.
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
          <h1 className="text-3xl font-semibold">Resource Tags</h1>
          <p className="text-muted-foreground mt-1">
            Organize resources with key-value tags
          </p>
        </div>
        <Button data-testid="button-create-tag">
          <Plus className="w-4 h-4 mr-2" />
          Create Tag
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-tags">0</div>
            <p className="text-xs text-muted-foreground">No tags created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tagged Resources</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-tagged-resources">0</div>
            <p className="text-xs text-muted-foreground">Resources with tags</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tag Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-tag-categories">0</div>
            <p className="text-xs text-muted-foreground">Unique tag keys</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Resource Tags</CardTitle>
          <CardDescription>Manage tags for organization and billing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Tag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tags yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Create tags to categorize your resources for better organization and cost tracking
            </p>
            <Button data-testid="button-create-first-tag">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Tag
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
