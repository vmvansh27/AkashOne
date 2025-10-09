import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Dashboard from "@/pages/dashboard";
import VirtualMachines from "@/pages/virtual-machines";
import Networks from "@/pages/networks";
import Storage from "@/pages/storage";
import Monitoring from "@/pages/monitoring";
import Billing from "@/pages/billing";
import Resellers from "@/pages/resellers";
import WhiteLabel from "@/pages/whitelabel";
import ResellerCustomers from "@/pages/reseller-customers";
import SuperAdmin from "@/pages/super-admin";
import AdminRights from "@/pages/admin-rights";
import AllVMs from "@/pages/all-vms";
import AllKubernetes from "@/pages/all-kubernetes";
import SecuritySettings from "@/pages/security-settings";
import Kubernetes from "@/pages/kubernetes";
import Database from "@/pages/database";
import Marketplace from "@/pages/marketplace";
import ObjectStorage from "@/pages/object-storage";
import DNS from "@/pages/dns";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import { useQuery } from "@tanstack/react-query";

function Router() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/vms" component={VirtualMachines} />
      <Route path="/kubernetes" component={Kubernetes} />
      <Route path="/database" component={Database} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/object-storage" component={ObjectStorage} />
      <Route path="/dns" component={DNS} />
      <Route path="/networks" component={Networks} />
      <Route path="/storage" component={Storage} />
      <Route path="/monitoring" component={Monitoring} />
      <Route path="/billing" component={Billing} />
      <Route path="/resellers" component={Resellers} />
      <Route path="/whitelabel" component={WhiteLabel} />
      <Route path="/customers" component={ResellerCustomers} />
      <Route path="/super-admin" component={SuperAdmin} />
      <Route path="/admin-rights" component={AdminRights} />
      <Route path="/all-vms" component={AllVMs} />
      <Route path="/all-kubernetes" component={AllKubernetes} />
      <Route path="/security" component={SecuritySettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between p-4 border-b">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-auto p-6">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
