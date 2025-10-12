import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { FirewallRule } from "@shared/schema";

const createRuleSchema = z.object({
  protocol: z.string().min(1, "Protocol is required"),
  startPort: z.coerce.number().optional(),
  endPort: z.coerce.number().optional(),
  cidrList: z.string().min(1, "CIDR list is required"),
  ipAddress: z.string().optional(),
  ipAddressId: z.string().optional(),
  purpose: z.string().optional(),
  networkId: z.string().optional(),
});

type CreateRuleData = z.infer<typeof createRuleSchema>;

export default function FirewallRules() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: rules = [], isLoading } = useQuery<FirewallRule[]>({
    queryKey: ["/api/firewall-rules"],
  });

  const form = useForm<CreateRuleData>({
    resolver: zodResolver(createRuleSchema),
    defaultValues: {
      protocol: "tcp",
      startPort: 80,
      endPort: 80,
      cidrList: "0.0.0.0/0",
      purpose: "Firewall",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateRuleData) => {
      // Convert cidrList string to array
      const cidrArray = data.cidrList.split(',').map(c => c.trim());
      return await apiRequest("POST", "/api/firewall-rules", {
        ...data,
        cidrList: cidrArray,
      });
    },
    onSuccess: () => {
      toast({ title: "Firewall rule created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/firewall-rules"] });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create firewall rule", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/firewall-rules/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Firewall rule deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/firewall-rules"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete firewall rule", description: error.message, variant: "destructive" });
    },
  });

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Firewall Rules</h1>
          <p className="text-muted-foreground mt-1">
            Configure network security and access control rules
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-rule">
              <Plus className="mr-2 h-4 w-4" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Firewall Rule</DialogTitle>
              <DialogDescription>
                Add a new firewall rule to control network traffic
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="protocol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protocol</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-protocol">
                            <SelectValue placeholder="Select protocol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="tcp">TCP</SelectItem>
                          <SelectItem value="udp">UDP</SelectItem>
                          <SelectItem value="icmp">ICMP</SelectItem>
                          <SelectItem value="all">All</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startPort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Port</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="1" max="65535" placeholder="80" data-testid="input-start-port" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endPort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Port</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="1" max="65535" placeholder="80" data-testid="input-end-port" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="cidrList"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CIDR List (comma-separated)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="0.0.0.0/0, 192.168.1.0/24" data-testid="input-cidr-list" />
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
                          <SelectItem value="Firewall">Firewall</SelectItem>
                          <SelectItem value="PortForwarding">Port Forwarding</SelectItem>
                          <SelectItem value="StaticNat">Static NAT</SelectItem>
                          <SelectItem value="LoadBalancing">Load Balancing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-rule">
                  {createMutation.isPending ? "Creating..." : "Create Rule"}
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
      ) : rules.length === 0 ? (
        <Card>
          <CardHeader>
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No firewall rules found</h3>
              <p className="text-muted-foreground mt-2">
                Create your first firewall rule to secure your network
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="mt-4" data-testid="button-create-first-rule">
                <Plus className="mr-2 h-4 w-4" />
                Create Rule
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => (
            <Card key={rule.id} data-testid={`card-rule-${rule.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {rule.protocol.toUpperCase()} 
                      {rule.startPort && ` - Port ${rule.startPort}${rule.endPort && rule.endPort !== rule.startPort ? `-${rule.endPort}` : ''}`}
                      <Badge variant={getStateColor(rule.state)} data-testid={`badge-state-${rule.id}`}>
                        {rule.state}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {rule.purpose || "No purpose specified"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteMutation.mutate(rule.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${rule.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Protocol</p>
                    <p className="font-medium">{rule.protocol.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CIDR List</p>
                    <p className="font-medium">{rule.cidrList?.join(', ') || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">IP Address</p>
                    <p className="font-medium">{rule.ipAddress || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Network ID</p>
                    <p className="font-medium">{rule.networkId || 'N/A'}</p>
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
