import { useState, useRef } from 'react';
import { UploadCloud, Settings, Server, Lock, Cpu, Activity } from 'lucide-react';
import { cn } from './lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api/v1';

export default function AnalysisContent() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Settings state for visual technicality
  const [settings, setSettings] = useState({
    static: true,
    yara: true,
    ml: true,
    ai: true,
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().match(/\.(exe|dll|sys)$/)) {
        setSelectedFile(file);
      } else {
        toast.error('Invalid file type. Only .exe, .dll, and .sys are supported.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    toast.loading('Initializing analysis environment...', { id: 'upload' });

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Analysis Complete: Verdict ${data.verdict}`, { id: 'upload' });
        navigate('/dashboard/report', { state: { sha256: data.sha256 } });
      } else {
        toast.error(`Analysis failed: ${data.detail}`, { id: 'upload' });
        setIsUploading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to establish connection with analysis cluster.', { id: 'upload' });
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3 text-foreground">
          <Server className="w-7 h-7 text-primary" />
          Submit Payload
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
          Upload Windows executables for deep static dissection, heuristic evaluation, YARA signature scanning, and ML-powered threat classification. Files are processed securely in an isolated environment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            className={cn(
              "relative border-2 border-dashed rounded-xl p-12 transition-all duration-200 flex flex-col items-center justify-center text-center overflow-hidden",
              dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/10",
              selectedFile ? "border-primary/50 bg-card shadow-sm" : "bg-card"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleChange} 
              accept=".exe,.dll,.sys"
            />

            {!selectedFile ? (
              <>
                <div className="w-16 h-16 rounded-xl bg-background flex items-center justify-center mb-6 border border-border shadow-sm">
                  <UploadCloud className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Drag & Drop file here</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
                  Supported extensions: <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-foreground text-xs border border-border">.exe</span>, <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-foreground text-xs border border-border">.dll</span>, <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-foreground text-xs border border-border">.sys</span><br/>
                  Max file size: 50MB
                </p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-secondary hover:bg-muted text-secondary-foreground px-6 py-2 rounded-md font-medium text-sm transition-colors border border-border shadow-sm"
                >
                  Browse Files
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center w-full relative z-10">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 shadow-inner">
                  <Cpu className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1 truncate max-w-sm" title={selectedFile.name}>
                  {selectedFile.name}
                </h3>
                <p className="text-xs text-muted-foreground font-mono mb-8 bg-background/50 px-2 py-1 rounded border border-border/50">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedFile(null)}
                    disabled={isUploading}
                    className="bg-card hover:bg-muted text-muted-foreground px-5 py-2.5 rounded-md font-medium text-sm transition-colors border border-border disabled:opacity-50 shadow-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={isUploading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-md font-medium text-sm transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center gap-2 disabled:opacity-70 disabled:shadow-none"
                  >
                    {isUploading ? (
                      <><Activity className="w-4 h-4 animate-spin" /> Dissecting Payload...</>
                    ) : (
                      <>Analyze Payload</>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {/* Ambient Background for Drag Area */}
            {dragActive && (
              <div className="absolute inset-0 bg-primary/5 rounded-xl pointer-events-none flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2 border-b border-border/50 pb-3">
              <Settings className="w-3.5 h-3.5" /> Analysis Configuration
            </h3>
            
            <div className="space-y-4">
              {[
                { id: 'static', label: 'Deep Static Dissection', desc: 'PE Headers, Sections, Imports' },
                { id: 'yara', label: 'YARA Signature Engine', desc: 'Behavioral & Heuristic rules' },
                { id: 'ml', label: 'ML Classification', desc: 'Tree-based probability scoring' },
                { id: 'ai', label: 'AI Narrative', desc: 'MITRE ATT&CK extraction' },
              ].map(opt => (
                <div key={opt.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="pt-0.5">
                    <input 
                      type="checkbox" 
                      id={opt.id} 
                      checked={settings[opt.id as keyof typeof settings] as boolean}
                      onChange={(e) => setSettings({...settings, [opt.id]: e.target.checked})}
                      className="w-4 h-4 rounded bg-background border-border text-primary focus:ring-primary focus:ring-offset-background disabled:opacity-50"
                      disabled={isUploading}
                    />
                  </div>
                  <div>
                    <label htmlFor={opt.id} className="text-[13px] font-semibold leading-none cursor-pointer text-foreground">
                      {opt.label}
                    </label>
                    <p className="text-[11px] text-muted-foreground mt-1.5">{opt.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-border/50">
              <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-background/50 p-3 rounded-lg border border-border">
                <Lock className="w-3.5 h-3.5 shrink-0 text-primary mt-0.5" />
                <p className="leading-relaxed">Data is strictly isolated. Uploaded payloads are securely wiped from the ingestion server after processing completes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
