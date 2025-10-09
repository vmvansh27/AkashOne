import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Trash2,
  Globe,
  Shield,
  RefreshCw,
  Settings,
  CheckCircle2,
  Clock,
  AlertCircle,
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
import type { DnsDomain, DnsRecord } from "@shared/schema";

export default function DNS() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<DnsDomain | null>(null);
  const [createDomainOpen, setCreateDomainOpen] = useState(false);
  const [createRecordOpen, setCreateRecordOpen] = useState(false);
  const [newDomain, setNewDomain] = useState({
    name: "",
    dnssec: false,
  });
  const [newRecord, setNewRecord] = useState({
    type: "A" as DnsRecord["type"],
    name: "",
    value: "",
    ttl: "3600",
    priority: "",
  });

  // Fetch DNS domains
  const { data: domains = [], isLoading: domainsLoading } = useQuery<DnsDomain[]>({
    queryKey: ["/api/dns/domains"],
  });

  // Fetch DNS records for selected domain
  const { data: records = [], isLoading: recordsLoading } = useQuery<DnsRecord[]>({
    queryKey: ["/api/dns/records", selectedDomain?.id],
    enabled: !!selectedDomain,
  });

  // Create domain mutation
  const createDomainMutation = useMutation({
    mutationFn: async (data: { name: string; dnssec: boolean }) => {
      return await apiRequest("POST", "/api/dns/domains", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dns/domains"] });
      toast({
        title: "Domain created",
        description: "DNS domain has been created successfully",
      });
      setCreateDomainOpen(false);
      setNewDomain({ name: "", dnssec: false });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create domain",
        variant: "destructive",
      });
    },
  });

  // Delete domain mutation
  const deleteDomainMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/dns/domains/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dns/domains"] });
      if (selectedDomain) {
        setSelectedDomain(null);
      }
      toast({
        title: "Domain deleted",
        description: "DNS domain has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete domain",
        variant: "destructive",
      });
    },
  });

  // Create record mutation
  const createRecordMutation = useMutation({
    mutationFn: async (data: {
      domainId: string;
      type: string;
      name: string;
      value: string;
      ttl: number;
      priority?: number;
    }) => {
      return await apiRequest("POST", "/api/dns/records", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dns/records", selectedDomain?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dns/domains"] });
      toast({
        title: "Record created",
        description: "DNS record has been created successfully",
      });
      setCreateRecordOpen(false);
      setNewRecord({ type: "A", name: "", value: "", ttl: "3600", priority: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create record",
        variant: "destructive",
      });
    },
  });

  // Delete record mutation
  const deleteRecordMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/dns/records/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dns/records", selectedDomain?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dns/domains"] });
      toast({
        title: "Record deleted",
        description: "DNS record has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete record",
        variant: "destructive",
      });
    },
  });

  const filteredDomains = domains.filter((domain) =>
    domain.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentDomainRecords = records;

  const handleCreateDomain = () => {
    if (!newDomain.name) {
      toast({
        title: "Error",
        description: "Please enter a domain name",
        variant: "destructive",
      });
      return;
    }
    createDomainMutation.mutate(newDomain);
  };

  const handleDeleteDomain = (domain: DnsDomain) => {
    if (confirm(`Are you sure you want to delete "${domain.name}" and all its DNS records?`)) {
      deleteDomainMutation.mutate(domain.id);
    }
  };

  const handleCreateRecord = () => {
    if (!selectedDomain) return;

    if (!newRecord.name || !newRecord.value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createRecordMutation.mutate({
      domainId: selectedDomain.id,
      type: newRecord.type,
      name: newRecord.name,
      value: newRecord.value,
      ttl: parseInt(newRecord.ttl),
      priority: newRecord.priority ? parseInt(newRecord.priority) : undefined,
    });
  };

  const handleDeleteRecord = (record: DnsRecord) => {
    if (confirm(`Are you sure you want to delete this ${record.type} record?`)) {
      deleteRecordMutation.mutate(record.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "outline";
      case "error":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return CheckCircle2;
      case "pending":
        return Clock;
      case "error":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const totalRecords = domains.reduce((sum, d) => sum + d.recordCount, 0);
  const activeDomains = domains.filter((d) => d.status === "active").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DNS Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage domains, zones, and DNS records with DNSSEC support
          </p>
        </div>
        <Dialog open={createDomainOpen} onOpenChange={setCreateDomainOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-domain">
              <Plus className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add DNS Zone</DialogTitle>
              <DialogDescription>
                Create a new DNS zone for your domain
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="domain-name">Domain Name</Label>
                <Input
                  id="domain-name"
                  placeholder="example.com"
                  value={newDomain.name}
                  onChange={(e) => setNewDomain({ ...newDomain, name: e.target.value })}
                  data-testid="input-domain-name"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">DNSSEC</p>
                  <p className="text-sm text-muted-foreground">
                    Enable DNS Security Extensions
                  </p>
                </div>
                <Button
                  variant={newDomain.dnssec ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewDomain({ ...newDomain, dnssec: !newDomain.dnssec })}
                  data-testid="button-toggle-dnssec"
                >
                  {newDomain.dnssec ? "Enabled" : "Disabled"}
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Nameservers</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>ns1.akashone.com</p>
                  <p>ns2.akashone.com</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Point your domain to these nameservers at your registrar
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDomainOpen(false)}
                data-testid="button-cancel-create"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateDomain}
                disabled={!newDomain.name}
                data-testid="button-confirm-create"
              >
                Add Domain
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Domains</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-domains">
              {domains.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeDomains} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DNS Records</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-records">
              {totalRecords}
            </div>
            <p className="text-xs text-muted-foreground">Configured records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DNSSEC Enabled</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-dnssec-enabled">
              {domains.filter((d) => d.dnssec).length}
            </div>
            <p className="text-xs text-muted-foreground">Secured domains</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propagation</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500" data-testid="text-propagation">
              100%
            </div>
            <p className="text-xs text-muted-foreground">All records synced</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>DNS Zones</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search domains..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-domains"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredDomains.map((domain) => {
                const StatusIcon = getStatusIcon(domain.status);
                return (
                  <Card
                    key={domain.id}
                    className={`cursor-pointer hover-elevate ${
                      selectedDomain?.id === domain.id ? "border-primary" : ""
                    }`}
                    onClick={() => setSelectedDomain(domain)}
                    data-testid={`card-domain-${domain.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-muted">
                            <Globe className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate">{domain.name}</p>
                              <Badge variant={getStatusColor(domain.status)} className="text-xs">
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {domain.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p>{domain.recordCount} records</p>
                              <div className="flex gap-2">
                                {domain.dnssec && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    DNSSEC
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDomain(domain);
                          }}
                          data-testid={`button-delete-${domain.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {filteredDomains.length === 0 && (
                <div className="text-center py-12">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No domains found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "Try adjusting your search" : "Add your first domain"}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setCreateDomainOpen(true)} data-testid="button-add-first">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Domain
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedDomain ? `Records for ${selectedDomain.name}` : "Select a Domain"}
              </CardTitle>
              {selectedDomain && (
                <Dialog open={createRecordOpen} onOpenChange={setCreateRecordOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" data-testid="button-add-record">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Record
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add DNS Record</DialogTitle>
                      <DialogDescription>
                        Create a new DNS record for {selectedDomain.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="record-type">Record Type</Label>
                          <Select
                            value={newRecord.type}
                            onValueChange={(value: DnsRecord["type"]) =>
                              setNewRecord({ ...newRecord, type: value })
                            }
                          >
                            <SelectTrigger id="record-type" data-testid="select-record-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A (IPv4)</SelectItem>
                              <SelectItem value="AAAA">AAAA (IPv6)</SelectItem>
                              <SelectItem value="CNAME">CNAME (Alias)</SelectItem>
                              <SelectItem value="MX">MX (Mail)</SelectItem>
                              <SelectItem value="TXT">TXT (Text)</SelectItem>
                              <SelectItem value="NS">NS (Nameserver)</SelectItem>
                              <SelectItem value="SRV">SRV (Service)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="record-ttl">TTL (seconds)</Label>
                          <Select
                            value={newRecord.ttl}
                            onValueChange={(value) => setNewRecord({ ...newRecord, ttl: value })}
                          >
                            <SelectTrigger id="record-ttl" data-testid="select-ttl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="300">5 minutes</SelectItem>
                              <SelectItem value="1800">30 minutes</SelectItem>
                              <SelectItem value="3600">1 hour</SelectItem>
                              <SelectItem value="21600">6 hours</SelectItem>
                              <SelectItem value="86400">24 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="record-name">Name</Label>
                        <Input
                          id="record-name"
                          placeholder="@ or subdomain"
                          value={newRecord.name}
                          onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
                          data-testid="input-record-name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="record-value">Value</Label>
                        <Input
                          id="record-value"
                          placeholder={
                            newRecord.type === "A"
                              ? "192.168.1.1"
                              : newRecord.type === "CNAME"
                              ? "example.com"
                              : "Enter value"
                          }
                          value={newRecord.value}
                          onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })}
                          data-testid="input-record-value"
                        />
                      </div>
                      {newRecord.type === "MX" && (
                        <div className="grid gap-2">
                          <Label htmlFor="record-priority">Priority</Label>
                          <Input
                            id="record-priority"
                            type="number"
                            placeholder="10"
                            value={newRecord.priority}
                            onChange={(e) =>
                              setNewRecord({ ...newRecord, priority: e.target.value })
                            }
                            data-testid="input-record-priority"
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setCreateRecordOpen(false)}
                        data-testid="button-cancel-record"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateRecord}
                        disabled={!newRecord.name || !newRecord.value}
                        data-testid="button-confirm-record"
                      >
                        Add Record
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedDomain ? (
              currentDomainRecords.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>TTL</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentDomainRecords.map((record) => (
                      <TableRow key={record.id} data-testid={`row-record-${record.id}`}>
                        <TableCell>
                          <Badge variant="outline">{record.type}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{record.name}</TableCell>
                        <TableCell className="font-mono text-sm truncate max-w-xs">
                          {record.value}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {record.ttl}s
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteRecord(record)}
                            data-testid={`button-delete-record-${record.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No DNS records</h3>
                  <p className="text-muted-foreground mb-4">
                    Add DNS records to configure your domain
                  </p>
                  <Button onClick={() => setCreateRecordOpen(true)} data-testid="button-add-first-record">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Record
                  </Button>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No domain selected</h3>
                <p className="text-muted-foreground">
                  Select a domain from the left to manage its DNS records
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
