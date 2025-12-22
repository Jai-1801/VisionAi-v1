import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const highlights = [
    "Document Verification",
    "3D Area Estimation", 
    "Quality Detection",
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-dot-pattern opacity-40" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-8 animate-fade-in-up">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
            <span className="text-sm text-muted-foreground font-medium">AI-Powered Property Intelligence</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <span className="text-foreground">Verify properties</span>
            <br />
            <span className="gradient-text">with AI precision</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
            VisionEstate uses deep learning to verify ownership, estimate floor areas, and detect hidden defects—replacing manual inspections with trusted insights.
          </p>

          {/* Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                {item}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
           <Link to="/analysis">
  <Button size="lg" className="rounded-full px-8">
    Analyze Property
  </Button>
</Link>
            <Button variant="heroOutline" size="xl">
              View Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 pt-10 border-t border-border stagger-children">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-display font-bold text-foreground">96.5%</div>
              <div className="text-sm text-muted-foreground mt-1">Detection Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-display font-bold text-foreground">60%</div>
              <div className="text-sm text-muted-foreground mt-1">Faster Analysis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-display font-bold text-foreground">100%</div>
              <div className="text-sm text-muted-foreground mt-1">Objective Results</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
