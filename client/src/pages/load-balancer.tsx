import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Network, Plus, AlertCircle, CheckCircle, Activity, Shield } from "lucide-react";

export default function LoadBalancer() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Network className="h-8 w-8" />
            Load Balancer Service
          </h1>
          <p className="text-muted-foreground mt-1">
            Distribute traffic across multiple instances for high availability
          </p>
        </div>
        <Button data-testid="button-create-lb" disabled>
          <Plus className="h-4 w-4 mr-2" />
          Create Load Balancer
        </Button>
      </div>

      <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">CloudStack Load Balancer Configuration Required</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                This feature requires CloudStack load balancer service configuration. Ensure your CloudStack zone has load balancing capabilities enabled and network offerings configured.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Activity className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Layer 4 Load Balancing</CardTitle>
            <CardDescription>
              TCP/UDP load balancing with high performance and low latency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• TCP/UDP protocol support</li>
              <li>• Session persistence</li>
              <li>• Health check monitoring</li>
              <li>• SSL passthrough</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Layer 7 Load Balancing</CardTitle>
            <CardDescription>
              HTTP/HTTPS load balancing with advanced routing capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• URL-based routing</li>
              <li>• SSL termination</li>
              <li>• Cookie-based affinity</li>
              <li>• Content-based routing</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Network className="h-8 w-8 text-primary mb-2" />
            <CardTitle>High Availability</CardTitle>
            <CardDescription>
              Automatic failover and redundancy for mission-critical applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Multi-zone deployment</li>
              <li>• Automatic failover</li>
              <li>• Health monitoring</li>
              <li>• 99.99% uptime SLA</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No Load Balancers</CardTitle>
          <CardDescription>Get started by creating your first load balancer</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-12">
          <Network className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground mb-6 max-w-md">
            Load balancers distribute incoming traffic across multiple backend instances to ensure high availability and reliability.
          </p>
          <Button disabled data-testid="button-create-first-lb">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Load Balancer
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Implementation Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Frontend load balancer management UI ready</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>CloudStack load balancer API integration pending</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Network offering with load balancer capability required</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Health check and monitoring integration needed</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
