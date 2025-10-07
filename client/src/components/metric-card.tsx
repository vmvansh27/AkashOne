import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function MetricCard({ title, value, icon: Icon, trend, trendUp }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`metric-${title.toLowerCase().replace(' ', '-')}`}>{value}</div>
        {trend && (
          <p className={`text-xs ${trendUp ? 'text-chart-2' : 'text-chart-3'} mt-1`}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
