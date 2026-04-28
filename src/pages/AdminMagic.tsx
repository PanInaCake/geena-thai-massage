import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ADMIN_EMAIL = "geenathaimassage@gmail.com";

const AdminMagic = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingAdminSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: isAdminUser } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (isAdminUser) {
        navigate("/admin");
      }
    };

    checkExistingAdminSession();
  }, [navigate]);

  const handleSendMagicLink = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: ADMIN_EMAIL,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (error) throw error;

      toast.success(`Magic link sent to ${ADMIN_EMAIL}`);
    } catch (error) {
      toast.error("Failed to send magic link");
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
            Admin Magic Link
          </h1>
          <p
            className="text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Send a secure one-time sign-in link to the owner inbox.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container max-w-md">
          <Card className="shadow-gold animate-scale-in">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Owner Admin Access</CardTitle>
              <CardDescription>
                This sends a one-time login link to {ADMIN_EMAIL}. Open that email and click the link to access the admin
                dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                variant="accent"
                className="w-full transition-elegant hover:scale-[1.02]"
                disabled={loading}
                onClick={handleSendMagicLink}
              >
                {loading ? "Sending link..." : "Send Link"}
              </Button>

              <Link to="/admin/login" className="block">
                <Button type="button" variant="outline" className="w-full">
                  Back to Admin Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AdminMagic;
