import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from './components/Footer';
import { Button } from './components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">Zeravynex</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login">
            <Button variant="ghost" className="text-muted-foreground">Log in</Button>
          </Link>
          <Link to="/dashboard">
            <Button>Explore Platform</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center text-center px-6 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            Understand what a suspicious file is doing — <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">before it becomes an incident.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Advanced malware analysis powered by next-generation behavioral sandboxing and AI-driven insights. Stop threats faster with actionable intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
            <Link to="/login">
              <Button size="lg" className="px-8 py-6 text-lg font-semibold flex items-center gap-2">
                Analyze a Sample <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-semibold">
                Explore Platform
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Product Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full max-w-4xl mx-auto mt-20"
        >
          <div className="bg-card border border-border rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-destructive via-warning to-destructive"></div>
            
            {/* Window Header */}
            <div className="bg-muted/30 border-b border-border px-4 py-3 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-border"></div>
                <div className="w-3 h-3 rounded-full bg-border"></div>
                <div className="w-3 h-3 rounded-full bg-border"></div>
              </div>
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                ZeravynexOS - Intelligence Report
              </div>
              <div className="w-9"></div>
            </div>

            {/* Preview Content */}
            <div className="p-6 md:p-8">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Col - Threat Score */}
                <div className="md:col-span-1 border-r border-border/50 pr-8 flex flex-col justify-center items-center">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-destructive" strokeDasharray="283" strokeDashoffset="37" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-foreground">87</span>
                      <span className="text-xs font-bold text-muted-foreground">/ 100</span>
                    </div>
                  </div>
                  <div className="mt-4 px-4 py-1.5 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                    <Shield className="w-4 h-4" /> CRITICAL
                  </div>
                </div>

                {/* Right Col - Details */}
                <div className="md:col-span-2 grid grid-cols-2 gap-6">
                  
                  <div className="bg-background/50 border border-border rounded-lg p-4">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Detection Confidence</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black text-foreground">94</span>
                      <span className="text-lg text-muted-foreground font-bold mb-0.5">%</span>
                    </div>
                  </div>

                  <div className="bg-background/50 border border-border rounded-lg p-4">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Threat Indicators</p>
                    <div className="flex gap-6">
                      <div>
                        <span className="text-2xl font-black text-warning">12</span>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">IOCs</p>
                      </div>
                      <div>
                        <span className="text-2xl font-black text-destructive">7</span>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">YARA</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 bg-background/50 border border-border rounded-lg p-4">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3">MITRE ATT&CK® Techniques</p>
                    <div className="flex flex-wrap gap-2">
                      {['T1059 - Command and Scripting', 'T1055 - Process Injection', 'T1547 - Boot or Logon Autostart'].map(t => (
                        <div key={t} className="px-2.5 py-1.5 bg-muted/30 border border-border rounded text-xs font-mono text-foreground flex items-center gap-2">
                          <span className="text-primary font-bold">{t.split(' - ')[0]}</span>
                          <span className="text-muted-foreground">{t.split(' - ')[1]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
