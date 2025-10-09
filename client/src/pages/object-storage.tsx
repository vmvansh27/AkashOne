import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Trash2,
  Folder,
  File,
  Download,
  Upload,
  Lock,
  Unlock,
  Copy,
  Settings,
  Cloud,
  HardDrive,
  TrendingUp,
  Globe2,
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

interface Bucket {
  id: string;
  name: string;
  region: string;
  visibility: "public" | "private";
  objectCount: number;
  size: number;
  created: string;
  encryption: boolean;
  versioning: boolean;
}

interface StorageObject {
  id: string;
  bucketId: string;
  name: string;
  size: number;
  type: string;
  lastModified: string;
  url?: string;
}

const mockBuckets: Bucket[] = [
  {
    id: "bucket-1",
    name: "production-assets",
    region: "us-east-1",
    visibility: "public",
    objectCount: 1245,
    size: 15.7,
    created: "2024-09-15",
    encryption: true,
    versioning: true,
  },
  {
    id: "bucket-2",
    name: "user-uploads",
    region: "us-west-2",
    visibility: "private",
    objectCount: 3890,
    size: 42.3,
    created: "2024-08-20",
    encryption: true,
    versioning: false,
  },
  {
    id: "bucket-3",
    name: "app-backups",
    region: "eu-central-1",
    visibility: "private",
    objectCount: 156,
    size: 120.5,
    created: "2024-10-01",
    encryption: true,
    versioning: true,
  },
];

const mockObjects: StorageObject[] = [
  {
    id: "obj-1",
    bucketId: "bucket-1",
    name: "logo.png",
    size: 0.125,
    type: "image/png",
    lastModified: "2024-10-08",
  },
  {
    id: "obj-2",
    bucketId: "bucket-1",
    name: "styles.css",
    size: 0.032,
    type: "text/css",
    lastModified: "2024-10-07",
  },
  {
    id: "obj-3",
    bucketId: "bucket-1",
    name: "script.js",
    size: 0.089,
    type: "text/javascript",
    lastModified: "2024-10-06",
  },
];

