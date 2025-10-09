import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Play,
  Square,
  Trash2,
  Database as DatabaseIcon,
  Activity,
  HardDrive,
  Users,
  Download,
  Settings,
  RefreshCw,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DatabaseInstance {
  id: string;
  name: string;
  engine: "mysql" | "postgresql" | "mongodb" | "redis";
  version: string;
  status: "running" | "stopped" | "creating" | "error" | "backup";
  storage: number;
  cpu: number;
  memory: number;
  connections: {
    current: number;
    max: number;
  };
  endpoint: string;
  port: number;
  backupEnabled: boolean;
  created: string;
  region: string;
}

const mockDatabases: DatabaseInstance[] = [
  {
    id: "db-mysql-001",
    name: "production-mysql",
    engine: "mysql",
    version: "8.0.35",
    status: "running",
    storage: 100,
    cpu: 4,
    memory: 16,
    connections: { current: 45, max: 200 },
    endpoint: "prod-mysql.akashone.com",
    port: 3306,
    backupEnabled: true,
    created: "2024-09-10",
    region: "us-east-1",
  },
  {
    id: "db-postgres-002",
    name: "analytics-postgres",
    engine: "postgresql",
    version: "15.4",
    status: "running",
    storage: 200,
    cpu: 8,
    memory: 32,
    connections: { current: 28, max: 500 },
    endpoint: "analytics-pg.akashone.com",
    port: 5432,
    backupEnabled: true,
    created: "2024-09-15",
    region: "us-west-2",
  },
  {
    id: "db-mongo-003",
    name: "app-mongodb",
    engine: "mongodb",
    version: "7.0.2",
    status: "running",
    storage: 50,
    cpu: 2,
    memory: 8,
    connections: { current: 12, max: 100 },
    endpoint: "app-mongo.akashone.com",
    port: 27017,
    backupEnabled: false,
    created: "2024-10-01",
    region: "ap-south-1",
  },
  {
    id: "db-redis-004",
    name: "cache-redis",
    engine: "redis",
    version: "7.2.3",
    status: "running",
    storage: 10,
    cpu: 2,
    memory: 4,
    connections: { current: 150, max: 1000 },
    endpoint: "cache-redis.akashone.com",
    port: 6379,
    backupEnabled: true,
    created: "2024-09-20",
    region: "us-east-1",
  },
];

