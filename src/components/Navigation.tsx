import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold font-serif bg-gradient-primary bg-clip-text text-transparent">
            Serenity Spa
          </h1>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button 
              variant={location.pathname === "/" ? "secondary" : "ghost"}
              size="sm"
              className="transition-smooth"
            >
              Packages
            </Button>
          </Link>
          <Link to="/booking">
            <Button 
              variant={location.pathname === "/booking" ? "accent" : "ghost"}
              size="sm"
              className="transition-smooth"
            >
              Book Now
            </Button>
          </Link>
          {user ? (
            <>
              <Link to="/my-bookings">
                <Button 
                  variant={location.pathname === "/my-bookings" ? "secondary" : "ghost"}
                  size="sm"
                  className="transition-smooth"
                >
                  My Bookings
                </Button>
              </Link>
              <Button 
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="transition-smooth"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button 
                variant={location.pathname === "/auth" ? "secondary" : "ghost"}
                size="sm"
                className="transition-smooth"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
