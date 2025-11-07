import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Validation schema
const ALLOWED_PACKAGES = ["swedish", "hotstone", "aromatherapy"] as const;
const ALLOWED_TIME_SLOTS = ["9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm"] as const;

const bookingSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  package: z.enum(ALLOWED_PACKAGES, {
    errorMap: () => ({ message: "Please select a valid package" })
  }),
  time: z.enum(ALLOWED_TIME_SLOTS, {
    errorMap: () => ({ message: "Please select a valid time slot" })
  }),
});

const Booking = () => {
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    package: "",
    time: "",
  });
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please log in to make a booking");
      navigate("/auth");
      return;
    }
    
    setUserId(user.id);
  };

  // Fetch existing bookings when date changes
  useEffect(() => {
    if (date) {
      fetchBookedSlots(date);
    }
  }, [date]);

  const fetchBookedSlots = async (selectedDate: Date) => {
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("bookings")
        .select("booking_time")
        .eq("booking_date", formattedDate);

      if (error) throw error;

      const slots = new Set(data?.map(booking => booking.booking_time) || []);
      setBookedSlots(slots);
    } catch (error) {
      // Silently fail - user can try selecting date again
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    // Validate all inputs
    const validation = bookingSchema.safeParse(formData);
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setLoading(true);

    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const validatedData = validation.data;

      // Insert booking into database with validated data
      const { error } = await supabase
        .from("bookings")
        .insert({
          user_id: userId,
          name: validatedData.name,
          email: validatedData.email,
          package: validatedData.package,
          booking_date: formattedDate,
          booking_time: validatedData.time,
        });

      if (error) {
        // Check if error is due to unique constraint violation (double booking)
        if (error.code === "23505") {
          toast.error("This time slot is no longer available. Please choose another time.");
          // Refresh the booked slots
          await fetchBookedSlots(date);
        } else {
          toast.error("Failed to create booking. Please try again.");
        }
        return;
      }

      toast.success("Booking confirmed! We'll contact you soon.");
      
      // Reset form
      setFormData({ name: "", email: "", package: "", time: "" });
      setDate(undefined);
      setBookedSlots(new Set());
    } catch (error) {
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="gradient-hero py-16 text-center">
        <div className="container">
          <h1 className="text-5xl font-bold font-serif text-primary-foreground mb-4 animate-fade-in">
            Book Your Session
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Take the first step towards complete relaxation and wellness.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container max-w-2xl">
          <Card className="shadow-gold animate-scale-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle className="text-3xl font-serif">Reservation Details</CardTitle>
              <CardDescription className="text-base">
                Fill out the form below to schedule your massage appointment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="transition-smooth focus:scale-[1.01]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="transition-smooth focus:scale-[1.01]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package">Select Package</Label>
                  <Select value={formData.package} onValueChange={(value) => handleChange("package", value)}>
                    <SelectTrigger id="package">
                      <SelectValue placeholder="Choose a massage package" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="swedish">Swedish Relaxation - $95</SelectItem>
                      <SelectItem value="hotstone">Hot Stone Therapy - $145</SelectItem>
                      <SelectItem value="aromatherapy">Aromatherapy Bliss - $120</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Preferred Time</Label>
                  <Select value={formData.time} onValueChange={(value) => handleChange("time", value)}>
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Choose a time slot" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="9am" disabled={bookedSlots.has("9am")}>
                        9:00 AM {bookedSlots.has("9am") && "(Booked)"}
                      </SelectItem>
                      <SelectItem value="10am" disabled={bookedSlots.has("10am")}>
                        10:00 AM {bookedSlots.has("10am") && "(Booked)"}
                      </SelectItem>
                      <SelectItem value="11am" disabled={bookedSlots.has("11am")}>
                        11:00 AM {bookedSlots.has("11am") && "(Booked)"}
                      </SelectItem>
                      <SelectItem value="12pm" disabled={bookedSlots.has("12pm")}>
                        12:00 PM {bookedSlots.has("12pm") && "(Booked)"}
                      </SelectItem>
                      <SelectItem value="1pm" disabled={bookedSlots.has("1pm")}>
                        1:00 PM {bookedSlots.has("1pm") && "(Booked)"}
                      </SelectItem>
                      <SelectItem value="2pm" disabled={bookedSlots.has("2pm")}>
                        2:00 PM {bookedSlots.has("2pm") && "(Booked)"}
                      </SelectItem>
                      <SelectItem value="3pm" disabled={bookedSlots.has("3pm")}>
                        3:00 PM {bookedSlots.has("3pm") && "(Booked)"}
                      </SelectItem>
                      <SelectItem value="4pm" disabled={bookedSlots.has("4pm")}>
                        4:00 PM {bookedSlots.has("4pm") && "(Booked)"}
                      </SelectItem>
                      <SelectItem value="5pm" disabled={bookedSlots.has("5pm")}>
                        5:00 PM {bookedSlots.has("5pm") && "(Booked)"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  variant="accent" 
                  size="lg" 
                  className="w-full transition-elegant hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Confirm Booking"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Booking;
