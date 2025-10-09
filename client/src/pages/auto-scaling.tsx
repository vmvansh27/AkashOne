import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Plus, AlertCircle, CheckCircle, Activity, Settings } from "lucide-react";

export default function AutoScaling() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            VM Auto-Scaling Groups
          </h1>
          <p className="text-muted-foreground mt-1">
            Automatically scale your infrastructure based on demand
          </p>
        </div>
        <Button data-testid="button-create-asg" disabled>
          <Plus className="h-4 w-4 mr-2" />
          Create Auto-Scaling Group
        </Button>
      </div>

      <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">CloudStack Auto-Scaling Configuration Required</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                This feature requires CloudStack auto-scaling capabilities and monitoring infrastructure. Configure scaling policies, health checks, and CloudWatch-compatible metrics collection.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <TrendingUp className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Dynamic Scaling</CardTitle>
            <CardDescription>
              Automatically adjust capacity based on real-time metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• CPU-based scaling</li>
              <li>• Memory-based scaling</li>
              <li>• Custom metric scaling</li>
              <li>• Predictive scaling</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Activity className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Health Monitoring</CardTitle>
            <CardDescription>
              Continuous health checks with automatic instance replacement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• HTTP/HTTPS health checks</li>
              <li>• TCP port monitoring</li>
              <li>• Custom health endpoints</li>
              <li>• Auto-healing</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Settings className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Scaling Policies</CardTitle>
            <CardDescription>
              Fine-grained control over scaling behavior and limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Target tracking policies</li>
              <li>• Step scaling policies</li>
              <li>• Scheduled scaling</li>
              <li>• Cooldown periods</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No Auto-Scaling Groups</CardTitle>
          <CardDescription>Create your first auto-scaling group to handle traffic automatically</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-12">
          <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground mb-6 max-w-md">
            Auto-scaling groups automatically adjust the number of VM instances based on demand, ensuring optimal performance and cost efficiency.
          </p>
          <Button disabled data-testid="button-create-first-asg">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Auto-Scaling Group
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scaling Triggers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>CPU utilization threshold</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Memory usage percentage</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Network traffic volume</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Request count per second</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Custom CloudWatch metrics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Time-based schedules</span>
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
              <span>Frontend auto-scaling UI ready</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>CloudStack auto-scaling API integration</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Metrics collection infrastructure setup</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Health check endpoint configuration</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Load balancer integration for distribution</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
