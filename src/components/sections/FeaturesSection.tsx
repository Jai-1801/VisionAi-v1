import { FileCheck, Scan, CuboidIcon, Brain, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: FileCheck,
    title: "Document Verification",
    description: "ML-assisted OCR and NER extract and cross-validate ownership documents, detecting fraud and ensuring legal compliance automatically.",
    color: "primary",
  },
  {
    icon: CuboidIcon,
    title: "3D Area Estimation",
    description: "Structure-from-Motion and Multi-View Stereo create 3D models from photos to calculate precise floor area—no manual measurement needed.",
    color: "accent",
  },
  {
    icon: Scan,
    title: "Quality Detection",
    description: "YOLO and Faster R-CNN identify defects like cracks and water damage, outputting structured data with confidence scores for each issue.",
    color: "primary",
  },
  {
    icon: Brain,
    title: "Predictive Analytics",
    description: "Multimodal neural networks fuse image, tabular, and geolocation data to predict property value, lifespan, and risk scores accurately.",
    color: "accent",
  },
  {
    icon: Shield,
    title: "Anti-Spoofing Protocol",
    description: "EXIF metadata verification ensures images are authentic—GPS coordinates and timestamps are cross-referenced with the property's registered address.",
    color: "primary",
  },
  {
    icon: Zap,
    title: "Real-time Processing",
    description: "Microservice architecture enables independent scaling of ML services, delivering fast results without bottlenecks.",
    color: "accent",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Core Capabilities</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-4 mb-6">
            A Multimodal AI Verification Engine
          </h2>
          <p className="text-lg text-muted-foreground">
            Six integrated AI modules work together to transform unverified listings into trusted, data-driven property insights.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group glass-card p-8 hover:bg-card/80 transition-all duration-300 glow-border"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 ${
                feature.color === "primary" 
                  ? "bg-primary/10 text-primary" 
                  : "bg-accent/10 text-accent"
              }`}>
                <feature.icon className="w-7 h-7" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
