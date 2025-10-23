import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Server, HardDrive, Network, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useResellerAccess } from "@/hooks/use-role-access";

export default function PricingCalculator() {
  const { hasAccess, isLoading } = useResellerAccess();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Calculator className="h-8 w-8" />
          Pricing Calculator
        </h1>
        <p className="text-muted-foreground mt-1">
          Estimate your infrastructure costs before provisioning resources
        </p>
      </div>

      <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">Pricing Data Configuration Required</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                This feature requires pricing data to be configured in the backend. Set up resource pricing tiers and regional rates to enable cost estimation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Configuration</CardTitle>
              <CardDescription>Select your infrastructure requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vm-type" data-testid="label-vm-type">Virtual Machine Type</Label>
                  <Select disabled>
                    <SelectTrigger id="vm-type" data-testid="select-vm-type">
                      <SelectValue placeholder="Select VM type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (2 vCPU, 4GB RAM)</SelectItem>
                      <SelectItem value="medium">Medium (4 vCPU, 8GB RAM)</SelectItem>
                      <SelectItem value="large">Large (8 vCPU, 16GB RAM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vm-count" data-testid="label-vm-count">Number of VMs</Label>
                  <Input
                    id="vm-count"
                    type="number"
                    placeholder="1"
                    defaultValue="1"
                    disabled
                    data-testid="input-vm-count"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storage" data-testid="label-storage">Storage (GB)</Label>
                  <Input
                    id="storage"
                    type="number"
                    placeholder="100"
                    defaultValue="100"
                    disabled
                    data-testid="input-storage"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bandwidth" data-testid="label-bandwidth">Bandwidth (GB/month)</Label>
                  <Input
                    id="bandwidth"
                    type="number"
                    placeholder="1000"
                    defaultValue="1000"
                    disabled
                    data-testid="input-bandwidth"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region" data-testid="label-region">Region</Label>
                  <Select disabled>
                    <SelectTrigger id="region" data-testid="select-region">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mumbai">Mumbai, India</SelectItem>
                      <SelectItem value="delhi">Delhi, India</SelectItem>
                      <SelectItem value="bangalore">Bangalore, India</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billing-cycle" data-testid="label-billing-cycle">Billing Cycle</Label>
                  <Select disabled>
                    <SelectTrigger id="billing-cycle" data-testid="select-billing-cycle">
                      <SelectValue placeholder="Monthly" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="annual">Annual (Save 20%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full" disabled data-testid="button-calculate">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Estimated Cost
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Implementation Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Frontend calculator UI designed</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Backend pricing API integration pending</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Resource pricing tiers configuration required</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Regional pricing variations setup needed</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Cost Estimate</CardTitle>
              <CardDescription>Your monthly infrastructure cost</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <div className="text-4xl font-bold" data-testid="text-total-cost">₹0.00</div>
                <p className="text-sm text-muted-foreground mt-1">per month + GST</p>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    Compute
                  </span>
                  <span className="font-medium" data-testid="text-compute-cost">₹0.00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    Storage
                  </span>
                  <span className="font-medium" data-testid="text-storage-cost">₹0.00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-muted-foreground" />
                    Network
                  </span>
                  <span className="font-medium" data-testid="text-network-cost">₹0.00</span>
                </div>
              </div>

              <Button className="w-full" variant="outline" disabled data-testid="button-save-estimate">
                Save Estimate
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Cost Optimization Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Choose annual billing for 20% savings</p>
              <p>• Use reserved instances for predictable workloads</p>
              <p>• Enable auto-scaling to optimize resource usage</p>
              <p>• Monitor and right-size your instances</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
