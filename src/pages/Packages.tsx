import Navigation from "@/components/Navigation";
import PackageCard from "@/components/PackageCard";
import massageThaiNoOil from "@/assets/massage-thai-no-oil.jpg";
import massageThaiOil from "@/assets/massage-thai-oil.jpg";
import massageDeepOil from "@/assets/massage-deep-oil.jpg";
import massageAromatherapy from "@/assets/massage-aromatherapy.jpg";
import massageNeckShoulder from "@/assets/massage-neck-shoulder.jpg";
import massageHead from "@/assets/massage-head.jpg";
import massageFoot from "@/assets/massage-foot.jpg";
import massageFootSpa from "@/assets/massage-foot-spa.jpg";
import massageBackScrub from "@/assets/massage-back-scrub.jpg";
import massageTherapeutic from "@/assets/massage-therapeutic.jpg";
import massageHotStone from "@/assets/massage-hot-stone.jpg";
import massageHotHerbal from "@/assets/massage-hot-herbal.jpg";

const packages = [
  {
    title: "Thai Massage (No Oil)",
    description: "A traditional Thai that combines stretching and acupressure techniques to help relieve muscle tension, improve flexibility, increase blood circulation, and promote deep relaxation and overall well-being.",
    pricing: [
      { duration: "60 minutes", price: "$95" },
      { duration: "90 minutes", price: "$130" },
      { duration: "120 minutes", price: "$160" }
    ],
    image: massageThaiNoOil
  },
  {
    title: "Thai Oil Massage",
    description: "A relaxing deep tissue massage using warm oil to relieve muscle tension, improve circulation, and promote total body relaxation.",
    pricing: [
      { duration: "60 minutes", price: "$95" },
      { duration: "90 minutes", price: "$130" },
      { duration: "120 minutes", price: "$160" }
    ],
    image: massageThaiOil
  },
  {
    title: "Deep Oil Massage",
    description: "A relaxing deep tissue massage using warm oil to relieve muscle tension, improve circulation, and promote total body relaxation.",
    pricing: [
      { duration: "60 minutes", price: "$95" },
      { duration: "90 minutes", price: "$130" },
      { duration: "120 minutes", price: "$160" }
    ],
    image: massageDeepOil
  },
  {
    title: "Aromatherapy Massage",
    description: "A soothing massage using aromatic essential oils with warm oil to relax the body, reduce stress, and calm the mind.",
    pricing: [
      { duration: "60 minutes", price: "$95" },
      { duration: "90 minutes", price: "$130" },
      { duration: "120 minutes", price: "$160" }
    ],
    image: massageAromatherapy
  },
  {
    title: "Back, Neck & Shoulder Massage",
    description: "A focused massage designed to relieve tension, reduce stiffness, and relax the back, neck, and shoulder muscles.",
    pricing: [
      { duration: "30 minutes", price: "$60" },
      { duration: "45 minutes", price: "$75" },
      { duration: "60 minutes", price: "$100" }
    ],
    image: massageNeckShoulder
  },
  {
    title: "Head Relaxation Massage",
    description: "A calming head massage designed to relieve stress, ease tension, and promote deep relaxation.",
    pricing: [
      { duration: "30 minutes", price: "$55" },
      { duration: "45 minutes", price: "$70" },
      { duration: "60 minutes", price: "$95" }
    ],
    image: massageHead
  },
  {
    title: "Foot Massage",
    description: "A relaxing foot massage that helps relieve tired feet, improve circulation, and promote overall relaxation.",
    pricing: [
      { duration: "30 minutes", price: "$55" },
      { duration: "60 minutes", price: "$100" }
    ],
    image: massageFoot
  },
  {
    title: "Foot Spa + Foot Massage",
    description: "A soothing foot treatment combining a relaxing foot spa and massage to soften the skin, relieve tired feet, and improve circulation.",
    pricing: [
      { duration: "60 minutes", price: "$100" }
    ],
    image: massageFootSpa
  },
  {
    title: "Back Scrub + Full Body Massage",
    description: "A refreshing back scrub combined with a relaxing full body oil massage to exfoliate the skin, relieve tension, and leave you feeling renewed.",
    pricing: [
      { duration: "90 minutes", price: "$150" }
    ],
    image: massageBackScrub
  },
  {
    title: "Therapeutic Massage",
    description: "Treatment massage for the whole body or targeted areas, designed to relieve pain, reduce muscle tension, improve mobility, and support recovery. This therapy may include deep tissue techniques, pressure point therapy, stretching, and focused muscle work to help restore balance and promote overall wellness.",
    pricing: [
      { duration: "60 minutes", price: "$110" },
      { duration: "90 minutes", price: "$140" },
      { duration: "120 minutes", price: "$170" }
    ],
    image: massageTherapeutic
  },
  {
    title: "Hot Stone Massage",
    description: "Uses warm stones combined with warm oil to help relax muscles, improve blood circulation, reduce stress, and relieve body tension. The warmth of the stones provides deep relaxation and promotes overall well-being",
    pricing: [
      { duration: "90 minutes", price: "$145" }
    ],
    image: massageHotStone
  },
  {
    title: "Hot Herbal Massage",
    description: " Warm herbal Compress with warm oil massage helps relax muscles, relieve body tension, improve blood circulation, and promote deep relaxation. The warm herbal compress enhances comfort and refreshes both body and mind",
    pricing: [
      { duration: "90 minutes", price: "$145" }
    ],
    image: massageHotHerbal
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
