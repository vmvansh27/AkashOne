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
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Database as DatabaseType } from "@shared/schema";

export default function Database() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<"all" | DatabaseType["engine"]>("all");
  const [newDatabase, setNewDatabase] = useState({
    name: "",
    engine: "mysql" as DatabaseType["engine"],
    version: "8.0.35",
    region: "us-east-1",
    instanceType: "db.m5.large",
    storage: "100",
    cpu: "2",
    memory: "8",
    backupEnabled: true,
    multiAZ: false,
  });

  const { data: databases = [], isLoading } = useQuery<DatabaseType[]>({
    queryKey: ["/api/databases"],
  });

  const createDatabaseMutation = useMutation({
    mutationFn: async (data: typeof newDatabase) => {
      return await apiRequest("POST", "/api/databases", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/databases"] });
      toast({
        title: "Database Created",
        description: `Database "${newDatabase.name}" has been created successfully.`,
      });
      setCreateDialogOpen(false);
      setNewDatabase({
        name: "",
        engine: "mysql",
        version: "8.0.35",
        region: "us-east-1",
        instanceType: "db.m5.large",
        storage: "100",
        cpu: "2",
        memory: "8",
        backupEnabled: true,
        multiAZ: false,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create database",
        variant: "destructive",
      });
    },
  });

  const updateDatabaseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DatabaseType> }) => {
      return await apiRequest("PATCH", `/api/databases/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/databases"] });
      toast({
        title: "Database Updated",
        description: "Database has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update database",
        variant: "destructive",
      });
    },
  });

  const deleteDatabaseMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/databases/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/databases"] });
      toast({
        title: "Database Deleted",
        description: "Database has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete database",
        variant: "destructive",
      });
    },
  });

  const filteredDatabases = databases.filter((db) => {
    const matchesSearch = db.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEngine = selectedEngine === "all" || db.engine === selectedEngine;
    return matchesSearch && matchesEngine;
  });

  const getEngineVersions = (engine: DatabaseType["engine"]) => {
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

  const getStatusColor = (status: string) => {
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

  const getEngineColor = (engine: string) => {
    switch (engine) {
      case "mysql":
        return "bg-blue-500";
      case "postgresql":
        return "bg-indigo-500";
      case "mongodb":
        return "bg-green-500";
      case "redis":
        return "bg-red-500";
      default:
        return "bg-muted";
    }
  };

  const handleCreateDatabase = () => {
    createDatabaseMutation.mutate(newDatabase);
  };

  const handleAction = (action: string, database: DatabaseType) => {
    if (action === "Start") {
      updateDatabaseMutation.mutate({ id: database.id, data: { status: "running" } });
    } else if (action === "Stop") {
      updateDatabaseMutation.mutate({ id: database.id, data: { status: "stopped" } });
    } else if (action === "Delete") {
      if (confirm(`Are you sure you want to delete "${database.name}"? This action cannot be undone.`)) {
        deleteDatabaseMutation.mutate(database.id);
      }
    } else if (action === "Backup") {
      updateDatabaseMutation.mutate({ id: database.id, data: { status: "backup" } });
      toast({
        title: "Backup Initiated",
        description: `Creating backup for "${database.name}"`,
      });
    } else {
      toast({
        title: action,
        description: `${action} action for "${database.name}" initiated.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Services</h1>
          <p className="text-muted-foreground mt-1">
            Manage your Database-as-a-Service instances
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
                Deploy a fully-managed database with automatic backups and scaling
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
                    onValueChange={(value: DatabaseType["engine"]) => {
                      const versions = getEngineVersions(value);
                      setNewDatabase({ ...newDatabase, engine: value, version: versions[0] });
                    }}
                  >
                    <SelectTrigger id="db-engine" data-testid="select-db-engine">
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
                    <SelectTrigger id="db-version" data-testid="select-db-version">
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
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={newDatabase.region}
                    onValueChange={(value) => setNewDatabase({ ...newDatabase, region: value })}
                  >
                    <SelectTrigger id="region" data-testid="select-region">
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
                  <Label htmlFor="instance-type">Instance Type</Label>
                  <Select
                    value={newDatabase.instanceType}
                    onValueChange={(value) => setNewDatabase({ ...newDatabase, instanceType: value })}
                  >
                    <SelectTrigger id="instance-type" data-testid="select-instance-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="db.t3.micro">db.t3.micro (1 vCPU, 1 GB RAM)</SelectItem>
                      <SelectItem value="db.t3.small">db.t3.small (2 vCPU, 2 GB RAM)</SelectItem>
                      <SelectItem value="db.m5.large">db.m5.large (2 vCPU, 8 GB RAM)</SelectItem>
                      <SelectItem value="db.m5.xlarge">db.m5.xlarge (4 vCPU, 16 GB RAM)</SelectItem>
                      <SelectItem value="db.m5.2xlarge">db.m5.2xlarge (8 vCPU, 32 GB RAM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="storage">Storage Size (GB)</Label>
                <Input
                  id="storage"
                  type="number"
                  min="20"
                  max="16000"
                  value={newDatabase.storage}
                  onChange={(e) => setNewDatabase({ ...newDatabase, storage: e.target.value })}
                  data-testid="input-storage-size"
                />
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
                    High availability across multiple zones
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
                disabled={!newDatabase.name || createDatabaseMutation.isPending}
                data-testid="button-confirm-create"
              >
                {createDatabaseMutation.isPending ? "Creating..." : "Create Database"}
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
              {databases.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {databases.filter((d) => d.status === "running").length} running
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
              {databases.reduce((sum, d) => sum + d.storage, 0)} GB
            </div>
            <p className="text-xs text-muted-foreground">Across all instances</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-connections">
              {databases.reduce((sum, d) => sum + d.connectionsMax, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Max connections</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backups Enabled</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-backups-enabled">
              {databases.filter((d) => d.backupEnabled).length}
            </div>
            <p className="text-xs text-muted-foreground">Active backup policies</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>Database Instances</CardTitle>
              <Tabs value={selectedEngine} onValueChange={(v) => setSelectedEngine(v as any)}>
                <TabsList data-testid="tabs-engine-filter">
                  <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                  <TabsTrigger value="mysql" data-testid="tab-mysql">MySQL</TabsTrigger>
                  <TabsTrigger value="postgresql" data-testid="tab-postgresql">PostgreSQL</TabsTrigger>
                  <TabsTrigger value="mongodb" data-testid="tab-mongodb">MongoDB</TabsTrigger>
                  <TabsTrigger value="redis" data-testid="tab-redis">Redis</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center gap-2">
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
                <TableHead>Status</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Storage</TableHead>
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
                      <div className={`h-2 w-2 rounded-full ${getEngineColor(database.engine)}`} />
                      <div>
                        <p className="font-medium capitalize">{database.engine}</p>
                        <p className="text-xs text-muted-foreground">{database.version}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(database.status)} data-testid={`badge-status-${database.id}`}>
                      {database.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-mono">{database.endpoint}</p>
                      <p className="text-xs text-muted-foreground">Port: {database.port}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{database.storage} GB</p>
                      <p className="text-xs text-muted-foreground">
                        {database.backupEnabled ? "Backup: Yes" : "Backup: No"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>CPU: {database.cpu} cores</p>
                      <p>RAM: {database.memory} GB</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{database.connectionsCurrent}</p>
                      <p className="text-xs text-muted-foreground">
                        / {database.connectionsMax} max
                      </p>
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
                            <RefreshCw className="h-4 w-4" />
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
                        onClick={() => handleAction("Download", database)}
                        data-testid={`button-download-${database.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleAction("Delete", database)}
                        disabled={deleteDatabaseMutation.isPending}
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
                  : "Get started by creating your first database instance"}
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
