import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface PackageCardProps {
  title: string;
  description: string;
  duration: string;
  price: string;
  image: string;
  features: string[];
}

const PackageCard = ({ title, description, duration, price, image, features }: PackageCardProps) => {
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
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-2xl font-serif">{title}</CardTitle>
          <span className="text-2xl font-bold text-accent">{price}</span>
        </div>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Duration:</span>
            <span>{duration}</span>
          </div>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm transition-smooth hover:translate-x-1">
                <span className="text-accent transition-smooth">✓</span>
                {feature}
              </li>
            ))}
          </ul>
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
