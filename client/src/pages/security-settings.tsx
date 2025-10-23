import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Smartphone, KeyRound, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function SecuritySettings() {
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: user } = useQuery<{
    id: string;
    username: string;
    email: string;
    twoFactorEnabled: boolean | null;
  }>({
    queryKey: ["/api/auth/me"],
  });

  const { data: qrCode } = useQuery<{
    secret: string;
    qrCodeUrl: string;
  }>({
    queryKey: ["/api/auth/2fa/setup"],
    enabled: showSetup,
  });

  const enableTwoFactorMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest("POST", "/api/auth/2fa/enable", { code });
    },
    onSuccess: () => {
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setShowSetup(false);
      setVerificationCode("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to enable 2FA",
        variant: "destructive",
      });
    },
  });

  const disableTwoFactorMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/2fa/disable", {});
    },
    onSuccess: () => {
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to disable 2FA",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return await apiRequest("POST", "/api/auth/change-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully",
      });
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const handleEnableTwoFactor = () => {
    if (verificationCode.length === 6) {
      enableTwoFactorMutation.mutate(verificationCode);
    }
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account security and authentication</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Two-Factor Authentication
              </CardTitle>
              {user?.twoFactorEnabled ? (
                <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                  Enabled
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  Disabled
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account with two-factor authentication using an
              authenticator app.
            </p>

            {!user?.twoFactorEnabled && !showSetup && (
              <Button
                onClick={() => setShowSetup(true)}
                className="w-full"
                data-testid="button-setup-2fa"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Enable Two-Factor Authentication
              </Button>
            )}

            {user?.twoFactorEnabled && (
              <Button
                variant="destructive"
                onClick={() => disableTwoFactorMutation.mutate()}
                className="w-full"
                data-testid="button-disable-2fa"
              >
                Disable Two-Factor Authentication
              </Button>
            )}
          </CardContent>
        </Card>

        {showSetup && !user?.twoFactorEnabled && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Setup 2FA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm font-medium">Step 1: Scan QR Code</p>
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                {qrCode?.qrCodeUrl && (
                  <div className="flex justify-center p-4 border rounded-lg bg-white">
                    <img src={qrCode.qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                  </div>
                )}
                {qrCode?.secret && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Manual entry key:</p>
                    <p className="text-sm font-mono break-all">{qrCode.secret}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Step 2: Verify Code</p>
                <Label htmlFor="verify-code">Enter 6-digit code</Label>
                <Input
                  id="verify-code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-2xl tracking-widest font-mono"
                  data-testid="input-verify-code"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleEnableTwoFactor}
                  disabled={verificationCode.length !== 6}
                  className="flex-1"
                  data-testid="button-enable-2fa"
                >
                  Enable 2FA
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSetup(false);
                    setVerificationCode("");
                  }}
                  data-testid="button-cancel-setup"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Change your password regularly to keep your account secure.
            </p>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setShowPasswordDialog(true)}
              data-testid="button-change-password"
            >
              Change Password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Security Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>• Use a strong, unique password for your account</li>
              <li>• Enable two-factor authentication for enhanced security</li>
              <li>• Never share your password or 2FA codes</li>
              <li>• Regularly review your account activity</li>
              <li>• Keep your authenticator app backed up</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent data-testid="dialog-change-password">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password to update your account security.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                data-testid="input-current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                data-testid="input-new-password"
              />
              <p className="text-xs text-muted-foreground">Must be at least 8 characters long</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                data-testid="input-confirm-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              data-testid="button-cancel-password"
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={!currentPassword || !newPassword || !confirmPassword || changePasswordMutation.isPending}
              data-testid="button-submit-password"
            >
              {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
