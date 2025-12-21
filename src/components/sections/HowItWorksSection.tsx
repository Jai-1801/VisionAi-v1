import { Upload, Cpu, FileText, LineChart } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Data",
    description: "Submit property images, documents, and basic information through our secure interface.",
  },
  {
    icon: Cpu,
    title: "AI Processing",
    description: "Our multimodal AI processes data through verification, reconstruction, and analysis modules.",
  },
  {
    icon: FileText,
    title: "Verification",
    description: "Cross-validate ownership, calculate floor area, and detect defects automatically.",
  },
  {
    icon: LineChart,
    title: "Get Insights",
    description: "Receive comprehensive reports with value predictions and risk assessments.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Process</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-5">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground">
            From upload to insight in four simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 stagger-children">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="bg-card p-8 rounded-2xl border border-border hover-lift h-full">
                  {/* Step Number */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <step.icon className="w-5 h-5 text-muted-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
