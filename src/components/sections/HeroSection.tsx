import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Scan, Brain } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      
      {/* Floating Elements */}
      <div className="absolute top-1/3 left-[10%] animate-float" style={{ animationDelay: "0s" }}>
        <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center">
          <Shield className="w-8 h-8 text-primary" />
        </div>
      </div>
      <div className="absolute top-1/2 right-[10%] animate-float" style={{ animationDelay: "1s" }}>
        <div className="w-14 h-14 rounded-xl glass-card flex items-center justify-center">
          <Scan className="w-7 h-7 text-accent" />
        </div>
      </div>
      <div className="absolute bottom-1/3 left-[15%] animate-float" style={{ animationDelay: "2s" }}>
        <div className="w-12 h-12 rounded-lg glass-card flex items-center justify-center">
          <Brain className="w-6 h-6 text-primary" />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">AI-Powered Real Estate Intelligence</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6 animate-slide-up">
            <span className="text-foreground">Eliminate the</span>
            <br />
            <span className="gradient-text">"Trust Gap"</span>
            <br />
            <span className="text-foreground">in Real Estate</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            VisionEstate uses deep learning and computer vision to automatically verify property ownership, estimate accurate floor areas, and detect hidden defects—replacing manual inspections with trusted, AI-driven insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <Button variant="hero" size="xl" className="w-full sm:w-auto">
              Analyze Property
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
              View Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-border/50 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-display font-bold text-foreground">96.5%</div>
              <div className="text-sm text-muted-foreground mt-1">Detection Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-display font-bold text-foreground">60%</div>
              <div className="text-sm text-muted-foreground mt-1">Faster Inspections</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-display font-bold text-foreground">100%</div>
              <div className="text-sm text-muted-foreground mt-1">Objective Analysis</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
