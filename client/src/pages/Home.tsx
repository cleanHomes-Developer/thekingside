/* ============================================================
   CLEANHOMES.PL — Home Page
   Design: Bold Brutalist Warmth | All sections assembled
   ============================================================ */
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import AboutSection from "@/components/AboutSection";
import GallerySection from "@/components/GallerySection";
import FloatingCTA from "@/components/FloatingCTA";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FEFBF3" }}>
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <GallerySection />
      <AboutSection />
      <ContactSection />
      <Footer />
      <FloatingCTA />
    </div>
  );
}
