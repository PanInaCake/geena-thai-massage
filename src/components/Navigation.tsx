import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Menu, X } from "lucide-react";
import navbarLogo from "@/assets/navbar-logo.png";

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
      {/* Hamburger Menu Button - Mobile/Tablet Only */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-6 left-6 z-[100] p-2 hover:bg-accent/10 rounded-md transition-smooth lg:hidden"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? (
          <X className="w-6 h-6 text-black" />
        ) : (
          <Menu className="w-6 h-6 text-black" />
        )}
      </button>

      {/* Desktop Navbar - Large Screens Only */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/">
              <Button 
                variant={location.pathname === "/" ? "secondary" : "ghost"}
                className="transition-smooth"
              >
                About Us
              </Button>
            </Link>

            <Link to="/packages">
              <Button 
                variant={location.pathname === "/packages" ? "secondary" : "ghost"}
                className="transition-smooth"
              >
                Packages
              </Button>
            </Link>
            
            <Link to="/booking">
              <Button 
                variant={location.pathname === "/booking" ? "default" : "ghost"}
                className="transition-smooth"
              >
                Book Now
              </Button>
            </Link>
          </div>

          {/* Center Logo */}
          <Link to="/" className="absolute left-1/2 transform -translate-x-1/2">
            <img 
              src={navbarLogo} 
              alt="Geena Thai Massage" 
              className="h-12 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/my-bookings">
                  <Button 
                    variant={location.pathname === "/my-bookings" ? "secondary" : "ghost"}
                    className="transition-smooth"
                  >
                    My Bookings
                  </Button>
                </Link>
                <Button 
                  variant="ghost"
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
                  className="transition-smooth"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Logo - Centered at top */}
      <Link 
        to="/" 
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] lg:hidden"
      >
        <img 
          src={navbarLogo} 
          alt="Geena Thai Massage" 
          className="h-10 w-auto object-contain"
        />
      </Link>

      {/* Full-Screen Menu Overlay - Mobile/Tablet Only */}
      <div
        className={`fixed inset-0 z-[90] bg-background transition-all duration-300 lg:hidden ${
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
              About Us
            </Button>
          </Link>

          <Link to="/packages" onClick={handleNavClick}>
            <Button 
              variant={location.pathname === "/packages" ? "secondary" : "ghost"}
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
