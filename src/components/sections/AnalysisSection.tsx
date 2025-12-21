import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, X, FileText, Ruler, Camera, TrendingUp } from "lucide-react";

const mockAnalysis = {
  verification: {
    status: "verified",
    ownerName: "Match Confirmed",
    address: "Verified",
    documents: "Authentic",
  },
  area: {
    estimated: "1,247 sq ft",
    claimed: "1,200 sq ft",
    accuracy: "96.1%",
    method: "3D Reconstruction",
  },
  quality: {
    overallScore: 87,
    defects: [
      { name: "Minor wall crack", severity: "low", confidence: 0.92 },
      { name: "Paint fading", severity: "low", confidence: 0.88 },
    ],
    amenities: [
      { name: "Hardwood flooring", confidence: 0.95 },
      { name: "Granite countertops", confidence: 0.91 },
      { name: "Modern fixtures", confidence: 0.89 },
    ],
  },
  predictions: {
    estimatedValue: "₹85.2L",
    pricePerSqFt: "₹6,832",
    lifespan: "40+ years",
    riskScore: "Low",
  },
};

const AnalysisSection = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "area", label: "Area", icon: Ruler },
    { id: "quality", label: "Quality", icon: Camera },
    { id: "predictions", label: "Predictions", icon: TrendingUp },
  ];

  return (
    <section id="analysis" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Demo</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-4 mb-6">
            See VisionEstate in Action
          </h2>
          <p className="text-lg text-muted-foreground">
            Explore a sample property analysis showing our AI verification, area estimation, quality detection, and predictive insights.
          </p>
        </div>

        {/* Analysis Dashboard */}
        <div className="max-w-5xl mx-auto">
          <div className="glass-card overflow-hidden glow-border">
            {/* Tabs */}
            <div className="flex border-b border-border/50 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-8">
              {activeTab === "overview" && (
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Verification Status */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      Document Verification
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(mockAnalysis.verification).map(([key, value]) => (
                        key !== "status" && (
                          <div key={key} className="flex items-center justify-between py-2 border-b border-border/30">
                            <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-foreground font-medium flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              {value}
                            </span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 rounded-xl p-4 text-center">
                      <div className="text-2xl font-display font-bold text-foreground">{mockAnalysis.area.estimated}</div>
                      <div className="text-sm text-muted-foreground mt-1">Verified Area</div>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-4 text-center">
                      <div className="text-2xl font-display font-bold text-foreground">{mockAnalysis.quality.overallScore}</div>
                      <div className="text-sm text-muted-foreground mt-1">Quality Score</div>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-4 text-center">
                      <div className="text-2xl font-display font-bold text-primary">{mockAnalysis.predictions.estimatedValue}</div>
                      <div className="text-sm text-muted-foreground mt-1">Est. Value</div>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-4 text-center">
                      <div className="text-2xl font-display font-bold text-green-500">{mockAnalysis.predictions.riskScore}</div>
                      <div className="text-sm text-muted-foreground mt-1">Risk Level</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "area" && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-muted/30 rounded-xl p-6 text-center">
                      <Ruler className="w-8 h-8 text-primary mx-auto mb-3" />
                      <div className="text-3xl font-display font-bold text-foreground">{mockAnalysis.area.estimated}</div>
                      <div className="text-sm text-muted-foreground mt-1">AI Estimated</div>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-6 text-center">
                      <div className="text-3xl font-display font-bold text-muted-foreground">{mockAnalysis.area.claimed}</div>
                      <div className="text-sm text-muted-foreground mt-1">Seller Claimed</div>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-6 text-center">
                      <div className="text-3xl font-display font-bold text-green-500">{mockAnalysis.area.accuracy}</div>
                      <div className="text-sm text-muted-foreground mt-1">Accuracy</div>
                    </div>
                  </div>
                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      <span className="text-primary font-medium">Method:</span> {mockAnalysis.area.method} using SfM + MVS pipeline. The estimated area is 3.9% larger than claimed, which is within acceptable variance.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "quality" && (
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Defects */}
                  <div>
                    <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      Detected Issues ({mockAnalysis.quality.defects.length})
                    </h3>
                    <div className="space-y-3">
                      {mockAnalysis.quality.defects.map((defect, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <div className="font-medium text-foreground">{defect.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">Severity: {defect.severity}</div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {(defect.confidence * 100).toFixed(0)}% conf
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      Detected Amenities ({mockAnalysis.quality.amenities.length})
                    </h3>
                    <div className="space-y-3">
                      {mockAnalysis.quality.amenities.map((amenity, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="font-medium text-foreground">{amenity.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {(amenity.confidence * 100).toFixed(0)}% conf
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "predictions" && (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-6 border border-primary/20">
                    <TrendingUp className="w-8 h-8 text-primary mb-3" />
                    <div className="text-3xl font-display font-bold text-foreground">{mockAnalysis.predictions.estimatedValue}</div>
                    <div className="text-sm text-muted-foreground mt-1">Estimated Value</div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-6">
                    <div className="text-3xl font-display font-bold text-foreground">{mockAnalysis.predictions.pricePerSqFt}</div>
                    <div className="text-sm text-muted-foreground mt-1">Price per sq ft</div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-6">
                    <div className="text-3xl font-display font-bold text-foreground">{mockAnalysis.predictions.lifespan}</div>
                    <div className="text-sm text-muted-foreground mt-1">Est. Lifespan</div>
                  </div>
                  <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/20">
                    <div className="text-3xl font-display font-bold text-green-500">{mockAnalysis.predictions.riskScore}</div>
                    <div className="text-sm text-muted-foreground mt-1">Risk Assessment</div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-border/50 bg-muted/10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  This is a demo analysis. Upload your property data for real results.
                </p>
                <Button variant="hero">
                  Try With Your Property
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalysisSection;
