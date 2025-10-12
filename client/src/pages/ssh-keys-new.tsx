import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Key, Plus, Trash2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SshKey } from "@shared/schema";

const createKeySchema = z.object({
  name: z.string().min(1, "Name is required"),
  fingerprint: z.string().min(1, "Fingerprint is required"),
  publicKey: z.string().min(1, "Public key is required"),
  privateKey: z.string().optional(),
});

type CreateKeyData = z.infer<typeof createKeySchema>;

export default function SshKeys() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: keys = [], isLoading } = useQuery<SshKey[]>({
    queryKey: ["/api/ssh-keys"],
  });

  const form = useForm<CreateKeyData>({
    resolver: zodResolver(createKeySchema),
    defaultValues: {
      name: "",
      fingerprint: "",
      publicKey: "",
      privateKey: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateKeyData) => {
      return await apiRequest("POST", "/api/ssh-keys", data);
    },
    onSuccess: () => {
      toast({ title: "SSH key created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/ssh-keys"] });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create SSH key", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/ssh-keys/${id}`);
    },
    onSuccess: () => {
      toast({ title: "SSH key deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/ssh-keys"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete SSH key", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">SSH Keys</h1>
          <p className="text-muted-foreground mt-1">
            Manage SSH keys for secure server access
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-key">
              <Plus className="mr-2 h-4 w-4" />
              Add SSH Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add SSH Key</DialogTitle>
              <DialogDescription>
                Add a new SSH key for secure server authentication
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
                        <Input {...field} placeholder="my-ssh-key" data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fingerprint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fingerprint</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="SHA256:abc123..." data-testid="input-fingerprint" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="publicKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Public Key</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="ssh-rsa AAAAB3..." rows={4} data-testid="input-public-key" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="privateKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Private Key (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="-----BEGIN RSA PRIVATE KEY-----" rows={4} data-testid="input-private-key" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-key">
                  {createMutation.isPending ? "Creating..." : "Add SSH Key"}
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
      ) : keys.length === 0 ? (
        <Card>
          <CardHeader>
            <div className="text-center py-12">
              <Key className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No SSH keys found</h3>
              <p className="text-muted-foreground mt-2">
                Add your first SSH key for secure server access
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="mt-4" data-testid="button-create-first-key">
                <Plus className="mr-2 h-4 w-4" />
                Add SSH Key
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {keys.map((key) => (
            <Card key={key.id} data-testid={`card-key-${key.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      {key.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {key.fingerprint}
                    </CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteMutation.mutate(key.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${key.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Public Key</p>
                    <p className="font-mono text-xs break-all">{key.publicKey.substring(0, 80)}...</p>
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