export default function Database() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<"all" | DatabaseInstance["engine"]>("all");
  const [newDatabase, setNewDatabase] = useState({
    name: "",
    engine: "mysql" as DatabaseInstance["engine"],
    version: "8.0.35",
    region: "us-east-1",
    instanceType: "db.m5.large",
    storage: "100",
    backupEnabled: true,
    multiAZ: false,
  });

  const filteredDatabases = mockDatabases.filter((db) => {
    const matchesSearch = db.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEngine = selectedEngine === "all" || db.engine === selectedEngine;
    return matchesSearch && matchesEngine;
  });

  const getEngineVersions = (engine: DatabaseInstance["engine"]) => {
    switch (engine) {
      case "mysql":
        return ["8.0.35", "8.0.34", "5.7.44"];
      case "postgresql":
        return ["15.4", "14.9", "13.12"];
      case "mongodb":
        return ["7.0.2", "6.0.11", "5.0.22"];
      case "redis":
        return ["7.2.3", "7.0.14", "6.2.14"];
      default:
        return [];
    }
  };

  const getEngineIcon = (engine: DatabaseInstance["engine"]) => {
    return DatabaseIcon;
  };

  const getStatusColor = (status: DatabaseInstance["status"]) => {
    switch (status) {
      case "running":
        return "default";
      case "stopped":
        return "secondary";
      case "creating":
        return "outline";
      case "error":
        return "destructive";
      case "backup":
        return "outline";
      default:
        return "secondary";
    }
  };

  const handleCreateDatabase = () => {
    toast({
      title: "Database Creation Started",
      description: `Creating ${newDatabase.engine} database "${newDatabase.name}"...`,
    });
    setCreateDialogOpen(false);
    setNewDatabase({
      name: "",
      engine: "mysql",
      version: "8.0.35",
      region: "us-east-1",
      instanceType: "db.m5.large",
      storage: "100",
      backupEnabled: true,
      multiAZ: false,
    });
  };

  const handleAction = (action: string, database: DatabaseInstance) => {
    toast({
      title: `${action} Database`,
      description: `${action} database "${database.name}"...`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database as a Service</h1>
          <p className="text-muted-foreground mt-1">
            Managed database instances with automated backups and scaling
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-database">
              <Plus className="h-4 w-4 mr-2" />
              Create Database
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Database Instance</DialogTitle>
              <DialogDescription>
                Deploy a managed database with one-click provisioning
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="db-name">Database Name</Label>
                <Input
                  id="db-name"
                  placeholder="my-database"
                  value={newDatabase.name}
                  onChange={(e) => setNewDatabase({ ...newDatabase, name: e.target.value })}
                  data-testid="input-database-name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="db-engine">Database Engine</Label>
                  <Select
                    value={newDatabase.engine}
                    onValueChange={(value: DatabaseInstance["engine"]) => {
                      const versions = getEngineVersions(value);
                      setNewDatabase({ ...newDatabase, engine: value, version: versions[0] });
                    }}
                  >
                    <SelectTrigger id="db-engine" data-testid="select-engine">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mongodb">MongoDB</SelectItem>
                      <SelectItem value="redis">Redis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="db-version">Version</Label>
                  <Select
                    value={newDatabase.version}
                    onValueChange={(value) => setNewDatabase({ ...newDatabase, version: value })}
                  >
                    <SelectTrigger id="db-version" data-testid="select-version">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getEngineVersions(newDatabase.engine).map((version) => (
                        <SelectItem key={version} value={version}>
                          {version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="db-region">Region</Label>
                  <Select
                    value={newDatabase.region}
                    onValueChange={(value) => setNewDatabase({ ...newDatabase, region: value })}
                  >
                    <SelectTrigger id="db-region" data-testid="select-region">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                      <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                      <SelectItem value="eu-central-1">EU (Frankfurt)</SelectItem>
                      <SelectItem value="ap-south-1">Asia Pacific (Mumbai)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="db-storage">Storage (GB)</Label>
                  <Input
                    id="db-storage"
                    type="number"
                    min="20"
                    max="1000"
                    value={newDatabase.storage}
                    onChange={(e) => setNewDatabase({ ...newDatabase, storage: e.target.value })}
                    data-testid="input-storage"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="db-instance-type">Instance Type</Label>
                <Select
                  value={newDatabase.instanceType}
                  onValueChange={(value) => setNewDatabase({ ...newDatabase, instanceType: value })}
                >
                  <SelectTrigger id="db-instance-type" data-testid="select-instance-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="db.t3.micro">db.t3.micro (1 vCPU, 1 GB RAM)</SelectItem>
                    <SelectItem value="db.t3.small">db.t3.small (1 vCPU, 2 GB RAM)</SelectItem>
                    <SelectItem value="db.m5.large">db.m5.large (2 vCPU, 8 GB RAM)</SelectItem>
                    <SelectItem value="db.m5.xlarge">db.m5.xlarge (4 vCPU, 16 GB RAM)</SelectItem>
                    <SelectItem value="db.m5.2xlarge">db.m5.2xlarge (8 vCPU, 32 GB RAM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Automated Backups</p>
                  <p className="text-sm text-muted-foreground">
                    Daily backups with 7-day retention
                  </p>
                </div>
                <Button
                  variant={newDatabase.backupEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setNewDatabase({ ...newDatabase, backupEnabled: !newDatabase.backupEnabled })
                  }
                  data-testid="button-toggle-backup"
                >
                  {newDatabase.backupEnabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Multi-AZ Deployment</p>
                  <p className="text-sm text-muted-foreground">
                    High availability across zones
                  </p>
                </div>
                <Button
                  variant={newDatabase.multiAZ ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setNewDatabase({ ...newDatabase, multiAZ: !newDatabase.multiAZ })
                  }
                  data-testid="button-toggle-multiaz"
                >
                  {newDatabase.multiAZ ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                data-testid="button-cancel-create"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateDatabase}
                disabled={!newDatabase.name}
                data-testid="button-confirm-create"
              >
                Create Database
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Databases</CardTitle>
            <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-databases">
              {mockDatabases.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockDatabases.filter((db) => db.status === "running").length} running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-storage">
              {mockDatabases.reduce((sum, db) => sum + db.storage, 0)} GB
            </div>
            <p className="text-xs text-muted-foreground">Across all instances</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-connections">
              {mockDatabases.reduce((sum, db) => sum + db.connections.current, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Active connections</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backups Enabled</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-backups-enabled">
              {mockDatabases.filter((db) => db.backupEnabled).length}
            </div>
            <p className="text-xs text-muted-foreground">With automated backups</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Database Instances</CardTitle>
            <div className="flex items-center gap-2">
              <Tabs value={selectedEngine} onValueChange={(value: any) => setSelectedEngine(value)}>
                <TabsList>
                  <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                  <TabsTrigger value="mysql" data-testid="tab-mysql">MySQL</TabsTrigger>
                  <TabsTrigger value="postgresql" data-testid="tab-postgresql">PostgreSQL</TabsTrigger>
                  <TabsTrigger value="mongodb" data-testid="tab-mongodb">MongoDB</TabsTrigger>
                  <TabsTrigger value="redis" data-testid="tab-redis">Redis</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search databases..."
                  className="pl-9 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-databases"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Database Name</TableHead>
                <TableHead>Engine</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>Connections</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDatabases.map((database) => (
                <TableRow key={database.id} data-testid={`row-database-${database.id}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{database.name}</p>
                      <p className="text-sm text-muted-foreground">{database.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DatabaseIcon className="h-4 w-4" />
                      <span className="capitalize">{database.engine}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs">{database.version}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(database.status)} data-testid={`badge-status-${database.id}`}>
                      {database.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-xs">
                      <p>{database.endpoint}</p>
                      <p className="text-muted-foreground">:{database.port}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <p>{database.cpu} vCPU, {database.memory} GB RAM</p>
                      <p className="text-muted-foreground">{database.storage} GB Storage</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">{database.connections.current}</span>
                      <span className="text-muted-foreground">/{database.connections.max}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{database.region}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {database.status === "running" && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAction("Stop", database)}
                            data-testid={`button-stop-${database.id}`}
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAction("Backup", database)}
                            data-testid={`button-backup-${database.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {database.status === "stopped" && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleAction("Start", database)}
                          data-testid={`button-start-${database.id}`}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleAction("Configure", database)}
                        data-testid={`button-settings-${database.id}`}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleAction("Delete", database)}
                        data-testid={`button-delete-${database.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredDatabases.length === 0 && (
            <div className="text-center py-12">
              <DatabaseIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No databases found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first managed database"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-first-database">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Database
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
