import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Store, Users, IndianRupee, Settings } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

//todo: remove mock functionality
const mockResellers = [
  {
    id: "res-001",
    name: "CloudTech Solutions",
    domain: "cloudtech.example.com",
    customersCount: 45,
    activeVMs: 128,
    monthlyRevenue: 245000,
    margin: 25,
    status: "active",
    gstin: "29ABCDE1234F1Z5",
  },
  {
    id: "res-002",
    name: "Digital Infrastructure Co",
    domain: "digicloud.example.com",
    customersCount: 32,
    activeVMs: 89,
    monthlyRevenue: 178000,
    margin: 20,
    status: "active",
    gstin: "27FGHIJ5678K2L6",
  },
  {
    id: "res-003",
    name: "Enterprise Cloud Services",
    domain: "entcloud.example.com",
    customersCount: 18,
    activeVMs: 56,
    monthlyRevenue: 124000,
    margin: 30,
    status: "active",
    gstin: "19MNOPQ9012R3S4",
  },
];

export default function Resellers() {
  const { toast } = useToast();

  const handleCreateReseller = () => {
    console.log("Creating new reseller");
    toast({
      title: "Create Reseller",
      description: "Opening reseller creation wizard",
    });
  };

  const handleConfigureReseller = (resellerId: string) => {
    console.log("Configuring reseller:", resellerId);
    toast({
      title: "Reseller Configuration",
      description: "Opening white-label settings",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reseller Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage reseller partners and white-label configurations
          </p>
        </div>
        <Button onClick={handleCreateReseller} data-testid="button-create-reseller">
          <Plus className="h-4 w-4 mr-2" />
          Add Reseller
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Resellers</p>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-total-resellers">3</div>
            <p className="text-xs text-chart-2 mt-1">All active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95</div>
            <p className="text-xs text-muted-foreground mt-1">Across all resellers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹5.47L</div>
            <p className="text-xs text-chart-2 mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Avg. Margin</p>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25%</div>
            <p className="text-xs text-muted-foreground mt-1">Average across resellers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium">Active Resellers</h3>
            <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
              {mockResellers.length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reseller Name</TableHead>
                  <TableHead>White-Label Domain</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead className="text-right">Customers</TableHead>
                  <TableHead className="text-right">Active VMs</TableHead>
                  <TableHead className="text-right">Monthly Revenue</TableHead>
                  <TableHead className="text-right">Margin %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockResellers.map((reseller) => (
                  <TableRow key={reseller.id} className="hover-elevate">
                    <TableCell className="font-medium" data-testid={`reseller-name-${reseller.id}`}>
                      {reseller.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {reseller.domain}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {reseller.gstin}
                    </TableCell>
                    <TableCell className="text-right">{reseller.customersCount}</TableCell>
                    <TableCell className="text-right">{reseller.activeVMs}</TableCell>
                    <TableCell className="text-right font-mono">
                      ₹{reseller.monthlyRevenue.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {reseller.margin}%
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-chart-2/10 text-chart-2 border-chart-2/20"
                      >
                        {reseller.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConfigureReseller(reseller.id)}
                        data-testid={`button-configure-${reseller.id}`}
                      >
                        Configure
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
