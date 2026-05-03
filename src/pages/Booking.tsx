import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import {
  BOOKING_PACKAGE_IDS,
  formatBookingPackageForDb,
  getMassageBookingPackage,
  massagePackageAllowsDuration,
  MASSAGE_BOOKING_PACKAGES,
  type MassageBookingPackageId,
} from "@/constants/massageBooking";

const ALLOWED_TIME_SLOTS = ["9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm"] as const;
const DURATION_SELECT_VALUES = ["30", "45", "60", "90", "120"] as const;

const bookingSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters")
      .regex(/^[a-zA-Z\s\-']+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
    email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
    package: z.enum(BOOKING_PACKAGE_IDS, {
      errorMap: () => ({ message: "Please select a service" }),
    }),
    durationMinutes: z.enum(DURATION_SELECT_VALUES, {
      errorMap: () => ({ message: "Please select a duration" }),
    }),
    time: z.enum(ALLOWED_TIME_SLOTS, {
      errorMap: () => ({ message: "Please select a valid time slot" }),
    }),
  })
  .superRefine((data, ctx) => {
    const pkg = getMassageBookingPackage(data.package);
    if (!pkg) return;
    const minutes = Number(data.durationMinutes);
    if (!massagePackageAllowsDuration(pkg, minutes)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "This duration is not available for the selected service.",
        path: ["durationMinutes"],
      });
    }
  });

type BookingRow = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  package: string;
  booking_date: string; // yyyy-MM-dd
  booking_time: string;
  created_at: string;
  notes: string | null;
};

const Booking = () => {
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    package: "",
    durationMinutes: "",
    time: "",
    notes: "",
  });
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please log in to make a booking");
        navigate("/auth");
        return;
      }

      setUserId(user.id);
    } finally {
      setAuthLoading(false);
    }
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
      const { data, error } = await supabase.from("bookings").select("booking_time").eq("booking_date", formattedDate);

      if (error) throw error;

      const slots = new Set(data?.map((booking) => booking.booking_time) || []);
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
      const packageSummary = formatBookingPackageForDb(
        validatedData.package as MassageBookingPackageId,
        Number(validatedData.durationMinutes),
      );

      const { data: insertedBooking, error } = await supabase
        .from("bookings")
        .insert({
          user_id: userId,
          name: validatedData.name,
          email: validatedData.email,
          package: packageSummary,
          booking_date: formattedDate,
          booking_time: validatedData.time,
          notes: formData.notes || null,
        })
        .select("*")
        .single();

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

      if (insertedBooking) {
        // Fire-and-forget email; do not block the booking confirmation.
        void fetch("/api/send-booking-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(insertedBooking as BookingRow),
        }).catch(() => {
          toast.error("Booking saved, but we couldn't send the notification email.");
        });
      }

      // Reset form
      setFormData({ name: "", email: "", package: "", durationMinutes: "", time: "", notes: "" });
      setDate(undefined);
      setBookedSlots(new Set());
    } catch (error) {
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePackageChange = (packageId: string) => {
    setFormData((prev) => {
      const def = getMassageBookingPackage(packageId);
      if (!def) return { ...prev, package: packageId, durationMinutes: "" };
      const prevMins = prev.durationMinutes ? Number(prev.durationMinutes) : NaN;
      const keepDuration = massagePackageAllowsDuration(def, prevMins);
      const nextDuration =
        def.durations.length === 1
          ? String(def.durations[0])
          : keepDuration
            ? prev.durationMinutes
            : "";
      return { ...prev, package: packageId, durationMinutes: nextDuration };
    });
  };

  const durationOptions = formData.package
    ? getMassageBookingPackage(formData.package)?.durations ?? []
    : [];

  const timeSlotLabel: Record<(typeof ALLOWED_TIME_SLOTS)[number], string> = {
    "9am": "9:00 AM",
    "10am": "10:00 AM",
    "11am": "11:00 AM",
    "12pm": "12:00 PM",
    "1pm": "1:00 PM",
    "2pm": "2:00 PM",
    "3pm": "3:00 PM",
    "4pm": "4:00 PM",
    "5pm": "5:00 PM",
  };

  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <section className="gradient-hero py-16 pt-32 text-center">
          <div className="container">
            <h1 className="text-5xl font-bold font-serif text-primary-foreground mb-4">Book Your Session</h1>
          </div>
        </section>
        <section className="py-16 bg-background">
          <div className="container max-w-2xl flex items-center justify-center">
            <p className="text-lg text-muted-foreground">Verifying authentication...</p>
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
            Book Your Session
          </h1>
          <p
            className="text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
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
                  <Label htmlFor="package">Select service</Label>
                  <Select value={formData.package} onValueChange={handlePackageChange}>
                    <SelectTrigger id="package">
                      <SelectValue placeholder="Choose a massage service" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50 max-h-[min(60vh,24rem)]">
                      {MASSAGE_BOOKING_PACKAGES.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select
                    value={formData.durationMinutes}
                    onValueChange={(value) => handleChange("durationMinutes", value)}
                    disabled={!formData.package}
                  >
                    <SelectTrigger id="duration">
                      <SelectValue
                        placeholder={formData.package ? "Choose duration" : "Select a service first"}
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {durationOptions.map((mins) => (
                        <SelectItem key={mins} value={String(mins)}>
                          {mins} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
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
                      {ALLOWED_TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot} disabled={bookedSlots.has(slot)}>
                          {timeSlotLabel[slot]} {bookedSlots.has(slot) && "(Booked)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or preferences e.g. Back pain, Shoulder pain"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    className="transition-smooth focus:scale-[1.01] min-h-[100px]"
                  />
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
