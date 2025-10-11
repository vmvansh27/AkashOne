import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function ImagesTemplates() {
  const { data: featureFlags } = useQuery<Array<{ key: string; enabled: boolean }>>({
    queryKey: ["/api/feature-flags"],
  });

  const isEnabled = featureFlags?.find(f => f.key === "images_templates")?.enabled;

  if (!isEnabled) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Image className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle>Images & Templates</CardTitle>
            <CardDescription>
              This feature is currently disabled. Contact your administrator to enable image management.
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
          <h1 className="text-3xl font-semibold">Images & Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage VM templates, ISOs, and custom images
          </p>
        </div>
        <Button data-testid="button-upload-image">
          <Plus className="w-4 h-4 mr-2" />
          Upload Image
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-templates">0</div>
            <p className="text-xs text-muted-foreground">VM templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ISOs</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-isos">0</div>
            <p className="text-xs text-muted-foreground">Boot ISOs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Images</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-custom-images">0</div>
            <p className="text-xs text-muted-foreground">User images</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Images & Templates</CardTitle>
          <CardDescription>Browse and manage custom VM images</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Image className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No custom images</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Upload your custom VM templates and ISOs to quickly deploy standardized instances
            </p>
            <Button data-testid="button-upload-first-image">
              <Plus className="w-4 h-4 mr-2" />
              Upload Your First Image
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
