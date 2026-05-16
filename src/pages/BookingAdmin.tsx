import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
  formatBookingTimeDisplay,
  groupBookingsByCustomer,
} from "@/lib/bookingAvailability";

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

const ADMIN_CALENDAR_CLASS_NAMES = {
  months: "flex flex-col space-y-6 w-full",
  month: "space-y-6 w-full",
  caption: "flex justify-center pt-2 relative items-center",
  caption_label: "text-2xl font-serif font-semibold",
  nav: "space-x-2 flex items-center",
  nav_button: "h-10 w-10",
  table: "w-full border-collapse",
  head_row: "flex w-full justify-around mb-2",
  head_cell: "text-muted-foreground w-14 font-medium text-sm uppercase tracking-wide",
  row: "flex w-full justify-around mt-2",
  cell: "h-14 w-14 text-center text-base p-0 relative focus-within:relative focus-within:z-20",
  day: "h-14 w-14 p-0 text-lg font-medium aria-selected:opacity-100",
  day_selected:
    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
  day_today: "bg-accent text-accent-foreground rounded-md",
  day_outside: "text-muted-foreground opacity-40",
};

async function fetchAllBookings() {
  return supabase
    .from("bookings")
    .select("*")
    .order("booking_date", { ascending: true })
    .order("booking_time", { ascending: true });
}

function BookingListItem({ booking }: { booking: Booking }) {
  return (
    <div className="rounded-lg border bg-card/50 p-4 space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-lg">{formatBookingTimeDisplay(booking.booking_time)}</p>
        <p className="text-sm text-muted-foreground">{booking.package}</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Booked {format(new Date(booking.created_at), "MMM d, yyyy 'at' h:mm a")}
      </p>
      {booking.notes && (
        <p className="text-sm border-t pt-2 mt-2">
          <span className="text-muted-foreground">Notes: </span>
          {booking.notes}
        </p>
      )}
    </div>
  );
}

function CustomerGroupCard({
  group,
  showDate = false,
}: {
  group: ReturnType<typeof groupBookingsByCustomer<Booking>>[number];
  showDate?: boolean;
}) {
  return (
    <Card className="shadow-gold overflow-hidden">
      <CardHeader className="pb-3 bg-muted/30">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-xl font-serif">{group.name}</CardTitle>
            <CardDescription className="text-base">{group.email}</CardDescription>
          </div>
          <Badge variant="secondary">
            {group.bookings.length} {group.bookings.length === 1 ? "booking" : "bookings"}
          </Badge>
        </div>
        {group.alternateNames.length > 0 && (
          <p className="text-xs text-muted-foreground pt-2">
            Also booked as: {group.alternateNames.join(", ")}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {group.bookings.map((booking) => (
          <div key={booking.id}>
            {showDate && (
              <p className="text-sm font-medium text-primary mb-2">
                {format(parseISO(booking.booking_date), "EEEE, MMM d, yyyy")}
              </p>
            )}
            <BookingListItem booking={booking} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const BookingAdmin = () => {
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
      setIsAdmin(true);

      const { data, error } = await fetchAllBookings();
      if (error) throw error;

      setBookings(data || []);
    } catch {
      toast.error("Failed to load bookings");
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem("isAdmin");
    toast.success("Signed out successfully");
    navigate("/admin/login");
  };

  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel("bookings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        async () => {
          const { data } = await fetchAllBookings();
          if (data) setBookings(data);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const bookedDates = useMemo(
    () => bookings.map((b) => parseISO(b.booking_date)),
    [bookings],
  );

  const selectedDateBookings = useMemo(() => {
    if (!selectedDate) return [];
    return bookings.filter((b) => isSameDay(parseISO(b.booking_date), selectedDate));
  }, [bookings, selectedDate]);

  const selectedDateGroups = useMemo(
    () => groupBookingsByCustomer(selectedDateBookings),
    [selectedDateBookings],
  );

  const allCustomerGroups = useMemo(() => groupBookingsByCustomer(bookings), [bookings]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <section className="py-16 bg-background pt-32">
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

      <section className="gradient-hero py-16 pt-32">
        <div className="container flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-5xl font-bold font-serif text-primary-foreground mb-2">Booking Calendar</h1>
            <p className="text-xl text-primary-foreground/90">Select a date to view appointments</p>
          </div>
          <Button onClick={handleSignOut} variant="outline" className="self-center sm:self-auto">
            Sign Out
          </Button>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container max-w-7xl space-y-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
            <Card className="shadow-gold">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Schedule</CardTitle>
                <CardDescription>
                  {bookings.length === 0
                    ? "No bookings yet — dates will highlight when appointments are added."
                    : "Bold dates have bookings. Click a date for details."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-8">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{ booked: bookedDates }}
                  modifiersClassNames={{
                    booked: "font-bold text-primary relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-primary",
                  }}
                  className={cn("rounded-lg border bg-card p-6 md:p-8 w-full max-w-2xl pointer-events-auto")}
                  classNames={ADMIN_CALENDAR_CLASS_NAMES}
                />
              </CardContent>
            </Card>

            <div className="space-y-4 min-h-[320px]">
              {selectedDate ? (
                <>
                  <div>
                    <h2 className="text-2xl font-serif font-semibold">
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {selectedDateBookings.length === 0
                        ? "No appointments on this day"
                        : `${selectedDateBookings.length} appointment${selectedDateBookings.length === 1 ? "" : "s"} · ${selectedDateGroups.length} customer${selectedDateGroups.length === 1 ? "" : "s"}`}
                    </p>
                  </div>

                  {selectedDateGroups.length > 0 ? (
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                      {selectedDateGroups.map((group) => (
                        <CustomerGroupCard key={group.key} group={group} />
                      ))}
                    </div>
                  ) : (
                    <Card className="shadow-gold">
                      <CardContent className="py-16 text-center text-muted-foreground">
                        No bookings for this date.
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="shadow-gold h-full flex items-center justify-center">
                  <CardContent className="py-16 text-center text-muted-foreground">
                    Select a date on the calendar to view bookings.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Card className="shadow-gold">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">All Customers</CardTitle>
              <CardDescription>
                Grouped by email ({allCustomerGroups.length} unique customer
                {allCustomerGroups.length === 1 ? "" : "s"})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allCustomerGroups.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No customers yet.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {allCustomerGroups.map((group) => (
                    <CustomerGroupCard key={group.key} group={group} showDate />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default BookingAdmin;
