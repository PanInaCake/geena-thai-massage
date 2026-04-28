import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRecoverySession = async () => {
      const hash = window.location.hash;
      const hasRecoveryTokens = hash.includes("access_token=") || hash.includes("type=recovery");

      if (!hasRecoveryTokens) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setReady(Boolean(session?.user));
        return;
      }

      window.setTimeout(async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setReady(Boolean(session?.user));
      }, 250);
    };

    checkRecoverySession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast.success("Password updated successfully");
      navigate("/admin");
    } catch (error) {
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="gradient-hero py-16 text-center">
        <div className="container">
          <h1 className="text-5xl font-bold font-serif text-primary-foreground mb-4 animate-fade-in">
            Reset Admin Password
          </h1>
          <p
            className="text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Choose a new password for the admin account.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container max-w-md">
          <Card className="shadow-gold animate-scale-in">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Set New Password</CardTitle>
              <CardDescription>
                {ready
                  ? "Enter your new admin password below."
                  : "Open this page from the password reset email to continue."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    disabled={!ready || loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    disabled={!ready || loading}
                  />
                </div>

                <Button type="submit" variant="accent" className="w-full" disabled={!ready || loading}>
                  {loading ? "Updating password..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AdminResetPassword;
