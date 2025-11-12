import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Menu, X } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    setIsMenuOpen(false);
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };
  
  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-6 left-6 z-[100] p-2 hover:bg-accent/10 rounded-md transition-smooth"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? (
          <X className="w-6 h-6 text-black" />
        ) : (
          <Menu className="w-6 h-6 text-black" />
        )}
      </button>

      {/* Full-Screen Menu Overlay */}
      <div
        className={`fixed inset-0 z-[90] bg-background transition-all duration-300 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <nav className="flex flex-col items-center justify-center h-full gap-8">
          <Link to="/" onClick={handleNavClick}>
            <Button 
              variant={location.pathname === "/" ? "secondary" : "ghost"}
              size="lg"
              className="text-2xl py-6 px-8 transition-smooth"
            >
              Packages
            </Button>
          </Link>
          
          <Link to="/booking" onClick={handleNavClick}>
            <Button 
              variant={location.pathname === "/booking" ? "accent" : "ghost"}
              size="lg"
              className="text-2xl py-6 px-8 transition-smooth"
            >
              Book Now
            </Button>
          </Link>
          
          {user ? (
            <>
              <Link to="/my-bookings" onClick={handleNavClick}>
                <Button 
                  variant={location.pathname === "/my-bookings" ? "secondary" : "ghost"}
                  size="lg"
                  className="text-2xl py-6 px-8 transition-smooth"
                >
                  My Bookings
                </Button>
              </Link>
              <Button 
                variant="ghost"
                size="lg"
                onClick={handleSignOut}
                className="text-2xl py-6 px-8 transition-smooth"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth" onClick={handleNavClick}>
              <Button 
                variant={location.pathname === "/auth" ? "secondary" : "ghost"}
                size="lg"
                className="text-2xl py-6 px-8 transition-smooth"
              >
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </>
  );
};

export default Navigation;
