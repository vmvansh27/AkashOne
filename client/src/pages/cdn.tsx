import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloudy, Plus, AlertCircle, CheckCircle, Globe, Zap, Shield } from "lucide-react";

export default function CDN() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Cloudy className="h-8 w-8" />
            CDN Service
          </h1>
          <p className="text-muted-foreground mt-1">
            Content delivery network for global acceleration and performance
          </p>
        </div>
        <Button data-testid="button-create-cdn" disabled>
          <Plus className="h-4 w-4 mr-2" />
          Create CDN Distribution
        </Button>
      </div>

      <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">CDN Provider Integration Required</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                This feature requires integration with CDN providers (Cloudflare, AWS CloudFront, or custom edge servers). Configure origin servers, cache policies, and SSL certificates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Lightning Fast</CardTitle>
            <CardDescription>
              Deliver content from edge locations closest to your users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 200+ global edge locations</li>
              <li>• Sub-50ms latency worldwide</li>
              <li>• HTTP/2 and HTTP/3 support</li>
              <li>• Intelligent routing</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle>DDoS Protection</CardTitle>
            <CardDescription>
              Built-in security to protect your content and applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Automatic DDoS mitigation</li>
              <li>• WAF integration</li>
              <li>• SSL/TLS encryption</li>
              <li>• Bot management</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Globe className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Global Scale</CardTitle>
            <CardDescription>
              Handle traffic spikes with unlimited bandwidth capacity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Unlimited bandwidth</li>
              <li>• Auto-scaling capacity</li>
              <li>• 99.99% uptime SLA</li>
              <li>• Real-time analytics</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No CDN Distributions</CardTitle>
          <CardDescription>Accelerate your content delivery globally</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-12">
          <Cloudy className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground mb-6 max-w-md">
            CDN caches your content at edge locations worldwide, reducing latency and improving user experience for global audiences.
          </p>
          <Button disabled data-testid="button-create-first-cdn">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First CDN Distribution
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supported Content Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Static files (Images, CSS, JavaScript)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Video streaming (HLS, DASH)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Dynamic content acceleration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>API responses</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Software downloads</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Implementation Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Frontend CDN management UI ready</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>CDN provider API integration pending</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Origin server configuration and validation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Cache policy and TTL management</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>SSL certificate provisioning for CDN</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
