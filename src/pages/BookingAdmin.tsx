import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Booking {
  id: string;
  name: string;
  email: string;
  package: string;
  booking_date: string;
  booking_time: string;
  created_at: string;
}

const BookingAdmin = () => {
  const [accessCode, setAccessCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Set the access code in the session
      await supabase.rpc('set_config', {
        setting_name: 'app.access_code',
        setting_value: accessCode
      });

      // Try to fetch bookings to verify access
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("booking_date", { ascending: true })
        .order("booking_time", { ascending: true });

      if (error) {
        toast.error("Invalid access code");
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);
      setBookings(data || []);
      toast.success("Access granted!");
    } catch (error) {
      console.error("Access error:", error);
      toast.error("Invalid access code");
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      // Set up realtime subscription for bookings
      const channel = supabase
        .channel('bookings-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings'
          },
          async () => {
            // Refresh bookings when changes occur
            const { data } = await supabase
              .from("bookings")
              .select("*")
              .order("booking_date", { ascending: true })
              .order("booking_time", { ascending: true });
            
            if (data) setBookings(data);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen">
        <Navigation />
        
        <section className="gradient-hero py-16 text-center">
          <div className="container">
            <h1 className="text-5xl font-bold font-serif text-primary-foreground mb-4 animate-fade-in">
              Booking Management
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Enter your access code to view and manage bookings
            </p>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container max-w-md">
            <Card className="shadow-gold animate-scale-in">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Access Required</CardTitle>
                <CardDescription>
                  Please enter your protection code to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAccessSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accessCode">Access Code</Label>
                    <Input
                      id="accessCode"
                      type="password"
                      placeholder="Enter access code"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      className="transition-smooth focus:scale-[1.01]"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    variant="accent" 
                    className="w-full transition-elegant hover:scale-[1.02]"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Access Bookings"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="gradient-hero py-16 text-center">
        <div className="container">
          <h1 className="text-5xl font-bold font-serif text-primary-foreground mb-4 animate-fade-in">
            All Bookings
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Manage your massage appointments
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container max-w-6xl">
          {bookings.length === 0 ? (
            <Card className="shadow-gold">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No bookings found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="shadow-gold transition-elegant hover:scale-[1.01]">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Customer</p>
                        <p className="font-semibold">{booking.name}</p>
                        <p className="text-sm text-muted-foreground">{booking.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Package</p>
                        <p className="font-semibold capitalize">{booking.package}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                        <p className="font-semibold">
                          {format(new Date(booking.booking_date), "MMM dd, yyyy")}
                        </p>
                        <p className="text-sm">{booking.booking_time}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Booked</p>
                        <p className="text-sm">
                          {format(new Date(booking.created_at), "MMM dd, yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BookingAdmin;
