import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Rocket,
  Database as DatabaseIcon,
  Server,
  Globe,
  Zap,
  Shield,
  Cloud,
  Code,
  Package,
  TrendingUp,
  Star,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface MarketplaceTemplate {
  id: string;
  name: string;
  category: "database" | "web" | "caching" | "cms" | "devtools" | "monitoring";
  description: string;
  longDescription: string;
  version: string;
  icon: any;
  iconColor: string;
  requirements: {
    cpu: number;
    memory: number;
    storage: number;
  };
  estimatedCost: number;
  popularity: number;
  tags: string[];
  deploymentType: "vm" | "database" | "kubernetes";
}

const marketplaceTemplates: MarketplaceTemplate[] = [
  {
    id: "wordpress",
    name: "WordPress",
    category: "cms",
    description: "Popular content management system for websites and blogs",
    longDescription: "WordPress is a free and open-source content management system written in PHP. Features include a plugin architecture and a template system, referred to within WordPress as Themes.",
    version: "6.4.2",
    icon: Globe,
    iconColor: "text-blue-500",
    requirements: { cpu: 2, memory: 4, storage: 20 },
    estimatedCost: 25,
    popularity: 95,
    tags: ["CMS", "PHP", "MySQL", "Blog"],
    deploymentType: "vm",
  },
  {
    id: "mysql",
    name: "MySQL Server",
    category: "database",
    description: "Popular open-source relational database management system",
    longDescription: "MySQL is a widely used, open-source relational database management system. Known for its speed, reliability, and ease of use, it's the database of choice for web applications.",
    version: "8.0.35",
    icon: DatabaseIcon,
    iconColor: "text-orange-500",
    requirements: { cpu: 2, memory: 8, storage: 50 },
    estimatedCost: 35,
    popularity: 92,
    tags: ["Database", "SQL", "RDBMS"],
    deploymentType: "database",
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "database",
    description: "Advanced open-source relational database",
    longDescription: "PostgreSQL is a powerful, open source object-relational database system with over 30 years of active development that has earned it a strong reputation for reliability, feature robustness, and performance.",
    version: "15.4",
    icon: DatabaseIcon,
    iconColor: "text-indigo-500",
    requirements: { cpu: 2, memory: 8, storage: 50 },
    estimatedCost: 35,
    popularity: 90,
    tags: ["Database", "SQL", "JSONB"],
    deploymentType: "database",
  },
  {
    id: "redis",
    name: "Redis",
    category: "caching",
    description: "In-memory data structure store for caching and real-time analytics",
    longDescription: "Redis is an open source, in-memory data structure store, used as a database, cache, and message broker. It supports various data structures such as strings, hashes, lists, sets, and more.",
    version: "7.2.3",
    icon: Zap,
    iconColor: "text-red-500",
    requirements: { cpu: 1, memory: 4, storage: 10 },
    estimatedCost: 20,
    popularity: 88,
    tags: ["Cache", "In-Memory", "NoSQL"],
    deploymentType: "database",
  },
  {
    id: "mongodb",
    name: "MongoDB",
    category: "database",
    description: "Popular NoSQL document database",
    longDescription: "MongoDB is a source-available cross-platform document-oriented database program. Classified as a NoSQL database program, MongoDB uses JSON-like documents with optional schemas.",
    version: "7.0.2",
    icon: DatabaseIcon,
    iconColor: "text-green-500",
    requirements: { cpu: 2, memory: 8, storage: 50 },
    estimatedCost: 35,
    popularity: 87,
    tags: ["NoSQL", "Document DB", "JSON"],
    deploymentType: "database",
  },
  {
    id: "nginx",
    name: "NGINX",
    category: "web",
    description: "High-performance HTTP server and reverse proxy",
    longDescription: "NGINX is a web server that can also be used as a reverse proxy, load balancer, mail proxy and HTTP cache. Known for its high performance, stability, rich feature set, simple configuration, and low resource consumption.",
    version: "1.25.3",
    icon: Server,
    iconColor: "text-green-600",
    requirements: { cpu: 1, memory: 2, storage: 10 },
    estimatedCost: 15,
    popularity: 85,
    tags: ["Web Server", "Reverse Proxy", "Load Balancer"],
    deploymentType: "vm",
  },
  {
    id: "docker",
    name: "Docker Engine",
    category: "devtools",
    description: "Container runtime for building and running applications",
    longDescription: "Docker is a platform designed to help developers build, share, and run modern applications. It provides tools to package applications into containers—standardized executable components combining application source code with the OS libraries.",
    version: "24.0.7",
    icon: Package,
    iconColor: "text-blue-600",
    requirements: { cpu: 2, memory: 4, storage: 30 },
    estimatedCost: 25,
    popularity: 93,
    tags: ["Containers", "DevOps", "CI/CD"],
    deploymentType: "vm",
  },
  {
    id: "grafana",
    name: "Grafana",
    category: "monitoring",
    description: "Analytics and monitoring platform",
    longDescription: "Grafana is an open-source analytics and monitoring platform. It allows you to query, visualize, alert on, and understand your metrics no matter where they are stored.",
    version: "10.2.2",
    icon: TrendingUp,
    iconColor: "text-orange-600",
    requirements: { cpu: 2, memory: 4, storage: 20 },
    estimatedCost: 25,
    popularity: 82,
    tags: ["Monitoring", "Analytics", "Dashboards"],
    deploymentType: "vm",
  },
  {
    id: "gitlab",
    name: "GitLab CE",
    category: "devtools",
    description: "Complete DevOps platform delivered as a single application",
    longDescription: "GitLab is a web-based DevOps lifecycle tool that provides a Git repository manager providing wiki, issue-tracking and CI/CD pipeline features, using an open-source license.",
    version: "16.6.1",
    icon: Code,
    iconColor: "text-purple-500",
    requirements: { cpu: 4, memory: 8, storage: 50 },
    estimatedCost: 50,
    popularity: 80,
    tags: ["Git", "CI/CD", "DevOps"],
    deploymentType: "vm",
  },
  {
    id: "nextcloud",
    name: "Nextcloud",
    category: "cms",
    description: "Self-hosted file sharing and collaboration platform",
    longDescription: "Nextcloud is a suite of client-server software for creating and using file hosting services. It offers an on-premise cloud storage solution that gives you full control over your data.",
    version: "27.1.4",
    icon: Cloud,
    iconColor: "text-blue-500",
    requirements: { cpu: 2, memory: 4, storage: 100 },
    estimatedCost: 30,
    popularity: 78,
    tags: ["File Sharing", "Collaboration", "Storage"],
    deploymentType: "vm",
  },
  {
    id: "elasticsearch",
    name: "Elasticsearch",
    category: "database",
    description: "Distributed search and analytics engine",
    longDescription: "Elasticsearch is a distributed, RESTful search and analytics engine capable of addressing a growing number of use cases. As the heart of the Elastic Stack, it centrally stores your data for lightning fast search.",
    version: "8.11.1",
    icon: Search,
    iconColor: "text-yellow-500",
    requirements: { cpu: 4, memory: 16, storage: 100 },
    estimatedCost: 75,
    popularity: 84,
    tags: ["Search", "Analytics", "Big Data"],
    deploymentType: "vm",
  },
  {
    id: "minio",
    name: "MinIO",
    category: "database",
    description: "High-performance S3-compatible object storage",
    longDescription: "MinIO is a High Performance Object Storage released under GNU AGPLv3. It is API compatible with Amazon S3 cloud storage service. Perfect for storing unstructured data like photos, videos, log files, backups.",
    version: "2023.12.02",
    icon: Cloud,
    iconColor: "text-red-600",
    requirements: { cpu: 2, memory: 8, storage: 200 },
    estimatedCost: 40,
    popularity: 76,
    tags: ["Object Storage", "S3", "Cloud Storage"],
    deploymentType: "vm",
  },
];

