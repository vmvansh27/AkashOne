import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, UserPlus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

//todo: remove mock functionality
const mockCustomers = [
  {
    id: "cust-001",
    name: "TechStart Solutions",
    email: "admin@techstart.com",
    gstin: "29XYZTE1234A1B2",
    vmsCount: 12,
    monthlySpend: 45000,
    status: "active",
    joinedDate: "2024-08-15",
  },
  {
    id: "cust-002",
    name: "Digital Ventures Ltd",
    email: "ops@digitalventures.com",
    gstin: "29PQRST5678C2D3",
    vmsCount: 8,
    monthlySpend: 32000,
    status: "active",
    joinedDate: "2024-09-01",
  },
  {
    id: "cust-003",
    name: "CloudOps Inc",
    email: "it@cloudops.net",
    gstin: "27UVWXY9012E3F4",
    vmsCount: 15,
    monthlySpend: 58000,
    status: "active",
    joinedDate: "2024-07-20",
  },
  {
    id: "cust-004",
    name: "DataFlow Systems",
    email: "admin@dataflow.io",
    gstin: "19MNOPQ3456G4H5",
    vmsCount: 5,
    monthlySpend: 18000,
    status: "trial",
    joinedDate: "2024-10-01",
  },
];

export default function ResellerCustomers() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleAddCustomer = () => {
    console.log("Adding new customer");
    toast({
      title: "Add Customer",
      description: "Opening customer onboarding wizard",
    });
  };

  const handleManageCustomer = (customerId: string) => {
    console.log("Managing customer:", customerId);
    toast({
      title: "Customer Management",
      description: "Opening customer details",
    });
  };

  const filteredCustomers = mockCustomers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.gstin.includes(searchQuery)
  );

  const totalRevenue = mockCustomers.reduce((sum, c) => sum + c.monthlySpend, 0);
  const totalVMs = mockCustomers.reduce((sum, c) => sum + c.vmsCount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer accounts and resources
          </p>
        </div>
        <Button onClick={handleAddCustomer} data-testid="button-add-customer">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-total-customers">{mockCustomers.length}</div>
            <p className="text-xs text-chart-2 mt-1">+2 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Active VMs</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVMs}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-chart-2 mt-1">+18% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Avg. Spend/Customer</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{Math.round(totalRevenue / mockCustomers.length).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per month</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers by name, email, or GSTIN..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-customers"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-base font-medium">Customer Accounts</h3>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead className="text-right">VMs</TableHead>
                  <TableHead className="text-right">Monthly Spend</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover-elevate">
                    <TableCell className="font-medium" data-testid={`customer-name-${customer.id}`}>
                      {customer.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {customer.email}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {customer.gstin}
                    </TableCell>
                    <TableCell className="text-right">{customer.vmsCount}</TableCell>
                    <TableCell className="text-right font-mono">
                      ₹{customer.monthlySpend.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          customer.status === "active"
                            ? "bg-chart-2/10 text-chart-2 border-chart-2/20"
                            : "bg-chart-3/10 text-chart-3 border-chart-3/20"
                        }
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {customer.joinedDate}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleManageCustomer(customer.id)}
                        data-testid={`button-manage-${customer.id}`}
                      >
                        Manage
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
