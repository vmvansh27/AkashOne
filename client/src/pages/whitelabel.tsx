import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Palette, Globe, Upload, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSuperAdminAccess } from "@/hooks/use-role-access";

export default function WhiteLabel() {
  const { hasAccess, isLoading } = useSuperAdminAccess();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!hasAccess) {
    return null;
  }

  const { toast } = useToast();
  const [branding, setBranding] = useState({
    companyName: "CloudTech Solutions",
    domain: "cloudtech.example.com",
    primaryColor: "#3b82f6",
    logoUrl: "",
  });

  const handleSave = () => {
    console.log("Saving white-label settings:", branding);
    toast({
      title: "Settings Saved",
      description: "White-label configuration updated successfully",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">White-Label Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Customize your branded cloud management console
          </p>
        </div>
        <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
          Reseller Portal
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Branding Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={branding.companyName}
                  onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                  placeholder="Your Company Name"
                  data-testid="input-company-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Brand Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="w-20 h-10"
                    data-testid="input-primary-color"
                  />
                  <Input
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    placeholder="#3b82f6"
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo Upload</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover-elevate cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload logo (PNG, SVG, 200x60px)
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    id="logo"
                    data-testid="input-logo"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Domain Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-domain">Custom Domain</Label>
                <Input
                  id="custom-domain"
                  value={branding.domain}
                  onChange={(e) => setBranding({ ...branding, domain: e.target.value })}
                  placeholder="cloud.yourdomain.com"
                  data-testid="input-custom-domain"
                />
                <p className="text-xs text-muted-foreground">
                  Point your domain's CNAME to: portal.cloudstack.io
                </p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="text-sm font-medium mb-2">DNS Configuration</h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>CNAME</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Host:</span>
                    <span>cloud</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Value:</span>
                    <span>portal.cloudstack.io</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div
                className="h-16 flex items-center px-6"
                style={{ backgroundColor: branding.primaryColor }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-white/20 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {branding.companyName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{branding.companyName}</h3>
                    <p className="text-white/80 text-xs">Cloud Management</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Dashboard</h4>
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: `${branding.primaryColor}10`,
                      color: branding.primaryColor,
                      borderColor: `${branding.primaryColor}40`,
                    }}
                  >
                    Active
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total VMs</p>
                    <p className="text-2xl font-bold mt-1">24</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Networks</p>
                    <p className="text-2xl font-bold mt-1">8</p>
                  </div>
                </div>
                <Button
                  className="w-full"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  Create Virtual Machine
                </Button>
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Customer View URL</p>
              <p className="text-sm font-mono text-muted-foreground break-all">
                https://{branding.domain}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} data-testid="button-save-whitelabel">
          <Save className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
