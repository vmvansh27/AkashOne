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
import { HardDrive, Plus, Trash2, Link as LinkIcon, Unlink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Volume } from "@shared/schema";

const createVolumeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  size: z.coerce.number().min(1, "Size must be at least 1 GB"),
  zoneId: z.string().min(1, "Zone is required"),
  cloudstackId: z.string().min(1, "CloudStack ID is required"),
});

type CreateVolumeData = z.infer<typeof createVolumeSchema>;

export default function BlockStorage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: volumes = [], isLoading } = useQuery<Volume[]>({
    queryKey: ["/api/volumes"],
  });

  const form = useForm<CreateVolumeData>({
    resolver: zodResolver(createVolumeSchema),
    defaultValues: {
      name: "",
      size: 10,
      zoneId: "",
      cloudstackId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateVolumeData) => {
      return await apiRequest("POST", "/api/volumes", data);
    },
    onSuccess: () => {
      toast({ title: "Volume created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/volumes"] });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create volume", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/volumes/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Volume deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/volumes"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete volume", description: error.message, variant: "destructive" });
    },
  });

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case "ready":
      case "attached":
        return "default";
      case "creating":
      case "attaching":
      case "detaching":
        return "secondary";
      case "error":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Elastic Block Storage</h1>
          <p className="text-muted-foreground mt-1">
            Manage your scalable block storage volumes
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-volume">
              <Plus className="mr-2 h-4 w-4" />
              Create Volume
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Volume</DialogTitle>
              <DialogDescription>
                Create a new block storage volume for your cloud infrastructure
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="my-volume" data-testid="input-volume-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size (GB)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="1" placeholder="10" data-testid="input-volume-size" />
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
                      <FormLabel>Zone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-zone">
                            <SelectValue placeholder="Select zone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="zone-1">Mumbai (India)</SelectItem>
                          <SelectItem value="zone-2">Delhi (India)</SelectItem>
                          <SelectItem value="zone-3">Bangalore (India)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cloudstackId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CloudStack ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="cs-volume-id" data-testid="input-cloudstack-id" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-volume">
                  {createMutation.isPending ? "Creating..." : "Create Volume"}
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
      ) : volumes.length === 0 ? (
        <Card>
          <CardHeader>
            <div className="text-center py-12">
              <HardDrive className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No volumes found</h3>
              <p className="text-muted-foreground mt-2">
                Create your first block storage volume to get started
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="mt-4" data-testid="button-create-first-volume">
                <Plus className="mr-2 h-4 w-4" />
                Create Volume
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {volumes.map((volume) => (
            <Card key={volume.id} data-testid={`card-volume-${volume.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5" />
                      {volume.name}
                      <Badge variant={getStateColor(volume.state)} data-testid={`badge-state-${volume.id}`}>
                        {volume.state}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {volume.displayName || "No description"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={volume.attachedVmId !== null}
                      data-testid={`button-attach-${volume.id}`}
                    >
                      {volume.attachedVmId ? <Unlink className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteMutation.mutate(volume.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${volume.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Size</p>
                    <p className="font-medium">{volume.size} GB</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">{volume.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Zone</p>
                    <p className="font-medium">{volume.zoneName || volume.zoneId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Attached To</p>
                    <p className="font-medium">{volume.attachedVmName || "Not attached"}</p>
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
