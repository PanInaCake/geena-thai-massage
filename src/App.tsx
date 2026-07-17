import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useRef } from "react";
import ClosureNotice, { shouldShowClosureNotice } from "./components/ClosureNotice";
import Index from "./pages/Index";
import Packages from "./pages/Packages";
import Therapists from "./pages/Therapists";
import Booking from "./pages/Booking";
import ProtectedRoute from "./ProtectedRoute";
import BookingAdmin from "./pages/BookingAdmin";
import AdminLogin from "./pages/AdminLogin";
import Auth from "./pages/Auth";
import MyBookings from "./pages/MyBookings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const SiteHeader = () => {
  const noticeRef = useRef<HTMLDivElement>(null);
  const showNotice = shouldShowClosureNotice();

  useEffect(() => {
    if (!showNotice) {
      document.documentElement.style.setProperty("--closure-notice-height", "0px");
      return;
    }

    const element = noticeRef.current;
    if (!element) return;

    const updateHeight = () => {
      document.documentElement.style.setProperty("--closure-notice-height", `${element.offsetHeight}px`);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => {
      observer.disconnect();
      document.documentElement.style.setProperty("--closure-notice-height", "0px");
    };
  }, [showNotice]);

  if (!showNotice) {
    return null;
  }

  return (
    <>
      <div ref={noticeRef} className="fixed top-0 left-0 right-0 z-[60]">
        <ClosureNotice />
      </div>
      <div aria-hidden className="h-[var(--closure-notice-height,0px)]" />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SiteHeader />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/therapists" element={<Therapists />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <BookingAdmin />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
