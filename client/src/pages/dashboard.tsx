import { MetricCard } from "@/components/metric-card";
import { Server, Cpu, HardDrive, Network } from "lucide-react";
import { ResourceChart } from "@/components/resource-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

//todo: remove mock functionality
const mockCPUData = Array.from({ length: 12 }, (_, i) => ({
  time: `${i * 2}h`,
  value: Math.floor(Math.random() * 40) + 30,
}));

//todo: remove mock functionality
const mockMemoryData = Array.from({ length: 12 }, (_, i) => ({
  time: `${i * 2}h`,
  value: Math.floor(Math.random() * 30) + 50,
}));

//todo: remove mock functionality
const recentActivity = [
  { id: 1, action: "VM Created", resource: "web-server-03", time: "2 min ago", type: "success" },
  { id: 2, action: "Network Modified", resource: "vpc-prod-01", time: "15 min ago", type: "info" },
  { id: 3, action: "VM Stopped", resource: "db-primary", time: "1 hour ago", type: "warning" },
  { id: 4, action: "Snapshot Created", resource: "web-server-02", time: "3 hours ago", type: "success" },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your CloudStack infrastructure
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Virtual Machines"
          value="24"
          icon={Server}
          trend="+3 from last week"
          trendUp={true}
        />
        <MetricCard
          title="CPU Usage"
          value="42%"
          icon={Cpu}
          trend="Normal operation"
          trendUp={true}
        />
        <MetricCard
          title="Memory"
          value="68%"
          icon={HardDrive}
          trend="+5% from yesterday"
          trendUp={false}
        />
        <MetricCard
          title="Networks"
          value="8"
          icon={Network}
          trend="2 VPCs, 6 isolated"
        />
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={
                      activity.type === "success"
                        ? "bg-chart-2/10 text-chart-2 border-chart-2/20"
                        : activity.type === "warning"
                        ? "bg-chart-3/10 text-chart-3 border-chart-3/20"
                        : "bg-chart-1/10 text-chart-1 border-chart-1/20"
                    }
                  >
                    {activity.action}
                  </Badge>
                  <span className="font-mono text-sm" data-testid={`activity-resource-${activity.id}`}>
                    {activity.resource}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
