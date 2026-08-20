import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle } from 'lucide-react';
import { cn } from './lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api/v1';

export default function AnalysisContent() {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    toast.loading('Analyzing sample...', { id: 'upload' });

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Analysis Complete: ${data.verdict}`, { id: 'upload' });
        // Navigate back to dashboard with state or just redirect to dashboard which fetches latest
        navigate('/', { state: { sha256: data.sha256 } });
      } else {
        toast.error(`Analysis failed: ${data.detail}`, { id: 'upload' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to connect to backend engine.', { id: 'upload' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto mt-16 relative group"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-500 to-cyan-400 rounded-3xl blur-md opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-card/80 backdrop-blur-2xl border border-border/50 p-16 rounded-3xl flex flex-col items-center justify-center text-center shadow-2xl">
        <motion.div 
          animate={{ y: isUploading ? [0, -10, 0] : 0 }}
          transition={{ repeat: isUploading ? Infinity : 0, duration: 1 }}
          className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center mb-8 shadow-inner border border-primary/20"
        >
          <UploadCloud className={cn("w-14 h-14 text-primary", isUploading ? "animate-pulse" : "")} />
        </motion.div>
        
        <h3 className="text-3xl font-bold mb-3 tracking-tight">Drop PE Payload Here</h3>
        <p className="text-muted-foreground mb-10 max-w-lg leading-relaxed text-lg">
          Upload a Windows executable (.exe, .dll) for static analysis, behavioral heuristics, YARA scanning, and ML-based threat evaluation.
        </p>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileUpload} 
          accept=".exe,.dll,.sys"
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 rounded-full font-semibold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] transform hover:-translate-y-1 flex items-center gap-3",
            isUploading && "opacity-70 cursor-not-allowed transform-none shadow-none hover:shadow-none"
          )}
        >
          {isUploading ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Dissecting Payload...</>
          ) : (
            <><CheckCircle className="w-5 h-5" /> Select File</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
