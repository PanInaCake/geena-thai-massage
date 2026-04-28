import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminMagicCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const finishMagicLogin = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const user = session?.user;

        if (!user) {
          toast.error("Magic link sign-in did not complete. Please try again.");
          navigate("/admin-login-owner-9x7k");
          return;
        }

        const { data: isAdminUser, error } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });

        if (error || !isAdminUser) {
          await supabase.auth.signOut();
          toast.error("Access denied - Admin privileges required");
          navigate("/admin/login");
          return;
        }

        if (mounted) {
          toast.success("Admin login successful");
          navigate("/admin");
        }
      } catch (error) {
        toast.error("Failed to complete magic link login");
        navigate("/admin-login-owner-9x7k");
      }
    };

    const timer = window.setTimeout(finishMagicLogin, 250);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-16 pt-32 bg-background">
        <div className="container max-w-md">
          <Card className="shadow-gold">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-center">Signing You In</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              Completing your secure admin magic-link login...
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AdminMagicCallback;
