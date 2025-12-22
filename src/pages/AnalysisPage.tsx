import { useState, useCallback, Suspense, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Upload, Loader2, Ruler, Home, ShieldCheck, 
  Box as BoxIcon, Trash2, Settings2, Zap, Search
} from "lucide-react";
import { toast } from "sonner";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, Grid, ContactShadows } from "@react-three/drei";

type Unit = 'm' | 'cm' | 'in' | 'ft';

const Room3D = ({ dims }: { dims: any }) => (
  <Canvas camera={{ position: [7, 7, 7], fov: 45 }}>
    <ambientLight intensity={0.6} />
    <pointLight position={[10, 10, 10]} />
    <Suspense fallback={null}>
      <group position={[0, dims.height / 2, 0]}>
        <Box args={[dims.width, dims.height, dims.length]}>
          <meshStandardMaterial color="#3b82f6" wireframe transparent opacity={0.6} />
        </Box>
        <Box args={[dims.width, 0.05, dims.length]} position={[0, -dims.height / 2, 0]}>
          <meshStandardMaterial color="#1e293b" />
        </Box>
      </group>
      <ContactShadows position={[0, 0, 0]} opacity={0.3} scale={20} blur={2} />
      <Grid infiniteGrid fadeDistance={40} sectionSize={1} />
    </Suspense>
    <OrbitControls makeDefault />
  </Canvas>
);

const AnalysisPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [unit, setUnit] = useState<Unit>('m');
  const [activeTab, setActiveTab] = useState<"3d" | "2d">("3d");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    toast.success(`${acceptedFiles.length} images added`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'image/*': []} });

  const handleStartAnalysis = async () => {
    if (files.length === 0) return toast.error("Upload at least one perspective");
    setIsAnalyzing(true);
    const formData = new FormData();
    files.forEach(f => formData.append("files", f));

    try {
      const response = await fetch("http://127.0.0.1:8000/reconstruct-room", { method: "POST", body: formData });
      const data = await response.json();
      
      // Store local URLs for the 2D gallery
      const fileData = files.map(f => ({
        url: URL.createObjectURL(f),
        name: f.name
      }));
      
      setResults({ ...data, filePreviews: fileData });
      toast.success("Spatial & Feature Analysis Complete");
    } catch (e) {
      toast.error("Connection Failed");
    } finally { setIsAnalyzing(false); }
  };

  const convert = (m: number) => {
    if (unit === 'cm') return m * 100;
    if (unit === 'in') return m * 39.37;
    if (unit === 'ft') return m * 3.28;
    return m;
  };

  const formattedResults = useMemo(() => {
    if (!results) return null;
    const { width, height, length, area } = results.spatial_data;
    const areaUnit = unit === 'm' ? 'm²' : `${unit}²`;
    const convArea = unit === 'm' ? area : (convert(width) * convert(length)).toFixed(2);
    
    return {
      w: `${convert(width).toFixed(2)} ${unit}`,
      h: `${convert(height).toFixed(2)} ${unit}`,
      l: `${convert(length).toFixed(2)} ${unit}`,
      area: `${convArea} ${areaUnit}`
    };
  }, [results, unit]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-grow pt-28 pb-12 container mx-auto px-4">
        
        {/* Upload Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">VisionEstate <span className="text-blue-600">Spatial Engine</span></h1>
          <div {...getRootProps()} className={`mt-10 p-12 border-2 border-dashed rounded-[2rem] transition-all cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-400'}`}>
            <input {...getInputProps()} />
            <Upload className="mx-auto mb-4 text-slate-400" size={40} />
            <p className="font-bold text-slate-700">Drag & drop room perspectives</p>
            <p className="text-xs text-slate-400 mt-2 italic text-blue-500 font-medium">Auto-detects objects, cracks, and A4 scale</p>
          </div>

          {files.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {files.map((f, i) => (
                  <div key={i} className="px-3 py-1 bg-white border rounded-full text-[10px] flex items-center gap-2">
                    {f.name} <Trash2 size={12} className="cursor-pointer text-red-400" onClick={() => setFiles(files.filter((_, idx) => idx !== i))} />
                  </div>
                ))}
              </div>
              <Button onClick={handleStartAnalysis} disabled={isAnalyzing} size="lg" className="rounded-full px-12 h-14 bg-slate-900 shadow-xl">
                {isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <Search className="mr-2" />}
                {isAnalyzing ? "Processing Vision Layers..." : `Analyze ${files.length} Images`}
              </Button>
            </div>
          )}
        </div>

        {results && (
          <div className="grid lg:grid-cols-3 gap-10 mt-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Toggle Controls */}
              <div className="flex bg-white p-1 rounded-2xl border w-fit shadow-sm">
                 <button onClick={() => setActiveTab("3d")} className={`px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${activeTab === '3d' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                    <BoxIcon size={14}/> 3D Reconstruction
                 </button>
                 <button onClick={() => setActiveTab("2d")} className={`px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${activeTab === '2d' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                    <Search size={14}/> Feature Detections
                 </button>
              </div>

              {/* View Container */}
              <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl border-8 border-white h-[600px] relative overflow-hidden">
                {activeTab === "3d" ? (
                  <Room3D dims={results.spatial_data} />
                ) : (
                  <div className="h-full w-full p-8 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {results.filePreviews.map((preview: any, idx: number) => (
                        <div key={idx} className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
                           <div className="p-3 bg-slate-700/50 flex justify-between items-center">
                              <span className="text-[10px] text-white font-mono opacity-60 uppercase tracking-widest">{preview.name}</span>
                              <div className="flex gap-2">
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-bold">Processed</span>
                              </div>
                           </div>
                           <img src={preview.url} className="w-full h-48 object-cover opacity-80 hover:opacity-100 transition-opacity" />
                           <div className="p-4 space-y-2">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Vision Findings:</p>
                              <div className="flex flex-wrap gap-2">
                                 {/* Example logic: Showing summary tags since full individual image boxes require individual API results */}
                                 {results.analysis_results.slice(0, 3).map((det: any, i: number) => (
                                   <span key={i} className={`px-2 py-1 rounded-lg text-[9px] font-bold ${det.isCrack ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                      {det.isCrack ? <Zap size={8} className="inline mr-1"/> : null}
                                      {det.label}
                                   </span>
                                 ))}
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar (Stays same) */}
            <div className="space-y-6">
              <div className={`p-4 rounded-2xl border flex items-center gap-3 ${results.is_calibrated ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                <ShieldCheck size={20} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest">{results.is_calibrated ? 'A4 Calibrated' : 'Estimated Mode'}</p>
                  <p className="text-[10px] opacity-80">{results.is_calibrated ? 'Verified via physical reference.' : 'Standard averages used.'}</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border shadow-sm border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold flex items-center gap-2 tracking-tight">Measurements</h3>
                  <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                    {['m', 'cm', 'in', 'ft'].map((u) => (
                      <button key={u} onClick={() => setUnit(u as Unit)} className={`px-2 py-1 text-[9px] font-bold rounded uppercase transition-all ${unit === u ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>{u}</button>
                    ))}
                  </div>
                </div>
                {formattedResults && (
                   <div className="space-y-4">
                    {[["Width", formattedResults.w], ["Length", formattedResults.l], ["Height", formattedResults.h]].map(([label, val]) => (
                      <div key={label} className="flex justify-between p-4 bg-slate-50 rounded-2xl border text-sm items-center">
                        <span className="text-slate-500 font-medium">{label}</span>
                        <span className="font-bold text-slate-900">{val}</span>
                      </div>
                    ))}
                    <div className="mt-8 p-8 bg-blue-600 text-white rounded-[2rem] text-center shadow-lg transition-all">
                      <p className="text-[10px] opacity-80 uppercase font-black tracking-widest mb-2">Total Floor Area</p>
                      <p className="text-4xl font-bold tracking-tight">{formattedResults.area}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AnalysisPage;