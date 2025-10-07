import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

//todo: remove mock functionality
const mockInvoices = [
  {
    id: "INV-2024-001",
    date: "2024-10-01",
    amount: 15000,
    gst: 2700,
    total: 17700,
    status: "paid",
    resources: "VM: web-server-01, Storage: 100GB",
  },
  {
    id: "INV-2024-002",
    date: "2024-09-01",
    amount: 12500,
    gst: 2250,
    total: 14750,
    status: "paid",
    resources: "VM: db-primary, Network: vpc-prod",
  },
  {
    id: "INV-2024-003",
    date: "2024-08-01",
    amount: 18000,
    gst: 3240,
    total: 21240,
    status: "paid",
    resources: "VM: 3 instances, Storage: 250GB",
  },
];

//todo: remove mock functionality
const currentUsage = {
  vms: { count: 5, cost: 8500 },
  storage: { size: "180GB", cost: 3600 },
  network: { count: 3, cost: 2400 },
  subtotal: 14500,
  cgst: 1305, // 9% CGST
  sgst: 1305, // 9% SGST
  igst: 0,    // 0% IGST (not applicable for intra-state)
  total: 17110,
};

export default function Billing() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-muted-foreground mt-1">
            Manage billing with Indian GST compliance
          </p>
        </div>
        <Button data-testid="button-download-gst-report">
          <Download className="h-4 w-4 mr-2" />
          Download GST Report
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Current Month Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Virtual Machines ({currentUsage.vms.count})</span>
                <span className="font-mono">₹{currentUsage.vms.cost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Storage ({currentUsage.storage.size})</span>
                <span className="font-mono">₹{currentUsage.storage.cost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network ({currentUsage.network.count} VPCs)</span>
                <span className="font-mono">₹{currentUsage.network.cost.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-sm font-medium">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{currentUsage.subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">GST Breakdown</span>
                <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
                  18% GST
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CGST (9%)</span>
                  <span className="font-mono" data-testid="text-cgst">₹{currentUsage.cgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SGST (9%)</span>
                  <span className="font-mono" data-testid="text-sgst">₹{currentUsage.sgst.toLocaleString('en-IN')}</span>
                </div>
                {currentUsage.igst > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IGST (18%)</span>
                    <span className="font-mono" data-testid="text-igst">₹{currentUsage.igst.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-semibold">Total Amount</span>
              <span className="text-2xl font-bold font-mono" data-testid="text-total-amount">
                ₹{currentUsage.total.toLocaleString('en-IN')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">GST Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Business GSTIN</p>
                <p className="text-sm font-mono text-muted-foreground mt-1">29ABCDE1234F1Z5</p>
              </div>
              <div>
                <p className="text-sm font-medium">Billing Address</p>
                <p className="text-sm text-muted-foreground mt-1">
                  123 Tech Park, Whitefield<br />
                  Bangalore, Karnataka 560066<br />
                  India
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Tax Type</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                    Intra-State (CGST + SGST)
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  For inter-state transactions, IGST will be applied instead
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full" data-testid="button-update-gst">
              <FileText className="h-4 w-4 mr-2" />
              Update GST Details
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Resources</TableHead>
                  <TableHead className="text-right">Base Amount</TableHead>
                  <TableHead className="text-right">GST</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover-elevate">
                    <TableCell className="font-mono font-medium" data-testid={`invoice-id-${invoice.id}`}>
                      {invoice.id}
                    </TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {invoice.resources}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ₹{invoice.amount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ₹{invoice.gst.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      ₹{invoice.total.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-chart-2/10 text-chart-2 border-chart-2/20"
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`button-download-${invoice.id}`}
                      >
                        <Download className="h-4 w-4" />
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
