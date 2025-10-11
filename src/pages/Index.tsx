import Navigation from "@/components/Navigation";
import PackageCard from "@/components/PackageCard";
import massage1 from "@/assets/massage-1.jpg";
import massage2 from "@/assets/massage-2.jpg";
import massage3 from "@/assets/massage-3.jpg";

const packages = [
  {
    title: "Traditional Thai Massage",
    description: "Ancient healing art combining acupressure, stretching, and rhythmic compression for total body renewal.",
    duration: "60 minutes",
    price: "$95",
    image: massage1,
    features: [
      "Full body treatment",
      "Stretching techniques",
      "Pressure point therapy",
      "Energy line focus"
    ]
  },
  {
    title: "Hot Stone Therapy",
    description: "Warm volcanic stones melt away tension and stress, promoting deep muscle relaxation.",
    duration: "90 minutes",
    price: "$145",
    image: massage2,
    features: [
      "Heated volcanic stones",
      "Deep tissue techniques",
      "Extended session time",
      "Premium oils & lotions"
    ]
  },
  {
    title: "Aromatherapy Bliss",
    description: "Indulge in a therapeutic massage enhanced with custom-blended essential oils for ultimate wellness.",
    duration: "75 minutes",
    price: "$120",
    image: massage3,
    features: [
      "Custom essential oil blend",
      "Therapeutic massage",
      "Stress relief focus",
      "Complimentary tea service"
    ]
  }
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="gradient-hero py-20 text-center">
        <div className="container">
          <h1 className="text-5xl md:text-6xl font-bold font-serif text-primary-foreground mb-6 animate-fade-in">
            Experience Ultimate Relaxation
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Discover our signature massage packages designed to rejuvenate your body, mind, and spirit.
          </p>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-serif mb-4">Our Massage Packages</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our carefully curated selection of premium massage experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div 
                key={index} 
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "backwards" }}
              >
                <PackageCard {...pkg} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
