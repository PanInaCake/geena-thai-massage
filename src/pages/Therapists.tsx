import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const therapists = [
  {
    name: "Geena",
    photo: "/geena-therapist.jpg",
    imageClass: "object-cover object-top",
    bio: "I graduated in Therapeutic Massage from the Ministry of Public Health, Thailand. I have over 25 years of experience working as a massage therapist and massage trainer in both Thailand and overseas. I offer full-body deep tissue massage, targeting the back, neck, shoulders, arms, legs, hands, feet, head, and often the glutes and stomach, to help relieve chronic tension, reduce pain, and improve mobility."
  },
  {
    name: "Nui",
    photo: "/nui-therapist.jpg",
    imageClass: "object-cover object-top",
    bio: "With over 20 years of massage experience in Thailand, I am a certified Thai massage practitioner with a 1200-hour course qualification from the Ministry of Public Health of Thailand. Having also worked as a trainer, I bring extensive knowledge and experience to every session, tailoring each massage to suit my clients’ individual needs.",
  },
];

const Therapists = () => {
  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="gradient-hero py-20 pt-32 text-center">
        <div className="container">
          <h1 className="text-5xl md:text-6xl font-bold font-serif text-primary-foreground mb-6 animate-fade-in">
            Our Therapists
          </h1>
          <p
            className="text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Meet the skilled hands behind your healing experience.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-accent" />

        <div className="container max-w-4xl space-y-10">
          {therapists.map((therapist) => (
            <Card key={therapist.name} className="shadow-gold overflow-hidden animate-fade-in">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="aspect-[3/4] md:aspect-auto md:min-h-[28rem] overflow-hidden bg-muted">
                    <img
                      src={therapist.photo}
                      alt={`${therapist.name}, massage therapist at Geena Thai Massage`}
                      className={`h-full w-full ${therapist.imageClass}`}
                    />
                  </div>
                  <div className="flex flex-col justify-center p-8 md:p-10 lg:p-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">{therapist.name}</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">{therapist.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-accent" />
      </section>

      <Footer />
    </div>
  );
};

export default Therapists;
