import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay, isPast, parseISO, startOfToday } from "date-fns";

interface Booking {
  id: string;
  name: string;
  email: string;
  package: string;
  booking_date: string;
  booking_time: string;
  created_at: string;
  notes: string | null;
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetchBookings();
  }, []);

  const checkAuthAndFetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to view your bookings");
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: isAdminUser } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      setIsAdmin(isAdminUser || false);

      // Fetch bookings - all if admin, only own if not
      let query = supabase
        .from("bookings")
        .select("*")
        .order("booking_date", { ascending: true })
        .order("booking_time", { ascending: true });

      if (!isAdminUser) {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  // Filter out past bookings
  const isBookingPast = (booking: Booking) => {
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
    return isPast(bookingDateTime);
  };

  const upcomingBookings = bookings.filter(booking => !isBookingPast(booking));
  
  const bookedDates = upcomingBookings.map(b => new Date(b.booking_date));
  
  const selectedDateBookings = upcomingBookings.filter(booking => 
    selectedDate && isSameDay(new Date(booking.booking_date), selectedDate)
  );

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

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="gradient-hero py-16 pt-32 text-center">
        <div className="container">
          <h1 className="text-5xl font-bold font-serif text-primary-foreground mb-4 animate-fade-in">
            {isAdmin ? "All Bookings" : "My Bookings"}
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {isAdmin ? "View all customer appointments" : "View your upcoming massage appointments"}
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container max-w-4xl">
          {upcomingBookings.length === 0 ? (
            <Card className="shadow-gold">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No bookings yet</p>
                <p className="text-sm text-muted-foreground">
                  Ready to book your first massage session?
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              <Card className="shadow-gold">
                <CardHeader>
                  <CardTitle>Select a Date</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < startOfToday()}
                    modifiers={{
                      booked: bookedDates
                    }}
                    modifiersStyles={{
                      booked: {
                        fontWeight: "bold",
                        textDecoration: "underline"
                      }
                    }}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              {selectedDate && selectedDateBookings.length > 0 && (
                <Card className="shadow-gold">
                  <CardHeader>
                    <CardTitle>
                      Bookings for {format(selectedDate, "MMMM dd, yyyy")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {selectedDateBookings.map((booking) => (
                        <Card key={booking.id} className="transition-elegant hover:scale-[1.01]">
                          <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {isAdmin && (
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Customer</p>
                                  <p className="font-semibold">{booking.name}</p>
                                  <p className="text-sm text-muted-foreground">{booking.email}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Package</p>
                                <p className="font-semibold capitalize">{booking.package}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Time</p>
                                <p className="font-semibold">{booking.booking_time}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Booked on</p>
                                <p className="text-sm">
                                  {format(new Date(booking.created_at), "MMM dd, yyyy")}
                                </p>
                              </div>
                            </div>
                            {booking.notes && (
                              <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                                <p className="text-sm">{booking.notes}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedDate && selectedDateBookings.length === 0 && (
                <Card className="shadow-gold">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No bookings for {format(selectedDate, "MMMM dd, yyyy")}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyBookings;