export default function Marketplace() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | MarketplaceTemplate["category"]>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [deploymentConfig, setDeploymentConfig] = useState({
    name: "",
    region: "us-east-1",
    instanceType: "m5.large",
  });

  const filteredTemplates = marketplaceTemplates
    .filter((template) => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => b.popularity - a.popularity);

  const handleDeploy = () => {
    if (!selectedTemplate) return;

    toast({
      title: "Deployment Started",
      description: `Deploying ${selectedTemplate.name} as "${deploymentConfig.name}"...`,
    });

    setTimeout(() => {
      toast({
        title: "Deployment Successful",
        description: `${selectedTemplate.name} has been deployed and is now running.`,
      });
      setDeployDialogOpen(false);
      setDeploymentConfig({ name: "", region: "us-east-1", instanceType: "m5.large" });
      setSelectedTemplate(null);
    }, 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "database":
        return DatabaseIcon;
      case "web":
        return Server;
      case "caching":
        return Zap;
      case "cms":
        return Globe;
      case "devtools":
        return Code;
      case "monitoring":
        return TrendingUp;
      default:
        return Package;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Deploy pre-configured applications with a single click
          </p>
        </div>
        <Button variant="outline" data-testid="button-my-deployments">
          <Rocket className="h-4 w-4 mr-2" />
          My Deployments
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Templates</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-templates">
              {marketplaceTemplates.length}
            </div>
            <p className="text-xs text-muted-foreground">Ready to deploy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-popular-template">
              {marketplaceTemplates.sort((a, b) => b.popularity - a.popularity)[0].name}
            </div>
            <p className="text-xs text-muted-foreground">
              {marketplaceTemplates.sort((a, b) => b.popularity - a.popularity)[0].popularity}% popularity
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-categories">
              6
            </div>
            <p className="text-xs text-muted-foreground">Application types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deploy Time</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-deploy-time">
              ~3 min
            </div>
            <p className="text-xs text-muted-foreground">From click to running</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle>Browse Templates</CardTitle>
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search templates, tags..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-templates"
                />
              </div>
            </div>
            <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
              <TabsList data-testid="tabs-category-filter">
                <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                <TabsTrigger value="database" data-testid="tab-database">Databases</TabsTrigger>
                <TabsTrigger value="web" data-testid="tab-web">Web Servers</TabsTrigger>
                <TabsTrigger value="caching" data-testid="tab-caching">Caching</TabsTrigger>
                <TabsTrigger value="cms" data-testid="tab-cms">CMS</TabsTrigger>
                <TabsTrigger value="devtools" data-testid="tab-devtools">Dev Tools</TabsTrigger>
                <TabsTrigger value="monitoring" data-testid="tab-monitoring">Monitoring</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover-elevate" data-testid={`card-template-${template.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted`}>
                        <template.icon className={`h-6 w-6 ${template.iconColor}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="text-xs">{template.version}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {template.popularity}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-4">
                    <div>
                      <p className="font-medium text-foreground">{template.requirements.cpu}</p>
                      <p>vCPU</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{template.requirements.memory} GB</p>
                      <p>RAM</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{template.requirements.storage} GB</p>
                      <p>Storage</p>
                    </div>
                  </div>
                  <div className="text-sm mb-4">
                    <p className="text-muted-foreground">Est. Cost</p>
                    <p className="text-lg font-bold">${template.estimatedCost}/mo</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setDeploymentConfig({ ...deploymentConfig, name: template.name.toLowerCase().replace(/\s+/g, "-") });
                      setDeployDialogOpen(true);
                    }}
                    data-testid={`button-deploy-${template.id}`}
                  >
                    <Rocket className="h-4 w-4 mr-2" />
                    Deploy Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deployDialogOpen} onOpenChange={setDeployDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deploy {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Configure and deploy {selectedTemplate?.name} with one click
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Template Information</Label>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      {selectedTemplate.longDescription}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="font-medium">Version:</span> {selectedTemplate.version}
                      </div>
                      <div>
                        <span className="font-medium">Category:</span> {selectedTemplate.category}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deployment-name">Deployment Name</Label>
                <Input
                  id="deployment-name"
                  placeholder="my-app"
                  value={deploymentConfig.name}
                  onChange={(e) => setDeploymentConfig({ ...deploymentConfig, name: e.target.value })}
                  data-testid="input-deployment-name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={deploymentConfig.region}
                    onValueChange={(value) => setDeploymentConfig({ ...deploymentConfig, region: value })}
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
                    value={deploymentConfig.instanceType}
                    onValueChange={(value) => setDeploymentConfig({ ...deploymentConfig, instanceType: value })}
                  >
                    <SelectTrigger id="instance-type" data-testid="select-instance-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="t3.medium">t3.medium (2 vCPU, 4 GB RAM) - $30/mo</SelectItem>
                      <SelectItem value="m5.large">m5.large (2 vCPU, 8 GB RAM) - $70/mo</SelectItem>
                      <SelectItem value="m5.xlarge">m5.xlarge (4 vCPU, 16 GB RAM) - $140/mo</SelectItem>
                      <SelectItem value="m5.2xlarge">m5.2xlarge (8 vCPU, 32 GB RAM) - $280/mo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Requirements</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold">{selectedTemplate.requirements.cpu}</p>
                      <p className="text-sm text-muted-foreground">vCPU cores</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold">{selectedTemplate.requirements.memory}</p>
                      <p className="text-sm text-muted-foreground">GB RAM</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold">{selectedTemplate.requirements.storage}</p>
                      <p className="text-sm text-muted-foreground">GB Storage</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Estimated Monthly Cost</Label>
                <Card className="bg-muted">
                  <CardContent className="pt-4">
                    <p className="text-3xl font-bold">${selectedTemplate.estimatedCost}/month</p>
                    <p className="text-sm text-muted-foreground">
                      Includes compute, storage, and bandwidth
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeployDialogOpen(false)}
              data-testid="button-cancel-deploy"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeploy}
              disabled={!deploymentConfig.name}
              data-testid="button-confirm-deploy"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Deploy Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
