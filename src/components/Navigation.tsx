import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const location = useLocation();
  
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
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
