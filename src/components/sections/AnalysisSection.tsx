import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle, FileText, Ruler, Camera, TrendingUp } from "lucide-react";

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
      <div className="absolute inset-0 bg-secondary/30" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Demo</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-5">
            See it in action
          </h2>
          <p className="text-lg text-muted-foreground">
            Explore a sample property analysis showing our AI capabilities.
          </p>
        </div>

        {/* Analysis Dashboard */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden animate-scale-in">
            {/* Tabs */}
            <div className="flex border-b border-border overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
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
                <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
                  {/* Verification Status */}
                  <div className="space-y-4">
                    <h3 className="text-base font-display font-semibold text-foreground flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      Document Verification
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(mockAnalysis.verification).map(([key, value]) => (
                        key !== "status" && (
                          <div key={key} className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-muted-foreground text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-foreground text-sm font-medium flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-600" />
                              {value}
                            </span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary/50 rounded-xl p-4 text-center">
                      <div className="text-xl font-display font-bold text-foreground">{mockAnalysis.area.estimated}</div>
                      <div className="text-xs text-muted-foreground mt-1">Verified Area</div>
                    </div>
                    <div className="bg-secondary/50 rounded-xl p-4 text-center">
                      <div className="text-xl font-display font-bold text-foreground">{mockAnalysis.quality.overallScore}</div>
                      <div className="text-xs text-muted-foreground mt-1">Quality Score</div>
                    </div>
                    <div className="bg-primary/5 rounded-xl p-4 text-center border border-primary/10">
                      <div className="text-xl font-display font-bold text-primary">{mockAnalysis.predictions.estimatedValue}</div>
                      <div className="text-xs text-muted-foreground mt-1">Est. Value</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                      <div className="text-xl font-display font-bold text-green-600">{mockAnalysis.predictions.riskScore}</div>
                      <div className="text-xs text-muted-foreground mt-1">Risk Level</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "area" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-secondary/50 rounded-xl p-6 text-center">
                      <Ruler className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-display font-bold text-foreground">{mockAnalysis.area.estimated}</div>
                      <div className="text-xs text-muted-foreground mt-1">AI Estimated</div>
                    </div>
                    <div className="bg-secondary/50 rounded-xl p-6 text-center">
                      <div className="text-2xl font-display font-bold text-muted-foreground">{mockAnalysis.area.claimed}</div>
                      <div className="text-xs text-muted-foreground mt-1">Seller Claimed</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-6 text-center border border-green-100">
                      <div className="text-2xl font-display font-bold text-green-600">{mockAnalysis.area.accuracy}</div>
                      <div className="text-xs text-muted-foreground mt-1">Accuracy</div>
                    </div>
                  </div>
                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                    <p className="text-sm text-muted-foreground">
                      <span className="text-primary font-medium">Method:</span> {mockAnalysis.area.method}. The estimated area is 3.9% larger than claimed.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "quality" && (
                <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
                  {/* Defects */}
                  <div>
                    <h3 className="text-base font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      Issues ({mockAnalysis.quality.defects.length})
                    </h3>
                    <div className="space-y-2">
                      {mockAnalysis.quality.defects.map((defect, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                          <div>
                            <div className="font-medium text-foreground text-sm">{defect.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">Severity: {defect.severity}</div>
                          </div>
                          <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                            {(defect.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h3 className="text-base font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      Amenities ({mockAnalysis.quality.amenities.length})
                    </h3>
                    <div className="space-y-2">
                      {mockAnalysis.quality.amenities.map((amenity, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                          <div className="font-medium text-foreground text-sm">{amenity.name}</div>
                          <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                            {(amenity.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "predictions" && (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                  <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                    <TrendingUp className="w-5 h-5 text-primary mb-2" />
                    <div className="text-2xl font-display font-bold text-foreground">{mockAnalysis.predictions.estimatedValue}</div>
                    <div className="text-xs text-muted-foreground mt-1">Estimated Value</div>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-5">
                    <div className="text-2xl font-display font-bold text-foreground">{mockAnalysis.predictions.pricePerSqFt}</div>
                    <div className="text-xs text-muted-foreground mt-1">Price per sq ft</div>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-5">
                    <div className="text-2xl font-display font-bold text-foreground">{mockAnalysis.predictions.lifespan}</div>
                    <div className="text-xs text-muted-foreground mt-1">Est. Lifespan</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                    <div className="text-2xl font-display font-bold text-green-600">{mockAnalysis.predictions.riskScore}</div>
                    <div className="text-xs text-muted-foreground mt-1">Risk Assessment</div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-border bg-secondary/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  This is a demo. Upload your property for real results.
                </p>
                <Button variant="default" size="sm">
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
