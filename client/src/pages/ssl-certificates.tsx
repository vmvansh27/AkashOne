import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, AlertCircle, CheckCircle, Lock, RefreshCw } from "lucide-react";

export default function SSLCertificates() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            SSL Certificate Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Automated SSL/TLS certificate provisioning and management
          </p>
        </div>
        <Button data-testid="button-request-cert" disabled>
          <Plus className="h-4 w-4 mr-2" />
          Request Certificate
        </Button>
      </div>

      <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">Let's Encrypt Integration Required</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                This feature requires Let's Encrypt ACME protocol integration and DNS/HTTP challenge validation setup. Configure automated certificate renewal and domain verification.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Lock className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Free SSL Certificates</CardTitle>
            <CardDescription>
              Let's Encrypt certificates at no cost with automatic renewal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Domain Validation (DV)</li>
              <li>• Wildcard certificates</li>
              <li>• 90-day validity period</li>
              <li>• Unlimited issuance</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <RefreshCw className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Auto-Renewal</CardTitle>
            <CardDescription>
              Automatic certificate renewal before expiration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Automatic renewal at 30 days</li>
              <li>• Zero-downtime deployment</li>
              <li>• Email notifications</li>
              <li>• Renewal history tracking</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Easy Integration</CardTitle>
            <CardDescription>
              One-click integration with your load balancers and VMs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Load balancer SSL termination</li>
              <li>• Direct VM installation</li>
              <li>• Multi-domain support</li>
              <li>• Certificate deployment</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No SSL Certificates</CardTitle>
          <CardDescription>Secure your domains with free SSL certificates</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-12">
          <Shield className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground mb-6 max-w-md">
            SSL certificates encrypt data between your users and your servers, ensuring secure connections and building trust.
          </p>
          <Button disabled data-testid="button-request-first-cert">
            <Plus className="h-4 w-4 mr-2" />
            Request Your First Certificate
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supported Validation Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <p className="font-medium text-sm">HTTP-01 Challenge</p>
              <p className="text-xs text-muted-foreground">
                Validates domain ownership by serving a file over HTTP
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm">DNS-01 Challenge</p>
              <p className="text-xs text-muted-foreground">
                Validates by adding a TXT record to your DNS zone (supports wildcards)
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm">TLS-ALPN-01 Challenge</p>
              <p className="text-xs text-muted-foreground">
                Validates using TLS with ALPN extension
              </p>
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
              <span>Frontend certificate management UI ready</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>ACME protocol client integration pending</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>DNS API integration for DNS-01 challenges</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Certificate storage and deployment automation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Auto-renewal cron job configuration</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
