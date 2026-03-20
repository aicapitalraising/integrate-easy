import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import StatsSection from '@/components/landing/StatsSection';
import LogoTicker from '@/components/landing/LogoTicker';
import WhoWeWorkWith from '@/components/landing/WhoWeWorkWith';
import ComparisonSection from '@/components/landing/ComparisonSection';
import TransactionsSection from '@/components/landing/TransactionsSection';
import ServicesSection from '@/components/landing/ServicesSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import AboutSection from '@/components/landing/AboutSection';
import ContactSection from '@/components/landing/ContactSection';
import Footer from '@/components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <LogoTicker />
      <WhoWeWorkWith />
      <ComparisonSection />
      <ServicesSection />
      <TransactionsSection />
      <TestimonialsSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
