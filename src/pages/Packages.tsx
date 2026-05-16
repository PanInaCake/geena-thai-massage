import Navigation from "@/components/Navigation";
import PackageCard from "@/components/PackageCard";
import massage1 from "@/assets/massage-1.jpg";
import massage2 from "@/assets/massage-2.jpg";
import massage3 from "@/assets/massage-3.jpg";
import massage4 from "@/assets/massage-4.jpg";
import massage5 from "@/assets/massage-5.jpg";
import massage6 from "@/assets/massage-6.jpg";
import massage7 from "@/assets/massage-7.jpg";
import massage8 from "@/assets/massage-8.jpg";
import massage9 from "@/assets/massage-9.jpg";
import massage10 from "@/assets/massage-10.jpg";

const packages = [
  {
    title: "Thai Massage (No Oil)",
    description: "Traditional Thai massage using acupressure and stretching techniques without oil.",
    pricing: [
      { duration: "60 minutes", price: "$95" },
      { duration: "90 minutes", price: "$130" },
      { duration: "120 minutes", price: "$160" }
    ],
    image: massage1
  },
  {
    title: "Thai Oil Massage",
    description: "A relaxing deep tissue massage using warm oil to relieve muscle tension, improve circulation, and promote total body relaxation.",
    pricing: [
      { duration: "60 minutes", price: "$95" },
      { duration: "90 minutes", price: "$130" },
      { duration: "120 minutes", price: "$160" }
    ],
    image: massage2
  },
  {
    title: "Deep Oil Massage",
    description: "A relaxing deep tissue massage using warm oil to relieve muscle tension, improve circulation, and promote total body relaxation.",
    pricing: [
      { duration: "60 minutes", price: "$95" },
      { duration: "90 minutes", price: "$130" },
      { duration: "120 minutes", price: "$160" }
    ],
    image: massage3
  },
  {
    title: "Aromatherapy Massage",
    description: "A soothing massage using aromatic essential oils with warm oil to relax the body, reduce stress, and calm the mind.",
    pricing: [
      { duration: "60 minutes", price: "$95" },
      { duration: "90 minutes", price: "$130" },
      { duration: "120 minutes", price: "$160" }
    ],
    image: massage4
  },
  {
    title: "Back, Neck & Shoulder Massage",
    description: "A focused massage designed to relieve tension, reduce stiffness, and relax the back, neck, and shoulder muscles.",
    pricing: [
      { duration: "30 minutes", price: "$60" },
      { duration: "45 minutes", price: "$75" },
      { duration: "60 minutes", price: "$100" }
    ],
    image: massage5
  },
  {
    title: "Head Relaxation Massage",
    description: "A calming head massage designed to relieve stress, ease tension, and promote deep relaxation.",
    pricing: [
      { duration: "30 minutes", price: "$55" },
      { duration: "45 minutes", price: "$70" },
      { duration: "60 minutes", price: "$95" }
    ],
    image: massage6
  },
  {
    title: "Foot Massage",
    description: "A relaxing foot massage that helps relieve tired feet, improve circulation, and promote overall relaxation.",
    pricing: [
      { duration: "30 minutes", price: "$55" },
      { duration: "60 minutes", price: "$100" }
    ],
    image: massage7
  },
  {
    title: "Foot Spa + Foot Massage",
    description: "A soothing foot treatment combining a relaxing foot spa and massage to soften the skin, relieve tired feet, and improve circulation.",
    pricing: [
      { duration: "60 minutes", price: "$100" }
    ],
    image: massage8
  },
  {
    title: "Back Scrub + Full Body Massage",
    description: "A refreshing back scrub combined with a relaxing full body oil massage to exfoliate the skin, relieve tension, and leave you feeling renewed.",
    pricing: [
      { duration: "90 minutes", price: "$150" }
    ],
    image: massage9
  },
  {
    title: "Therapeutic Massage",
    description: "Treatment massage for the whole body or targeted areas, designed to relieve pain, reduce muscle tension, improve mobility, and support recovery. This therapy may include deep tissue techniques, pressure point therapy, stretching, and focused muscle work to help restore balance and promote overall wellness.",
    pricing: [
      { duration: "60 minutes", price: "$110" },
      { duration: "90 minutes", price: "$140" },
      { duration: "120 minutes", price: "$170" }
    ],
    image: massage10
  },
  {
    title: "Hot Stone Massage",
    description: "Heated basalt stones combined with massage techniques to melt away tension and promote deep relaxation.",
    pricing: [
      { duration: "90 minutes", price: "$145" }
    ],
    image: massage4
  },
  {
    title: "Hot Herbal Massage",
    description: "Traditional Thai herbal compress massage using heated herbs to soothe muscles and invigorate the senses.",
    pricing: [
      { duration: "90 minutes", price: "$145" }
    ],
    image: massage6
  }
];

const Packages = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="gradient-hero py-20 pt-32 text-center relative overflow-hidden">
        <div className="container relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold font-serif text-primary-foreground mb-6 animate-fade-in">
            Our Massage Packages
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
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-accent"></div>
        
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-serif mb-4">Choose Your Experience</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Select from our carefully curated selection of premium massage experiences.
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
        
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-accent"></div>
      </section>

      {/* Footer */}
      <footer className="bg-primary py-6 text-center">
        <p className="text-primary-foreground text-sm">
          © {new Date().getFullYear()} Geena Thai Massage. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Packages;
