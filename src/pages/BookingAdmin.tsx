import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetchBookings();
  }, []);

  const checkAuthAndFetchBookings = async () => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to access this page");
        navigate("/admin/login");
        return;
      }

      // Check if user has admin role
      const { data: isAdminUser, error: roleError } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (roleError || !isAdminUser) {
        toast.error("Access denied - Admin privileges required");
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      setIsAdmin(true);

      // Fetch bookings
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("booking_date", { ascending: true })
        .order("booking_time", { ascending: true });

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      toast.error("Failed to load bookings");
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/admin/login");
  };

  useEffect(() => {
    if (isAdmin) {
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
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <section className="py-16 bg-background">
          <div className="container text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </section>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="gradient-hero py-16 text-center">
        <div className="container flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-5xl font-bold font-serif text-primary-foreground mb-4 animate-fade-in">
              All Bookings
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Manage your massage appointments
            </p>
          </div>
          <Button 
            onClick={handleSignOut}
            variant="outline" 
            className="animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            Sign Out
          </Button>
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
