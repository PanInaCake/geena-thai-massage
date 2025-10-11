import Navigation from "@/components/Navigation";
import PackageCard from "@/components/PackageCard";
import massage1 from "@/assets/massage-1.jpg";
import massage2 from "@/assets/massage-2.jpg";
import massage3 from "@/assets/massage-3.jpg";
import lotusIcon from "@/assets/lotus-icon.jpg";

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
      <section className="gradient-hero py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rotate-12">
            <img src={lotusIcon} alt="" className="w-full h-full object-contain animate-pulse" />
          </div>
          <div className="absolute bottom-10 right-10 w-40 h-40 -rotate-12">
            <img src={lotusIcon} alt="" className="w-full h-full object-contain animate-pulse" style={{ animationDelay: "1s" }} />
          </div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 rotate-45">
            <img src={lotusIcon} alt="" className="w-full h-full object-contain animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>
        <div className="container relative z-10">
          <div className="inline-block mb-6 animate-scale-in">
            <img src={lotusIcon} alt="Lotus" className="w-20 h-20 mx-auto" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-serif text-primary-foreground mb-6 animate-fade-in">
            Experience Ultimate Relaxation
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Discover our signature massage packages designed to rejuvenate your body, mind, and spirit.
          </p>
          <div className="flex items-center justify-center gap-4 text-primary-foreground/80 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-2">
              <span className="text-accent text-2xl">🙏</span>
              <span className="text-sm">Traditional Thai Healing</span>
            </div>
            <span className="text-accent">•</span>
            <div className="flex items-center gap-2">
              <span className="text-accent text-2xl">🧘</span>
              <span className="text-sm">Mind & Body Balance</span>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-16 bg-background relative">
        {/* Thai-inspired decorative border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-accent"></div>
        
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-12 bg-accent"></div>
                <img src={lotusIcon} alt="" className="w-12 h-12" />
                <div className="h-px w-12 bg-accent"></div>
              </div>
            </div>
            <h2 className="text-4xl font-bold font-serif mb-4">Our Massage Packages</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Choose from our carefully curated selection of premium massage experiences.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-accent">✦</span>
                <span>Energy Line Therapy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">✦</span>
                <span>Assisted Stretching</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">✦</span>
                <span>Pressure Point Release</span>
              </div>
            </div>
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
        
        {/* Bottom decorative border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-accent"></div>
      </section>
    </div>
  );
};

export default Index;
