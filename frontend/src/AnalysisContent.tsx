import { useState, useRef } from 'react';
import { UploadCloud, Settings, Server, Lock, Cpu, Activity, Link, FileDigit, AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { cn } from './lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';

import { analysisService } from './services/analysisService';

const ANALYSIS_STEPS = [
  "Preparing sample",
  "Extracting metadata",
  "Building indicators",
  "Generating findings",
  "Preparing report"
];

export default function AnalysisContent() {
  const [analysisMode, setAnalysisMode] = useState<'file' | 'url'>('file');
  const [isUploading, setIsUploading] = useState(false);
  
  // File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // URL State
  const [urlInput, setUrlInput] = useState('');
  const [urlResult, setUrlResult] = useState<any>(null);

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

  const handleFileSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setAnalysisStep(0);
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    // Simulate step progression visually
    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      if (step < ANALYSIS_STEPS.length) {
        setAnalysisStep(step);
      }
    }, 1500);

    try {
      const data = await analysisService.analyzeFile(selectedFile);

      if (data.status === 'completed') {
        clearInterval(stepInterval);
        setAnalysisStep(ANALYSIS_STEPS.length - 1);
        setTimeout(() => {
          toast.success(`Analysis Complete: Verdict ${data.verdict}`);
          navigate('/dashboard/report', { state: { sha256: data.sha256 } });
        }, 500);
      } else if (data.status === 'queued' && data.task_id) {
        let attempts = 0;
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const taskData = await analysisService.getTaskStatus(data.task_id);
            if (taskData) {
              if (taskData.status === 'completed') {
                clearInterval(pollInterval);
                clearInterval(stepInterval);
                setAnalysisStep(ANALYSIS_STEPS.length - 1);
                setTimeout(() => {
                  toast.success(`Analysis Complete: Verdict ${taskData.result?.verdict || 'DONE'}`);
                  navigate('/dashboard/report', { state: { sha256: taskData.result?.sha256 } });
                }, 500);
              } else if (taskData.status === 'failed') {
                clearInterval(pollInterval);
                clearInterval(stepInterval);
                toast.error(`Worker failed: ${taskData.error || 'Execution error'}`);
                setIsUploading(false);
              }
            }
          } catch (pollErr) {
            console.error("Poll error:", pollErr);
          }

          if (attempts > 60) {
            clearInterval(pollInterval);
            clearInterval(stepInterval);
            toast.error('Analysis timed out. Check history later.');
            setIsUploading(false);
          }
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      clearInterval(stepInterval);
      toast.error('Failed to establish connection with analysis cluster.');
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    setIsUploading(true);
    setUrlResult(null);
    try {
      const data = await analysisService.analyzeUrl(urlInput);
      setUrlResult(data.result);
      toast.success(`URL Analysis Complete: ${data.result.verdict}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to analyze URL.');
    } finally {
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
          Upload Windows executables for deep static dissection, heuristic evaluation, YARA signature scanning, and ML-powered threat classification. Or paste a link to analyze its phishing potential.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Mode Toggle */}
          <div className="flex bg-muted/30 p-1 rounded-lg border border-border inline-flex">
            <button
              onClick={() => setAnalysisMode('file')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                analysisMode === 'file' 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <FileDigit className="w-4 h-4" /> File Upload
            </button>
            <button
              onClick={() => setAnalysisMode('url')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                analysisMode === 'url' 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Link className="w-4 h-4" /> Link Analyzer
            </button>
          </div>

          <div 
            className={cn(
              "relative border-2 rounded-xl p-12 transition-all duration-200 flex flex-col items-center justify-center text-center overflow-hidden min-h-[350px]",
              dragActive ? "border-primary bg-primary/5 border-dashed" : "border-border hover:border-primary/30 hover:bg-muted/10 border-dashed",
              (selectedFile && analysisMode === 'file') ? "border-primary/50 bg-card shadow-sm border-solid" : "bg-card",
              analysisMode === 'url' ? "border-solid shadow-sm" : ""
            )}
            onDragEnter={analysisMode === 'file' ? handleDrag : undefined}
            onDragLeave={analysisMode === 'file' ? handleDrag : undefined}
            onDragOver={analysisMode === 'file' ? handleDrag : undefined}
            onDrop={analysisMode === 'file' ? handleDrop : undefined}
          >
            <AnimatePresence mode="wait">
              {analysisMode === 'file' ? (
                isUploading ? (
                  <motion.div 
                    key="uploading-file"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full flex flex-col items-center justify-center py-8 z-10 relative"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>
                      <Cpu className="w-10 h-10 text-primary relative z-10" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Analyzing Payload</h3>
                    <div className="w-full max-w-sm mb-2 text-center h-6">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={analysisStep}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-sm font-semibold text-primary"
                        >
                          {ANALYSIS_STEPS[Math.min(analysisStep, ANALYSIS_STEPS.length - 1)]}...
                        </motion.p>
                      </AnimatePresence>
                    </div>
                    <div className="w-full max-w-sm h-2 bg-muted rounded-full overflow-hidden mb-4">
                      <motion.div 
                        className="h-full bg-primary"
                        initial={{ width: '0%' }}
                        animate={{ width: `${Math.min(((analysisStep + 1) / ANALYSIS_STEPS.length) * 100, 100)}%` }}
                        transition={{ duration: 0.5 }}
                      ></motion.div>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono bg-background/50 px-2 py-1 rounded border border-border">
                      {selectedFile?.name}
                    </p>
                  </motion.div>
                ) : !selectedFile ? (
                  <motion.div key="upload-prompt" className="flex flex-col items-center w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="w-16 h-16 rounded-xl bg-background flex items-center justify-center mb-6 border border-border shadow-sm">
                      <UploadCloud className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Drag & Drop file here</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
                      Supported extensions: <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-foreground text-xs border border-border">.exe</span>, <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-foreground text-xs border border-border">.dll</span>, <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-foreground text-xs border border-border">.sys</span><br/>
                      Max file size: 50MB
                    </p>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      variant="secondary"
                      className="shadow-sm"
                    >
                      Browse Files
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="file-selected" className="flex flex-col items-center w-full relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                      <Button 
                        variant="outline"
                        onClick={() => setSelectedFile(null)}
                        disabled={isUploading}
                        className="shadow-sm"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleFileSubmit}
                        disabled={isUploading}
                        className="shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center gap-2"
                      >
                        Analyze Payload
                      </Button>
                    </div>
                  </motion.div>
                )
              ) : (
                <motion.div key="url-mode" className="flex flex-col items-center w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {!urlResult ? (
                    <div className="w-full max-w-lg flex flex-col items-center">
                      <div className="w-16 h-16 rounded-xl bg-background flex items-center justify-center mb-6 border border-border shadow-sm">
                        <Link className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">Analyze URL for Threats</h3>
                      <p className="text-sm text-muted-foreground mb-6 max-w-sm leading-relaxed">
                        Enter a URL to scan for phishing attempts, malicious domains, and suspicious heuristics.
                      </p>
                      
                      <div className="w-full relative mb-6">
                        <input
                          type="url"
                          placeholder="https://example.com/login"
                          className="w-full bg-background border border-border text-foreground px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm pr-24"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                        />
                        <div className="absolute right-1 top-1">
                          <Button 
                            onClick={handleUrlSubmit}
                            disabled={isUploading || !urlInput.trim()}
                            className="shadow-sm"
                            size="sm"
                          >
                            {isUploading ? <Activity className="w-4 h-4 animate-spin" /> : "Analyze"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full text-left space-y-6">
                      <div className="flex items-center justify-between border-b border-border pb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center border",
                            urlResult.severity === 'HIGH' ? "bg-destructive/10 border-destructive/30 text-destructive" :
                            urlResult.severity === 'MEDIUM' ? "bg-warning/10 border-warning/30 text-warning" :
                            "bg-success/10 border-success/30 text-success"
                          )}>
                            {urlResult.severity === 'HIGH' ? <AlertTriangle className="w-6 h-6" /> :
                             urlResult.severity === 'MEDIUM' ? <Shield className="w-6 h-6" /> :
                             <CheckCircle className="w-6 h-6" />}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{urlResult.verdict}</h3>
                            <p className="text-sm text-muted-foreground font-mono truncate max-w-[300px]" title={urlResult.url}>{urlResult.url}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold block mb-1">Threat Score</span>
                          <span className={cn(
                            "text-2xl font-bold font-mono",
                            urlResult.severity === 'HIGH' ? "text-destructive" :
                            urlResult.severity === 'MEDIUM' ? "text-warning" : "text-success"
                          )}>{urlResult.score}/100</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" /> Analysis Indicators
                        </h4>
                        <ul className="space-y-2">
                          {urlResult.indicators.map((indicator: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm bg-muted/20 border border-border/50 p-3 rounded-md">
                              <div className="mt-0.5">
                                {urlResult.severity === 'HIGH' ? <AlertTriangle className="w-3.5 h-3.5 text-destructive" /> : <Shield className="w-3.5 h-3.5 text-success" />}
                              </div>
                              <span className="text-foreground/80">{indicator}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-4 flex justify-end">
                        <Button variant="outline" onClick={() => { setUrlResult(null); setUrlInput(''); }}>
                          Analyze Another URL
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleChange} 
              accept=".exe,.dll,.sys"
            />
            
            {/* Ambient Background for Drag Area */}
            {dragActive && analysisMode === 'file' && (
              <div className="absolute inset-0 bg-primary/5 rounded-xl pointer-events-none flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Sidebar */}
        <div className="space-y-6">
          <Card className="p-5">
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
                <div key={opt.id} className={cn("flex items-start gap-3 p-2 rounded-lg transition-colors", analysisMode === 'url' ? "opacity-50 grayscale" : "hover:bg-muted/30")}>
                  <div className="pt-0.5">
                    <input 
                      type="checkbox" 
                      id={opt.id} 
                      checked={settings[opt.id as keyof typeof settings] as boolean}
                      onChange={(e) => setSettings({...settings, [opt.id]: e.target.checked})}
                      className="w-4 h-4 rounded bg-background border-border text-primary focus:ring-primary focus:ring-offset-background disabled:opacity-50"
                      disabled={isUploading || analysisMode === 'url'}
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
          </Card>
        </div>
      </div>
    </div>
  );
}
