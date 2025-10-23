import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { SiStripe, SiRazorpay, SiPaypal } from "react-icons/si";
import { useResellerAccess } from "@/hooks/use-role-access";

export default function PaymentGateways() {
  const { hasAccess, isLoading } = useResellerAccess();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!hasAccess) {
    return null;
  }

  const gateways = [
    {
      name: "Stripe",
      icon: SiStripe,
      description: "Accept credit cards, digital wallets, and bank transfers globally",
      status: "not_configured",
      features: ["Credit/Debit Cards", "UPI", "Digital Wallets", "Subscriptions"],
    },
    {
      name: "Razorpay",
      icon: SiRazorpay,
      description: "Leading payment gateway for Indian businesses with UPI and netbanking",
      status: "not_configured",
      features: ["UPI", "Credit/Debit Cards", "Netbanking", "Wallets"],
    },
    {
      name: "PayPal",
      icon: SiPaypal,
      description: "Global payment platform with buyer and seller protection",
      status: "not_configured",
      features: ["PayPal Balance", "Credit Cards", "Buy Now Pay Later", "International"],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Payment Gateway Configuration
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure payment gateways to accept customer payments
          </p>
        </div>
        <Button data-testid="button-add-gateway" disabled>
          <Settings className="h-4 w-4 mr-2" />
          Configure Gateway
        </Button>
      </div>

      <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">Backend Configuration Required</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                This feature requires backend integration with payment gateway APIs. Configure API keys in your server environment to enable payment processing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {gateways.map((gateway) => {
          const IconComponent = gateway.icon;
          return (
            <Card key={gateway.name} data-testid={`card-gateway-${gateway.name.toLowerCase()}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <IconComponent className="h-8 w-8" />
                  <Badge variant="secondary" data-testid={`badge-status-${gateway.name.toLowerCase()}`}>
                    Not Configured
                  </Badge>
                </div>
                <CardTitle className="mt-4">{gateway.name}</CardTitle>
                <CardDescription>{gateway.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Supported Payment Methods:</p>
                    <div className="flex flex-wrap gap-2">
                      {gateway.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled
                    data-testid={`button-configure-${gateway.name.toLowerCase()}`}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure {gateway.name}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Implementation Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Frontend UI designed and ready</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Backend API integration pending</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Payment gateway credentials configuration required</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Webhook endpoints setup needed</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
