import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { IpsecTunnel } from "@shared/schema";

const createTunnelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  customerGatewayId: z.string().min(1, "Customer gateway ID is required"),
  customerGatewayIp: z.string().min(1, "Customer gateway IP is required"),
  customerCidr: z.string().min(1, "Customer CIDR is required"),
  vpcId: z.string().min(1, "VPC ID is required"),
  publicIp: z.string().optional(),
  state: z.string().default("Disconnected"),
  ikePolicy: z.string().optional(),
  espPolicy: z.string().optional(),
  ikeLifetime: z.coerce.number().default(86400),
  espLifetime: z.coerce.number().default(3600),
  dpd: z.boolean().default(true),
  forceEncap: z.boolean().default(false),
  passive: z.boolean().default(false),
});

type CreateTunnelData = z.infer<typeof createTunnelSchema>;

export default function IpsecTunnels() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: tunnels = [], isLoading } = useQuery<IpsecTunnel[]>({
    queryKey: ["/api/ipsec-tunnels"],
  });

  const form = useForm<CreateTunnelData>({
    resolver: zodResolver(createTunnelSchema),
    defaultValues: {
      name: "",
      customerGatewayId: "",
      customerGatewayIp: "",
      customerCidr: "",
      vpcId: "",
      state: "Disconnected",
      ikeLifetime: 86400,
      espLifetime: 3600,
      dpd: true,
      forceEncap: false,
      passive: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateTunnelData) => {
      return await apiRequest("POST", "/api/ipsec-tunnels", data);
    },
    onSuccess: () => {
      toast({ title: "IPsec tunnel created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/ipsec-tunnels"] });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create IPsec tunnel", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/ipsec-tunnels/${id}`);
    },
    onSuccess: () => {
      toast({ title: "IPsec tunnel deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/ipsec-tunnels"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete IPsec tunnel", description: error.message, variant: "destructive" });
    },
  });

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case "connected":
        return "default";
      case "disconnected":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">IPsec VPN Tunnels</h1>
          <p className="text-muted-foreground mt-1">
            Manage site-to-site VPN connections
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-tunnel">
              <Plus className="mr-2 h-4 w-4" />
              Create Tunnel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create IPsec Tunnel</DialogTitle>
              <DialogDescription>
                Configure a new site-to-site VPN tunnel
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tunnel Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="vpn-to-office" data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerGatewayId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Gateway ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="cgw-abc123" data-testid="input-gateway-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerGatewayIp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Gateway IP</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="203.0.113.1" data-testid="input-gateway-ip" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerCidr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer CIDR</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="10.0.0.0/16" data-testid="input-customer-cidr" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vpcId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VPC ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="vpc-abc123" data-testid="input-vpc-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ikeLifetime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IKE Lifetime (seconds)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="86400" data-testid="input-ike-lifetime" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="espLifetime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ESP Lifetime (seconds)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="3600" data-testid="input-esp-lifetime" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="dpd"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel className="text-xs">DPD</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-dpd" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="forceEncap"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel className="text-xs">Force Encap</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-force-encap" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="passive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel className="text-xs">Passive</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-passive" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-tunnel">
                  {createMutation.isPending ? "Creating..." : "Create Tunnel"}
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
      ) : tunnels.length === 0 ? (
        <Card>
          <CardHeader>
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No IPsec tunnels found</h3>
              <p className="text-muted-foreground mt-2">
                Create your first VPN tunnel for secure site-to-site connectivity
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="mt-4" data-testid="button-create-first-tunnel">
                <Plus className="mr-2 h-4 w-4" />
                Create Tunnel
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tunnels.map((tunnel) => (
            <Card key={tunnel.id} data-testid={`card-tunnel-${tunnel.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {tunnel.name}
                      <Badge variant={getStateColor(tunnel.state)} data-testid={`badge-state-${tunnel.id}`}>
                        {tunnel.state}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {tunnel.customerGatewayIp} → {tunnel.customerCidr}
                    </CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteMutation.mutate(tunnel.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${tunnel.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">VPC ID</p>
                    <p className="font-medium">{tunnel.vpcId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Public IP</p>
                    <p className="font-medium">{tunnel.publicIp || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">IKE Lifetime</p>
                    <p className="font-medium">{tunnel.ikeLifetime}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ESP Lifetime</p>
                    <p className="font-medium">{tunnel.espLifetime}s</p>
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
