import { useState, useEffect, useMemo } from "react";
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
import { CalendarIcon, ImagePlus, X } from "lucide-react";
import { format } from "date-fns";
import {
  ALLOWED_TIME_SLOTS,
  formatTimeSlotLabel,
  getUnavailableTimeSlots,
  isTimeSlotUnavailable,
  type ExistingBooking,
} from "@/lib/bookingAvailability";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import {
  BOOKING_PACKAGE_IDS,
  formatBookingPackageForDb,
  formatBookingPrice,
  getBookingPrice,
  getMassageBookingPackage,
  massagePackageAllowsDuration,
  MASSAGE_BOOKING_PACKAGES,
  type MassageBookingPackageId,
} from "@/constants/massageBooking";
import { getCalendarBlockedSlots } from "@/services/calendarService";

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
const RECEIPT_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

type ReceiptFile = {
  file: File;
  previewUrl: string;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

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
  const [existingBookings, setExistingBookings] = useState<ExistingBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptFile | null>(null);
  const [isReceiptDragOver, setIsReceiptDragOver] = useState(false);
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

  const selectedDurationMinutes = formData.durationMinutes
    ? Number(formData.durationMinutes)
    : null;

  const unavailableTimeSlots = useMemo(
    () => getUnavailableTimeSlots(existingBookings, selectedDurationMinutes),
    [existingBookings, selectedDurationMinutes],
  );

  // Fetch existing bookings and calendar events when date changes
  useEffect(() => {
    if (date) {
      fetchExistingBookingsAndCalendarEvents(date);
    } else {
      setExistingBookings([]);
    }
  }, [date]);

  // Clear time if it becomes unavailable (e.g. duration or date changed)
  useEffect(() => {
    if (
      formData.time &&
      isTimeSlotUnavailable(formData.time, selectedDurationMinutes, existingBookings)
    ) {
      setFormData((prev) => ({ ...prev, time: "" }));
    }
  }, [formData.time, selectedDurationMinutes, existingBookings]);

  const fetchExistingBookingsAndCalendarEvents = async (selectedDate: Date) => {
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      
      // Fetch database bookings
      const { data: dbBookings, error } = await supabase.rpc("get_booking_availability", {
        p_booking_date: formattedDate,
      });

      if (error) throw error;

      // Fetch calendar-blocked slots
      const calendarBlockedSlots = await getCalendarBlockedSlots(formattedDate);

      // Combine calendar events and database bookings
      const allBookings = [...(dbBookings ?? []), ...calendarBlockedSlots];
      setExistingBookings(allBookings);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load availability. Please try again.");
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

    if (
      isTimeSlotUnavailable(
        validation.data.time,
        Number(validation.data.durationMinutes),
        existingBookings,
      )
    ) {
      toast.error("This time slot is no longer available. Please choose another time.");
      if (date) await fetchExistingBookingsAndCalendarEvents(date);
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
          await fetchExistingBookingsAndCalendarEvents(date);
        } else {
          toast.error("Failed to create booking. Please try again.");
        }
        return;
      }

      toast.success("Booking confirmed! We'll contact you soon.");

      if (insertedBooking) {
        let receiptPayload: {
          receipt_base64?: string;
          receipt_filename?: string;
          receipt_content_type?: string;
        } = {};

        if (receipt) {
          try {
            receiptPayload = {
              receipt_base64: await fileToBase64(receipt.file),
              receipt_filename: receipt.file.name,
              receipt_content_type: receipt.file.type || "image/jpeg",
            };
          } catch {
            toast.error("Booking saved, but the receipt could not be read for email.");
          }
        }

        const priceLabel =
          selectedPackagePrice !== null ? formatBookingPrice(selectedPackagePrice) : undefined;

        // Fire-and-forget email; do not block the booking confirmation.
        void fetch("/api/send-booking-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(insertedBooking as BookingRow),
            package_price: priceLabel,
            ...receiptPayload,
          }),
        }).catch(() => {
          toast.error("Booking saved, but we couldn't send the notification or add it to the calendar.");
        });
      }

      // Reset form
      setFormData({ name: "", email: "", package: "", durationMinutes: "", time: "", notes: "" });
      setReceiptFile(null);
      setDate(undefined);
      setExistingBookings([]);
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

  const selectedPackagePrice = useMemo(() => {
    if (!formData.package || !formData.durationMinutes) return null;
    return getBookingPrice(
      formData.package as MassageBookingPackageId,
      Number(formData.durationMinutes),
    );
  }, [formData.package, formData.durationMinutes]);

  const setReceiptFile = (file: File | null) => {
    setReceipt((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      if (!file) return null;
      return { file, previewUrl: URL.createObjectURL(file) };
    });
  };

  const handleReceiptSelect = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, or WebP).");
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      toast.error("Receipt image must be 5 MB or smaller.");
      return;
    }
    setReceiptFile(file);
  };

  useEffect(() => {
    return () => {
      if (receipt) URL.revokeObjectURL(receipt.previewUrl);
    };
  }, [receipt]);

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
                      {durationOptions.map((mins) => {
                        const price = formData.package
                          ? getBookingPrice(formData.package as MassageBookingPackageId, mins)
                          : null;
                        return (
                          <SelectItem key={mins} value={String(mins)}>
                            {mins} minutes{price !== null ? ` — ${formatBookingPrice(price)}` : ""}
                          </SelectItem>
                        );
                      })}
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
                  <Select
                    value={formData.time}
                    onValueChange={(value) => handleChange("time", value)}
                    disabled={!date}
                  >
                    <SelectTrigger id="time">
                      <SelectValue
                        placeholder={date ? "Choose a time slot" : "Select a date first"}
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50 max-h-[min(60vh,24rem)]">
                      {ALLOWED_TIME_SLOTS.map((slot) => {
                        const unavailable = unavailableTimeSlots.has(slot);
                        return (
                          <SelectItem key={slot} value={slot} disabled={unavailable}>
                            {formatTimeSlotLabel(slot)} {unavailable && "(Booked)"}
                          </SelectItem>
                        );
                      })}
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

                {formData.package && formData.durationMinutes && (
                  <div className="rounded-lg border bg-muted/40 p-4 space-y-1">
                    <p className="text-sm text-muted-foreground">Package total</p>
                    <p className="text-lg font-semibold">
                      {getMassageBookingPackage(formData.package)?.label} · {formData.durationMinutes}{" "}
                      minutes
                    </p>
                    <p className="text-2xl font-bold text-accent">
                      {selectedPackagePrice !== null
                        ? formatBookingPrice(selectedPackagePrice)
                        : "—"}
                    </p>
                  </div>
                )}

                <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-2">
                  <p className="text-sm font-medium">Bank transfer (ASB)</p>
                  <p className="text-base leading-relaxed">
                    ASB Account no. <span className="font-semibold">12-3680-0050311-00</span>
                    <br />
                    Geena Thai Massage
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please pay the amount above, then upload your online payment receipt below.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt">Payment receipt (optional)</Label>
                  <div
                    className={cn(
                      "relative rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                      isReceiptDragOver ? "border-accent bg-accent/10" : "border-border bg-muted/20",
                    )}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsReceiptDragOver(true);
                    }}
                    onDragLeave={() => setIsReceiptDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsReceiptDragOver(false);
                      handleReceiptSelect(e.dataTransfer.files);
                    }}
                  >
                    <input
                      id="receipt"
                      type="file"
                      accept={RECEIPT_ACCEPT}
                      className="sr-only"
                      onChange={(e) => {
                        handleReceiptSelect(e.target.files);
                        e.target.value = "";
                      }}
                    />
                    {receipt ? (
                      <div className="space-y-3">
                        <img
                          src={receipt.previewUrl}
                          alt="Payment receipt preview"
                          className="mx-auto max-h-48 rounded-md object-contain"
                        />
                        <p className="text-sm text-muted-foreground truncate">{receipt.file.name}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setReceiptFile(null)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Remove receipt
                        </Button>
                      </div>
                    ) : (
                      <label htmlFor="receipt" className="cursor-pointer block space-y-2">
                        <ImagePlus className="mx-auto h-10 w-10 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          Drop your receipt here, or click to choose a file
                        </p>
                        <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP · max 5 MB</p>
                      </label>
                    )}
                  </div>
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
