import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 lg:p-16 text-center glow-border">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center mb-8">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>

            {/* Content */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
              Ready to Democratize Trust in Real Estate?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Join VisionEstate and transform how you evaluate properties. Replace manual inspections with AI-powered verification and make data-driven decisions with confidence.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="heroOutline" size="xl">
                Schedule Demo
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-8 border-t border-border/50">
              <div className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">No credit card</span> required
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">5 free</span> property analyses
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Enterprise</span> ready
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
