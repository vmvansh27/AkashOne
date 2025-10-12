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
import { Disc, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { IsoImage } from "@shared/schema";

const createImageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  displayText: z.string().optional(),
  osType: z.string().optional(),
  osTypeId: z.string().optional(),
  size: z.coerce.number().optional(),
  isPublic: z.boolean().default(false),
  bootable: z.boolean().default(true),
  isExtractable: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isReady: z.boolean().default(false),
  url: z.string().optional(),
  zoneId: z.string().optional(),
  zoneName: z.string().optional(),
});

type CreateImageData = z.infer<typeof createImageSchema>;

export default function IsoImages() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: images = [], isLoading } = useQuery<IsoImage[]>({
    queryKey: ["/api/iso-images"],
  });

  const form = useForm<CreateImageData>({
    resolver: zodResolver(createImageSchema),
    defaultValues: {
      name: "",
      displayText: "",
      osType: "",
      isPublic: false,
      bootable: true,
      isExtractable: false,
      isFeatured: false,
      isReady: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateImageData) => {
      return await apiRequest("POST", "/api/iso-images", data);
    },
    onSuccess: () => {
      toast({ title: "ISO image created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/iso-images"] });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create ISO image", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/iso-images/${id}`);
    },
    onSuccess: () => {
      toast({ title: "ISO image deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/iso-images"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete ISO image", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">ISO Images</h1>
          <p className="text-muted-foreground mt-1">
            Manage ISO images for virtual machine deployment
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-image">
              <Plus className="mr-2 h-4 w-4" />
              Add ISO Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add ISO Image</DialogTitle>
              <DialogDescription>
                Register a new ISO image for VM deployment
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ubuntu-22.04" data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="displayText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Text</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ubuntu 22.04 LTS" data-testid="input-display-text" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="osType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OS Type</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ubuntu" data-testid="input-os-type" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." data-testid="input-url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bootable"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel>Bootable</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-bootable" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel>Public</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-public" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-image">
                  {createMutation.isPending ? "Creating..." : "Add ISO Image"}
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
      ) : images.length === 0 ? (
        <Card>
          <CardHeader>
            <div className="text-center py-12">
              <Disc className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No ISO images found</h3>
              <p className="text-muted-foreground mt-2">
                Register your first ISO image to deploy VMs
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="mt-4" data-testid="button-create-first-image">
                <Plus className="mr-2 h-4 w-4" />
                Add ISO Image
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {images.map((image) => (
            <Card key={image.id} data-testid={`card-image-${image.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Disc className="h-5 w-5" />
                      {image.name}
                      {image.bootable && <Badge variant="default" data-testid={`badge-bootable-${image.id}`}>Bootable</Badge>}
                      {image.isPublic && <Badge variant="secondary" data-testid={`badge-public-${image.id}`}>Public</Badge>}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {image.displayText || image.osType || "No description"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteMutation.mutate(image.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${image.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">OS Type</p>
                    <p className="font-medium">{image.osType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Zone</p>
                    <p className="font-medium">{image.zoneName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Size</p>
                    <p className="font-medium">{image.size ? `${(image.size / 1024 / 1024 / 1024).toFixed(2)} GB` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium">{image.isReady ? 'Ready' : 'Pending'}</p>
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
