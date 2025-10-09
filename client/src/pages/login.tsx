import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Mail, User, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    gstNumber: "",
    twoFactorCode: "",
  });
  const [sessionToken, setSessionToken] = useState("");
  const [gstError, setGstError] = useState<string>("");

  const validateGST = (gst: string): string => {
    if (gst.length === 0) return "";
    if (gst.length !== 15) return `GST must be exactly 15 characters (currently ${gst.length})`;
    
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gst)) {
      // Detailed validation with anchored regex
      if (!/^[0-9]{2}$/.test(gst.slice(0, 2))) return "First 2 characters must be digits (state code)";
      if (!/^[A-Z]{5}$/.test(gst.slice(2, 7))) return "Characters 3-7 must be uppercase letters (PAN)";
      if (!/^[0-9]{4}$/.test(gst.slice(7, 11))) return "Characters 8-11 must be digits";
      if (!/^[A-Z]$/.test(gst.slice(11, 12))) return "Character 12 must be an uppercase letter";
      if (!/^[1-9A-Z]$/.test(gst.slice(12, 13))) return "Character 13 must be 1-9 or A-Z";
      if (gst[13] !== 'Z') return "Character 14 must be 'Z'";
      if (!/^[0-9A-Z]$/.test(gst.slice(14, 15))) return "Character 15 must be a digit or letter";
    }
    return "";
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate GST number before submitting registration
    if (!isLogin) {
      const gstValidationError = validateGST(formData.gstNumber);
      if (gstValidationError) {
        setGstError(gstValidationError);
        toast({
          title: "Invalid GST Number",
          description: gstValidationError,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      if (isLogin) {
        const response = await apiRequest("POST", "/api/auth/login", {
          username: formData.username,
          password: formData.password,
        });

        const data = await response.json();

        if (data.requiresTwoFactor) {
          setSessionToken(data.sessionToken);
          setStep("2fa");
        } else {
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
          window.location.href = "/";
        }
      } else {
        await apiRequest("POST", "/api/auth/register", {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          gstNumber: formData.gstNumber.toUpperCase(),
        });

        toast({
          title: "Account created",
          description: "Please log in to continue",
        });
        setIsLogin(true);
        setFormData({ ...formData, password: "", gstNumber: "" });
        setGstError(""); // Clear GST error after successful registration
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await apiRequest("POST", "/api/auth/verify-2fa", {
        sessionToken,
        twoFactorCode: formData.twoFactorCode,
      });

      toast({
        title: "Login successful",
        description: "Two-factor authentication verified",
      });
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    }
  };

  if (step === "2fa") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-chart-1/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-chart-1" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Two-Factor Authentication</CardTitle>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Enter the 6-digit code from your authenticator app
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="2fa-code">Verification Code</Label>
                <Input
                  id="2fa-code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={formData.twoFactorCode}
                  onChange={(e) =>
                    setFormData({ ...formData, twoFactorCode: e.target.value.replace(/\D/g, "") })
                  }
                  className="text-center text-2xl tracking-widest font-mono"
                  autoFocus
                  data-testid="input-2fa-code"
                />
              </div>
              <Button type="submit" className="w-full" data-testid="button-verify-2fa">
                Verify & Login
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep("credentials");
                  setFormData({ ...formData, twoFactorCode: "" });
                }}
                data-testid="button-back-to-login"
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-chart-1/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-chart-1" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            {isLogin ? "Sign In" : "Create Account"}
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            AkashOne.com
          </p>
          <p className="text-xs text-muted-foreground text-center">
            unit of Mieux Technologies Pvt Ltd
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  className="pl-9"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  data-testid="input-username"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-9"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GST Number (GSTIN)</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="gstNumber"
                      type="text"
                      placeholder="29ABCDE1234F1Z5"
                      className={`pl-9 font-mono uppercase ${gstError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      value={formData.gstNumber}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        setFormData({ ...formData, gstNumber: value });
                        setGstError(validateGST(value));
                      }}
                      maxLength={15}
                      required
                      data-testid="input-gst-number"
                    />
                  </div>
                  {gstError ? (
                    <p className="text-xs text-destructive">{gstError}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Format: 22AAAAA0000A1Z5 (2 digits + 5 letters + 4 digits + letter + digit/letter + Z + digit/letter)
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-9"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  data-testid="input-password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" data-testid="button-submit">
              {isLogin ? "Sign In" : "Create Account"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ username: "", email: "", password: "", gstNumber: "", twoFactorCode: "" });
                  setGstError(""); // Clear GST error when toggling modes
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-toggle-mode"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
