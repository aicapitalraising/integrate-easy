import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Deck from "./pages/Deck";
import Client from "./pages/Client";
import Access from "./pages/Access";
import Kickoff from "./pages/Kickoff";
import BookingPage from "./pages/BookingPage";
import Admin from "./pages/Admin";
import Fulfillment from "./pages/Fulfillment";
import Onboarding from "./pages/Onboarding";
import Start from "./pages/Start";
import Invest from "./pages/Invest";
import Portal from "./pages/Portal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/deck" element={<Deck />} />
            <Route path="/playbook" element={<Deck />} />
            <Route path="/client" element={<Client />} />
            <Route path="/access" element={<Access />} />
            <Route path="/kickoff" element={<Kickoff />} />
            <Route path="/booking-page" element={<BookingPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/fulfillment" element={<Fulfillment />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/start" element={<Start />} />
            <Route path="/invest" element={<Invest />} />
            <Route path="/portal/:token" element={<Portal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
