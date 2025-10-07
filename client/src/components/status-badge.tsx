import { Badge } from "@/components/ui/badge";

export type VMStatus = "running" | "stopped" | "error" | "starting";

interface StatusBadgeProps {
  status: VMStatus;
}

const statusConfig = {
  running: {
    label: "Running",
    className: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  },
  stopped: {
    label: "Stopped",
    className: "bg-muted text-muted-foreground border-border",
  },
  error: {
    label: "Error",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  starting: {
    label: "Starting",
    className: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant="outline" className={config.className} data-testid={`status-${status}`}>
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </Badge>
  );
}
