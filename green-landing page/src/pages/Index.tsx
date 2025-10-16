import { HeroSection } from "@/components/HeroSection";
import { ProblemStatement } from "@/components/ProblemStatement";
import { HowItWorks } from "@/components/HowItWorks";
import { Features } from "@/components/Features";
import { AboutSection } from "@/components/AboutSection";
import { FAQSection } from "@/components/FAQSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-dm-sans overflow-x-hidden">
      {/* Hero Section */}
      <section id="home">
        <HeroSection />
      </section>
      
      {/* Problem Statement */}
      <ProblemStatement />
      
      {/* How It Works */}
      <section id="how-it-works">
        <HowItWorks />
      </section>
      
      {/* Features */}
      <section id="features">
        <Features />
      </section>
      
      {/* About Us */}
      <section id="about">
        <AboutSection />
      </section>
      
      {/* Contact (FAQ & CTA) */}
      <section id="contact">
        <FAQSection />
        <CTASection />
      </section>
      
      {/* Features */}
      <Features />
      
      {/* About Section */}
      <AboutSection />
      
      {/* FAQ Section */}
      <FAQSection />
      
      {/* CTA Section */}
      <CTASection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;