export default function ObjectStorage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);
  const [createBucketOpen, setCreateBucketOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [buckets, setBuckets] = useState<Bucket[]>(mockBuckets);
  const [objects, setObjects] = useState<StorageObject[]>(mockObjects);
  const [newBucket, setNewBucket] = useState({
    name: "",
    region: "us-east-1",
    visibility: "private" as "public" | "private",
    encryption: true,
    versioning: false,
  });

  const filteredBuckets = buckets.filter((bucket) =>
    bucket.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentBucketObjects = selectedBucket
    ? objects.filter((obj) => obj.bucketId === selectedBucket.id)
    : [];

  const handleCreateBucket = () => {
    const bucket: Bucket = {
      id: `bucket-${Date.now()}`,
      name: newBucket.name,
      region: newBucket.region,
      visibility: newBucket.visibility,
      objectCount: 0,
      size: 0,
      created: new Date().toISOString().split("T")[0],
      encryption: newBucket.encryption,
      versioning: newBucket.versioning,
    };

    setBuckets([...buckets, bucket]);
    toast({
      title: "Bucket Created",
      description: `S3 bucket "${bucket.name}" has been created successfully.`,
    });
    setCreateBucketOpen(false);
    setNewBucket({
      name: "",
      region: "us-east-1",
      visibility: "private",
      encryption: true,
      versioning: false,
    });
  };

  const handleDeleteBucket = (bucket: Bucket) => {
    if (confirm(`Are you sure you want to delete "${bucket.name}"? This action cannot be undone.`)) {
      setBuckets(buckets.filter((b) => b.id !== bucket.id));
      if (selectedBucket?.id === bucket.id) {
        setSelectedBucket(null);
      }
      toast({
        title: "Bucket Deleted",
        description: `Bucket "${bucket.name}" has been deleted.`,
      });
    }
  };

  const handleCopyEndpoint = (bucket: Bucket) => {
    const endpoint = `https://s3.${bucket.region}.akashone.com/${bucket.name}`;
    navigator.clipboard.writeText(endpoint);
    toast({
      title: "Copied",
      description: "S3 endpoint URL copied to clipboard",
    });
  };

  const formatSize = (gb: number) => {
    if (gb >= 1000) return `${(gb / 1000).toFixed(2)} TB`;
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    return `${(gb * 1024).toFixed(2)} MB`;
  };

  const totalStorage = buckets.reduce((sum, b) => sum + b.size, 0);
  const totalObjects = buckets.reduce((sum, b) => sum + b.objectCount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Object Storage</h1>
          <p className="text-muted-foreground mt-1">
            S3-compatible object storage with unlimited scalability
          </p>
        </div>
        <Dialog open={createBucketOpen} onOpenChange={setCreateBucketOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-bucket">
              <Plus className="h-4 w-4 mr-2" />
              Create Bucket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create S3 Bucket</DialogTitle>
              <DialogDescription>
                Create a new bucket to store objects in the cloud
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="bucket-name">Bucket Name</Label>
                <Input
                  id="bucket-name"
                  placeholder="my-bucket"
                  value={newBucket.name}
                  onChange={(e) => setNewBucket({ ...newBucket, name: e.target.value })}
                  data-testid="input-bucket-name"
                />
                <p className="text-xs text-muted-foreground">
                  Must be globally unique, lowercase, and DNS-compliant
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="region">Region</Label>
                <Select
                  value={newBucket.region}
                  onValueChange={(value) => setNewBucket({ ...newBucket, region: value })}
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
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={newBucket.visibility}
                  onValueChange={(value: "public" | "private") =>
                    setNewBucket({ ...newBucket, visibility: value })
                  }
                >
                  <SelectTrigger id="visibility" data-testid="select-visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private (Authenticated Access)</SelectItem>
                    <SelectItem value="public">Public (Open Access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Server-Side Encryption</p>
                  <p className="text-sm text-muted-foreground">AES-256 encryption at rest</p>
                </div>
                <Button
                  variant={newBucket.encryption ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewBucket({ ...newBucket, encryption: !newBucket.encryption })}
                  data-testid="button-toggle-encryption"
                >
                  {newBucket.encryption ? "Enabled" : "Disabled"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Versioning</p>
                  <p className="text-sm text-muted-foreground">Keep multiple versions of objects</p>
                </div>
                <Button
                  variant={newBucket.versioning ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewBucket({ ...newBucket, versioning: !newBucket.versioning })}
                  data-testid="button-toggle-versioning"
                >
                  {newBucket.versioning ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateBucketOpen(false)}
                data-testid="button-cancel-create"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateBucket}
                disabled={!newBucket.name}
                data-testid="button-confirm-create"
              >
                Create Bucket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buckets</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-buckets">
              {buckets.length}
            </div>
            <p className="text-xs text-muted-foreground">Active storage buckets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Objects</CardTitle>
            <File className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-objects">
              {totalObjects.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Stored files and objects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-storage">
              {formatSize(totalStorage)}
            </div>
            <p className="text-xs text-muted-foreground">Used storage space</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public Buckets</CardTitle>
            <Globe2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-public-buckets">
              {buckets.filter((b) => b.visibility === "public").length}
            </div>
            <p className="text-xs text-muted-foreground">Publicly accessible</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Storage Buckets</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search buckets..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-buckets"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredBuckets.map((bucket) => (
                <Card
                  key={bucket.id}
                  className={`cursor-pointer hover-elevate ${
                    selectedBucket?.id === bucket.id ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedBucket(bucket)}
                  data-testid={`card-bucket-${bucket.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-muted">
                          <Folder className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">{bucket.name}</p>
                            {bucket.visibility === "public" ? (
                              <Unlock className="h-3 w-3 text-orange-500" />
                            ) : (
                              <Lock className="h-3 w-3 text-green-500" />
                            )}
                            <Badge variant="outline" className="text-xs">
                              {bucket.region}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <p>{bucket.objectCount} objects</p>
                            <p>{formatSize(bucket.size)}</p>
                          </div>
                          {(bucket.encryption || bucket.versioning) && (
                            <div className="flex gap-2 mt-2">
                              {bucket.encryption && (
                                <Badge variant="secondary" className="text-xs">
                                  Encrypted
                                </Badge>
                              )}
                              {bucket.versioning && (
                                <Badge variant="secondary" className="text-xs">
                                  Versioned
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyEndpoint(bucket);
                          }}
                          data-testid={`button-copy-${bucket.id}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBucket(bucket);
                          }}
                          data-testid={`button-delete-${bucket.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredBuckets.length === 0 && (
                <div className="text-center py-12">
                  <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No buckets found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "Try adjusting your search" : "Create your first S3 bucket"}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setCreateBucketOpen(true)} data-testid="button-create-first">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Bucket
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
                {selectedBucket ? `Objects in ${selectedBucket.name}` : "Select a Bucket"}
              </CardTitle>
              {selectedBucket && (
                <Button size="sm" data-testid="button-upload-file">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedBucket ? (
              <div className="space-y-2">
                {currentBucketObjects.length > 0 ? (
                  currentBucketObjects.map((obj) => (
                    <Card key={obj.id} className="hover-elevate" data-testid={`card-object-${obj.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              <File className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{obj.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatSize(obj.size)} • {obj.type}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              data-testid={`button-download-${obj.id}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              data-testid={`button-delete-object-${obj.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No objects</h3>
                    <p className="text-muted-foreground mb-4">
                      This bucket is empty. Upload some files to get started.
                    </p>
                    <Button data-testid="button-upload-empty">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Cloud className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bucket selected</h3>
                <p className="text-muted-foreground">
                  Select a bucket from the left to view its contents
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
