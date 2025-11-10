import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface PricingOption {
  duration: string;
  price: string;
}

interface PackageCardProps {
  title: string;
  description: string;
  pricing: PricingOption[];
  image: string;
  features?: string[];
}

const PackageCard = ({ title, description, pricing, image, features }: PackageCardProps) => {
  return (
    <Card className="overflow-hidden shadow-soft hover:shadow-gold transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-video overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-2xl font-serif mb-2">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="space-y-2">
            {pricing.map((option, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{option.duration}</span>
                <span className="font-bold text-accent text-lg">{option.price}</span>
              </div>
            ))}
          </div>
          {features && features.length > 0 && (
            <ul className="space-y-2 pt-2 border-t border-border">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm transition-smooth hover:translate-x-1">
                  <span className="text-accent transition-smooth">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Link to="/booking" className="w-full">
          <Button variant="accent" size="lg" className="w-full transition-elegant hover:scale-[1.02]">
            Book This Package
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PackageCard;
