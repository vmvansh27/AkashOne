import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HardDrive, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

//todo: remove mock functionality
const mockVolumes = [
  {
    id: "vol-001",
    name: "root-web-server-01",
    size: "50GB",
    used: 32,
    type: "ROOT",
    vm: "web-server-01",
    state: "attached",
  },
  {
    id: "vol-002",
    name: "data-db-primary",
    size: "200GB",
    used: 68,
    type: "DATA",
    vm: "db-primary",
    state: "attached",
  },
  {
    id: "vol-003",
    name: "backup-volume",
    size: "500GB",
    used: 45,
    type: "DATA",
    vm: null,
    state: "detached",
  },
];

export default function Storage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Storage</h1>
          <p className="text-muted-foreground mt-1">
            Manage volumes and storage resources
          </p>
        </div>
        <Button data-testid="button-create-volume">
          <Plus className="h-4 w-4 mr-2" />
          Create Volume
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockVolumes.map((volume) => (
          <Card key={volume.id} className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" data-testid={`volume-name-${volume.id}`}>
                    {volume.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{volume.size}</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={
                  volume.state === "attached"
                    ? "bg-chart-2/10 text-chart-2 border-chart-2/20"
                    : "bg-muted text-muted-foreground border-border"
                }
              >
                {volume.state}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Usage</span>
                  <span className="font-medium">{volume.used}%</span>
                </div>
                <Progress value={volume.used} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{volume.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">VM</p>
                  <p className="font-medium truncate">
                    {volume.vm || <span className="text-muted-foreground">—</span>}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" data-testid={`button-manage-${volume.id}`}>
                Manage Volume
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
