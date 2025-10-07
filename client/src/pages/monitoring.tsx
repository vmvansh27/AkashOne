import { ResourceChart } from "@/components/resource-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";

//todo: remove mock functionality
const mockCPUData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  value: Math.floor(Math.random() * 40) + 30,
}));

//todo: remove mock functionality
const mockMemoryData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  value: Math.floor(Math.random() * 30) + 50,
}));

//todo: remove mock functionality
const mockNetworkData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  value: Math.floor(Math.random() * 60) + 20,
}));

//todo: remove mock functionality
const mockAlerts = [
  {
    id: 1,
    severity: "warning",
    message: "High CPU usage on web-server-01",
    time: "5 min ago",
  },
  {
    id: 2,
    severity: "info",
    message: "Memory usage normal across all zones",
    time: "1 hour ago",
  },
  {
    id: 3,
    severity: "success",
    message: "All systems operational",
    time: "2 hours ago",
  },
];

export default function Monitoring() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monitoring</h1>
        <p className="text-muted-foreground mt-1">
          Real-time infrastructure metrics and alerts
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ResourceChart
          title="CPU Usage (24h)"
          data={mockCPUData}
          color="hsl(var(--chart-1))"
        />
        <ResourceChart
          title="Memory Usage (24h)"
          data={mockMemoryData}
          color="hsl(var(--chart-2))"
        />
        <ResourceChart
          title="Network Traffic (24h)"
          data={mockNetworkData}
          color="hsl(var(--chart-3))"
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  {alert.severity === "warning" ? (
                    <AlertCircle className="h-5 w-5 text-chart-3 mt-0.5" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-chart-2 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm" data-testid={`alert-message-${alert.id}`}>{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      alert.severity === "warning"
                        ? "bg-chart-3/10 text-chart-3 border-chart-3/20"
                        : alert.severity === "success"
                        ? "bg-chart-2/10 text-chart-2 border-chart-2/20"
                        : "bg-chart-1/10 text-chart-1 border-chart-1/20"
                    }
                  >
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
