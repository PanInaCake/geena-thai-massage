import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import aboutHero from "@/assets/about-hero.jpg";
import heroLogo from "@/assets/hero-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="gradient-hero py-20 pt-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={aboutHero} 
            alt="Serene Thai massage spa interior"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative z-10">
          <img 
            src={heroLogo} 
            alt="Geena Thai Massage" 
            className="h-40 md:h-52 w-auto mx-auto mb-6 animate-fade-in"
          />
          <h1 className="text-5xl md:text-6xl font-bold font-serif text-primary-foreground mb-6 animate-fade-in">
            About
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Your sanctuary for authentic Thai healing and wellness in the heart of the city.
          </p>
        </div>
      </section>

      {/* About Content Section */}
      <section className="py-16 bg-background relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-accent"></div>
        
        <div className="container max-w-4xl">
          <div className="space-y-12 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold font-serif mb-4 text-center">Our Story</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Founded with a passion for authentic Thai healing traditions, Geena Thai Massage brings centuries-old therapeutic techniques to modern wellness seekers. Our skilled therapists are trained in traditional Thai massage methods, combining ancient wisdom with contemporary understanding of body mechanics and stress relief.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold font-serif mb-4 text-center">Our Philosophy</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe in treating the whole person—body, mind, and spirit. Each massage session is tailored to your individual needs, whether you seek relief from physical tension, mental stress, or simply desire a moment of tranquility in your busy life. Our approach combines therapeutic benefit with deep relaxation.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold font-serif mb-4 text-center">What Makes Us Special</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-accent/5 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Expert Therapists</h3>
                  <p className="text-muted-foreground">
                    All our massage therapists are certified professionals with years of experience in traditional Thai massage techniques.
                  </p>
                </div>
                <div className="p-6 bg-accent/5 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Authentic Techniques</h3>
                  <p className="text-muted-foreground">
                    We practice genuine Thai massage methods passed down through generations, ensuring an authentic healing experience.
                  </p>
                </div>
                <div className="p-6 bg-accent/5 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Serene Environment</h3>
                  <p className="text-muted-foreground">
                    Our tranquil space is designed to transport you away from daily stress into a haven of peace and relaxation.
                  </p>
                </div>
                <div className="p-6 bg-accent/5 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Personalized Care</h3>
                  <p className="text-muted-foreground">
                    Every treatment is customized to address your specific needs, concerns, and wellness goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-accent"></div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
