import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Network, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ReservedIp } from "@shared/schema";

const createIpSchema = z.object({
  ipAddress: z.string().min(1, "IP address is required").regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Invalid IP address format"),
  state: z.string().default("Allocated"),
  isSourceNat: z.boolean().default(false),
  isStaticNat: z.boolean().default(false),
  vpcId: z.string().optional(),
  networkId: z.string().optional(),
  associatedVmId: z.string().optional(),
  associatedVmName: z.string().optional(),
  zoneId: z.string().min(1, "Zone ID is required"),
  zoneName: z.string().optional(),
  purpose: z.string().optional(),
});

type CreateIpData = z.infer<typeof createIpSchema>;

export default function ReservedIps() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: ips = [], isLoading } = useQuery<ReservedIp[]>({
    queryKey: ["/api/reserved-ips"],
  });

  const form = useForm<CreateIpData>({
    resolver: zodResolver(createIpSchema),
    defaultValues: {
      ipAddress: "",
      state: "Allocated",
      isSourceNat: false,
      isStaticNat: false,
      zoneId: "",
      purpose: "StaticNat",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateIpData) => {
      return await apiRequest("POST", "/api/reserved-ips", data);
    },
    onSuccess: () => {
      toast({ title: "Reserved IP created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/reserved-ips"] });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create reserved IP", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/reserved-ips/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Reserved IP deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/reserved-ips"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete reserved IP", description: error.message, variant: "destructive" });
    },
  });

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case "allocated":
        return "default";
      case "reserved":
        return "secondary";
      case "free":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Reserved IPs</h1>
          <p className="text-muted-foreground mt-1">
            Manage reserved and elastic IP addresses
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-ip">
              <Plus className="mr-2 h-4 w-4" />
              Reserve IP
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reserve IP Address</DialogTitle>
              <DialogDescription>
                Allocate a new reserved IP address
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="ipAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IP Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="192.168.1.100" data-testid="input-ip-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zoneId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zone ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="zone-abc123" data-testid="input-zone-id" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-purpose">
                            <SelectValue placeholder="Select purpose" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="StaticNat">Static NAT</SelectItem>
                          <SelectItem value="Firewall">Firewall</SelectItem>
                          <SelectItem value="LoadBalancer">Load Balancer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isSourceNat"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel>Source NAT</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-source-nat" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isStaticNat"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel>Static NAT</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-static-nat" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-ip">
                  {createMutation.isPending ? "Reserving..." : "Reserve IP"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : ips.length === 0 ? (
        <Card>
          <CardHeader>
            <div className="text-center py-12">
              <Network className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No reserved IPs found</h3>
              <p className="text-muted-foreground mt-2">
                Reserve your first IP address for static assignments
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="mt-4" data-testid="button-create-first-ip">
                <Plus className="mr-2 h-4 w-4" />
                Reserve IP
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ips.map((ip) => (
            <Card key={ip.id} data-testid={`card-ip-${ip.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Network className="h-5 w-5" />
                      {ip.ipAddress}
                      <Badge variant={getStateColor(ip.state)} data-testid={`badge-state-${ip.id}`}>
                        {ip.state}
                      </Badge>
                      {ip.isSourceNat && <Badge variant="default">Source NAT</Badge>}
                      {ip.isStaticNat && <Badge variant="default">Static NAT</Badge>}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {ip.purpose || "No purpose specified"} • Zone: {ip.zoneName || ip.zoneId}
                    </CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteMutation.mutate(ip.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${ip.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Network ID</p>
                    <p className="font-medium">{ip.networkId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">VPC ID</p>
                    <p className="font-medium">{ip.vpcId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Associated VM</p>
                    <p className="font-medium">{ip.associatedVmName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Purpose</p>
                    <p className="font-medium">{ip.purpose || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
