import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useResellerAccess } from "@/hooks/use-role-access";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHsnCodeSchema, type HsnCode } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FileText,
  ShieldCheck,
  Info,
} from "lucide-react";
import { z } from "zod";

// Form schema
const hsnCodeFormSchema = insertHsnCodeSchema.extend({
  gstRate: z.coerce.number().min(0).max(100),
});

type HsnCodeFormData = z.infer<typeof hsnCodeFormSchema>;

export default function HsnCodes() {
  const { hasAccess, isLoading: isCheckingAccess } = useResellerAccess();

  if (isCheckingAccess) {
    return <div className="p-8">Loading...</div>;
  }

  if (!hasAccess) {
    return null;
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<HsnCode | null>(null);
  const { toast } = useToast();

  // Fetch HSN codes
  const { data: hsnCodes = [], isLoading } = useQuery<HsnCode[]>({
    queryKey: ["/api/hsn-codes"],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: HsnCodeFormData) => {
      const res = await apiRequest("POST", "/api/hsn-codes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hsn-codes"] });
      setCreateDialogOpen(false);
      createForm.reset();
      toast({ title: "Success", description: "HSN/SAC code created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<HsnCodeFormData> & { id: string }) => {
      const { id, ...updateData } = data;
      const res = await apiRequest("PATCH", `/api/hsn-codes/${id}`, updateData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hsn-codes"] });
      setEditDialogOpen(false);
      setSelectedCode(null);
      toast({ title: "Success", description: "HSN/SAC code updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/hsn-codes/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hsn-codes"] });
      toast({ title: "Success", description: "HSN/SAC code deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Create form
  const createForm = useForm<HsnCodeFormData>({
    resolver: zodResolver(hsnCodeFormSchema),
    defaultValues: {
      serviceType: "",
      hsnCode: "",
      sacCode: "",
      description: "",
      gstRate: 18,
      isActive: true,
    },
  });

  // Edit form
  const editForm = useForm<HsnCodeFormData>({
    resolver: zodResolver(hsnCodeFormSchema),
  });

  const onCreateSubmit = (data: HsnCodeFormData) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: HsnCodeFormData) => {
    if (!selectedCode) return;
    updateMutation.mutate({ ...data, id: selectedCode.id });
  };

  const handleEdit = (code: HsnCode) => {
    setSelectedCode(code);
    editForm.reset({
      serviceType: code.serviceType,
      hsnCode: code.hsnCode,
      sacCode: code.sacCode,
      description: code.description,
      gstRate: code.gstRate,
      isActive: code.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this HSN/SAC code?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter codes based on search
  const filteredCodes = hsnCodes.filter(
    (code) =>
      code.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.hsnCode.includes(searchQuery) ||
      code.sacCode.includes(searchQuery) ||
      code.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">HSN/SAC Code Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage HSN and SAC codes for Indian GST compliance
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-hsn-code">
            <Plus className="h-4 w-4 mr-2" />
            Add HSN/SAC Code
          </Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New HSN/SAC Code</DialogTitle>
              <DialogDescription>
                Define tax classification codes for cloud services
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., compute, storage, database" 
                          {...field} 
                          data-testid="input-service-type"
                        />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for the service (lowercase, no spaces)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="hsnCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HSN Code *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 998314" 
                            {...field} 
                            data-testid="input-hsn-code"
                          />
                        </FormControl>
                        <FormDescription>
                          Harmonized System of Nomenclature
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="sacCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SAC Code *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 998314" 
                            {...field} 
                            data-testid="input-sac-code"
                          />
                        </FormControl>
                        <FormDescription>
                          Service Accounting Code
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Cloud computing services" 
                          {...field} 
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="gstRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Rate (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="100" 
                          {...field} 
                          data-testid="input-gst-rate"
                        />
                      </FormControl>
                      <FormDescription>
                        Default: 18% for cloud services
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Enable this code for use in invoices
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-is-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCreateDialogOpen(false)}
                    data-testid="button-cancel-create"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    data-testid="button-submit-create"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Code"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tax Classification Codes</CardTitle>
              <CardDescription>
                HSN/SAC codes for GST-compliant invoicing in India
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                data-testid="input-search-codes"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading HSN/SAC codes...</div>
          ) : filteredCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No codes match your search" : "No HSN/SAC codes configured yet"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Type</TableHead>
                  <TableHead>HSN Code</TableHead>
                  <TableHead>SAC Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">GST Rate</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.map((code) => (
                  <TableRow key={code.id} data-testid={`row-hsn-code-${code.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {code.serviceType}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-sm">
                        {code.hsnCode}
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-sm">
                        {code.sacCode}
                      </code>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {code.description}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{code.gstRate}%</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={code.isActive ? "default" : "secondary"}>
                        {code.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(code)}
                          data-testid={`button-edit-${code.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(code.id)}
                          data-testid={`button-delete-${code.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit HSN/SAC Code</DialogTitle>
            <DialogDescription>
              Update tax classification code details
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., compute, storage, database" 
                        {...field} 
                        data-testid="input-edit-service-type"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="hsnCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HSN Code *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 998314" 
                          {...field} 
                          data-testid="input-edit-hsn-code"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="sacCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SAC Code *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 998314" 
                          {...field} 
                          data-testid="input-edit-sac-code"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Cloud computing services" 
                        {...field} 
                        data-testid="input-edit-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="gstRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        {...field} 
                        data-testid="input-edit-gst-rate"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Enable this code for use in invoices
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-edit-is-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditDialogOpen(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {updateMutation.isPending ? "Updating..." : "Update Code"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            About HSN/SAC Codes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>HSN (Harmonized System of Nomenclature):</strong> Used for classification of goods under GST
          </p>
          <p>
            <strong>SAC (Service Accounting Code):</strong> Used for classification of services under GST
          </p>
          <p>
            <strong>Common Cloud Service Codes:</strong> 998314 (Cloud Computing), 998315 (Data Storage), 
            998316 (Database Services), 998317 (Network Services)
          </p>
          <p className="flex items-center gap-2 mt-4">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <span>All codes are GST compliant for Indian tax regulations</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
