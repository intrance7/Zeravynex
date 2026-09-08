import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Network, Shield } from 'lucide-react';

const Logo = ({ className = "" }: { className?: string }) => (
  <Shield className={`text-white ${className}`} />
);

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <motion.div 
        animate={{ rotateY: 360 }}
        transition={{ duration: 3, ease: "easeInOut" }}
        className="relative"
      >
        <motion.svg viewBox="0 0 100 100" className="w-24 h-24 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          {/* Hexagon Outline */}
          <motion.path 
            d="M50 5 L93.3 30 L93.3 80 L50 105 L6.7 80 L6.7 30 Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          {/* Inner Y shape to make it an isometric cube */}
          <motion.path 
            d="M6.7 30 L50 55 L93.3 30 M50 55 L50 105" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.8, ease: "easeInOut" }}
          />
          {/* Scanning Line */}
          <motion.line 
            x1="0" y1="0" x2="100" y2="0"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="1"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 110, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, delay: 0.5, ease: "linear" }}
            style={{ filter: 'blur(1px)' }}
          />
        </motion.svg>
      </motion.div>
      
      <motion.div 
        className="mt-8 text-[10px] font-mono tracking-[0.3em] text-white/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        INITIALIZING CORE
      </motion.div>
      <motion.div 
        className="w-48 h-[1px] bg-white/10 mt-4 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div 
          className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
};

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-black/50 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent border-transparent py-6'}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut", delay: 3 }} // delay to show after loader
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="w-5 h-5" />
          <span className="font-semibold tracking-[0.2em] text-xs uppercase text-white">Zeravynex</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-[11px] font-medium tracking-[0.15em] text-white/50 uppercase">
          <a href="#" className="hover:text-white transition-colors">Platform</a>
          <a href="#" className="hover:text-white transition-colors">Analysis</a>
          <a href="#" className="hover:text-white transition-colors">Threat Intel</a>
        </div>

        <div className="flex items-center gap-6 text-[11px] font-medium tracking-[0.1em] uppercase">
          <Link to="/login" className="text-white/70 hover:text-white transition-colors">Sign In</Link>
          <Link to="/dashboard" className="bg-white text-black px-5 py-2.5 rounded-full hover:bg-neutral-200 transition-colors flex items-center gap-2">
            Explore <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  
  // Hero Parallax/Transforms
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  const artifactRotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  
  // Trace Section Transforms
  const traceOpacity = useTransform(scrollYProgress, [0.15, 0.3, 0.45, 0.5], [0, 1, 1, 0]);
  const traceY = useTransform(scrollYProgress, [0.15, 0.3], [100, 0]);

  // Code Section Transforms
  const codeOpacity = useTransform(scrollYProgress, [0.45, 0.55, 0.7, 0.8], [0, 1, 1, 0]);
  const codeY = useTransform(scrollYProgress, [0.45, 0.55], [100, 0]);

  useEffect(() => {
    // Lock body scroll while loading
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [loading]);

  return (
    <div className="bg-black min-h-[300vh] text-white font-sans selection:bg-white/30 selection:text-white overflow-x-hidden">
      <AnimatePresence>
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <NavBar />

      {/* FIXED BACKGROUND ARTIFACT */}
      <motion.div 
        className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20"
        style={{ rotate: artifactRotate, scale: heroScale }}
      >
        <svg viewBox="0 0 400 400" className="w-[800px] h-[800px] text-white/5">
          <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" />
          <circle cx="200" cy="200" r="140" fill="none" stroke="currentColor" strokeWidth="0.2" />
          <path d="M200 20 L200 60 M200 340 L200 380 M20 200 L60 200 M340 200 L380 200" stroke="currentColor" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* HERO SECTION */}
      <motion.section 
        className="fixed inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none"
        style={{ opacity: heroOpacity, y: heroY }}
      >
        <div className="text-center max-w-4xl mx-auto pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={!loading ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-[10px] font-mono text-white/50 mb-8 tracking-[0.4em] uppercase"
          >
            The New Standard in Sandboxing
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={!loading ? { opacity: 1, filter: "blur(0px)" } : {}}
            transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-medium tracking-tighter leading-[1.05] mb-8"
          >
            See what malware<br />
            <span className="text-white/40">really does.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={!loading ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 1 }}
            className="text-lg md:text-xl text-white/50 font-light max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Advanced behavioral analysis mapped to an elegant interface. 
            Transform malicious code into actionable intelligence instantly.
          </motion.p>
        </div>
      </motion.section>

      {/* SCROLL SPACING */}
      <div className="h-[100vh]" /> {/* Hero Spacing */}

      {/* TRACE SECTION (Sticky Content) */}
      <div className="h-[100vh] relative">
        <motion.div 
          className="fixed inset-0 z-20 flex items-center justify-center px-6 pointer-events-none"
          style={{ opacity: traceOpacity, y: traceY }}
        >
          <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center pointer-events-auto">
            <div>
              <div className="text-[10px] font-mono text-white/50 mb-6 tracking-[0.3em] uppercase">Dynamic Analysis</div>
              <h2 className="text-4xl md:text-6xl font-medium tracking-tighter leading-tight mb-6">
                Every file<br />leaves a trace.
              </h2>
              <p className="text-lg text-white/50 font-light leading-relaxed max-w-md">
                Zeravynex observes every registry key modified, network request sent, and process spawned, rendering them into a beautiful, explorable behavioral map.
              </p>
            </div>
            
            <div className="relative h-[400px] flex items-center justify-center">
              {/* Minimalist Network Drawing */}
              <svg viewBox="0 0 400 400" className="w-full h-full absolute">
                {/* Lines drawing in as this section becomes visible */}
                <motion.path 
                  d="M200 200 L100 100 M200 200 L300 150 M200 200 L250 300 M200 200 L80 250" 
                  stroke="rgba(255, 255, 255, 0.15)" 
                  strokeWidth="1"
                  style={{ pathLength: useTransform(scrollYProgress, [0.2, 0.3], [0, 1]) }}
                />
                <motion.path 
                  d="M200 200 L150 50" 
                  stroke="rgba(255, 255, 255, 0.8)" 
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  style={{ pathLength: useTransform(scrollYProgress, [0.25, 0.35], [0, 1]) }}
                />
              </svg>
              
              <div className="absolute grid grid-cols-1 gap-24">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center z-10 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                  <Network className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* STATIC ANALYSIS SECTION */}
      <div className="h-[100vh] relative">
        <motion.div 
          className="fixed inset-0 z-20 flex items-center justify-center px-6 pointer-events-none"
          style={{ opacity: codeOpacity, y: codeY }}
        >
          <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center pointer-events-auto">
            <div className="order-2 md:order-1">
              {/* Minimalist Code Block */}
              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <div className="flex gap-2 mb-6">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>
                
                <div className="text-white/40 font-mono text-xs leading-loose tracking-wider">
                  <span className="text-white/80">import</span> pefile<br/>
                  <span className="text-white/80">def</span> analyze_imports(file_path):<br/>
                  &nbsp;&nbsp;pe = pefile.PE(file_path)<br/>
                  &nbsp;&nbsp;<span className="text-white/80">for</span> entry <span className="text-white/80">in</span> pe.DIRECTORY_ENTRY_IMPORT:<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;print(entry.dll.decode('utf-8'))<br/>
                  <br/>
                  <span className="text-white/20"># Output:</span><br/>
                  <span className="text-white/60">KERNEL32.dll</span><br/>
                  <span className="text-red-400">VirtualAlloc</span><br/>
                  <span className="text-red-400">WriteProcessMemory</span>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="text-[10px] font-mono text-white/50 mb-6 tracking-[0.3em] uppercase">Static Analysis</div>
              <h2 className="text-4xl md:text-6xl font-medium tracking-tighter leading-tight mb-6">
                Deep inside<br />the structure.
              </h2>
              <p className="text-lg text-white/50 font-light leading-relaxed max-w-md mb-8">
                Extract hidden payloads, analyze entropy, and detect packer signatures instantly without ever executing the file.
              </p>
              <div className="flex items-center gap-6 text-sm font-medium">
                <div className="flex flex-col gap-1">
                  <span className="text-white/40 font-mono text-[10px] uppercase">Entropy</span>
                  <span>7.94 (High)</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col gap-1">
                  <span className="text-white/40 font-mono text-[10px] uppercase">Signatures</span>
                  <span>UPX Variant</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FINAL CTA SECTION */}
      <div className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 border-t border-white/5 mt-20 z-30 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="text-center relative z-10"
        >
          <Logo className="w-12 h-12 mx-auto mb-8 opacity-50" />
          <h2 className="text-5xl md:text-7xl font-medium tracking-tighter mb-8">
            From noise<br />to intelligence.
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 text-sm">
              Start Analyzing <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* MINIMALIST FOOTER */}
      <footer className="border-t border-white/5 bg-black py-12 px-6 relative z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Logo className="w-4 h-4 text-white/50" />
            <span className="font-semibold tracking-[0.2em] text-[10px] uppercase text-white/50">Zeravynex</span>
          </div>
          
          <div className="flex items-center gap-8 text-[10px] font-medium tracking-wider text-white/40 uppercase">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
