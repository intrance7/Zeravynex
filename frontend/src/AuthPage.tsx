import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, User, ArrowRight, Activity, Zap, Server } from 'lucide-react';

export default function AuthPage({ onLogin }: { onLogin: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[5%] right-[5%] w-[35rem] h-[35rem] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-12 p-6 relative z-10 items-center h-full">
        
        {/* Left Side: Brand Story / Visuals */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex flex-col justify-center text-left"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-widest text-foreground">
              ZERAVYNEX<span className="text-primary ml-1 text-sm align-top">OS</span>
            </h1>
          </div>
          
          <h2 className="text-4xl font-bold mb-6 leading-tight text-foreground tracking-tight">
            Threat Intelligence <br/>
            <span className="text-muted-foreground">
              Workspace Environment
            </span>
          </h2>
          
          <p className="text-sm text-muted-foreground mb-10 max-w-md leading-relaxed">
            Explainable AI malware analysis platform designed for SOC teams. Upload payloads, dissect execution flows, and generate MITRE ATT&CK mappings in seconds.
          </p>

          <div className="space-y-4">
            {[
              { icon: Activity, title: 'Deep Heuristics', desc: 'Identify behavioral anomalies and injection primitives.' },
              { icon: Zap, title: 'SHAP Explainability', desc: 'Understand exactly why the ML model flagged a sample.' },
              { icon: Server, title: 'Secure Enclave', desc: 'Strictly static analysis. Payloads are never detonated.' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                className="flex items-center gap-4 bg-card/50 border border-border/50 p-4 rounded-xl"
              >
                <div className="p-2 bg-background border border-border rounded-lg shadow-sm">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{feature.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Auth Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-card border border-border p-8 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-cyan-400 opacity-50"></div>
            
            <div className="mb-8 text-center md:text-left pt-2">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {isLogin ? 'Authentication Required' : 'Provision Account'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isLogin ? 'Provide operator credentials to initialize terminal session.' : 'Register new analyst profile for the environment.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Operator Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-9 pr-4 text-sm outline-none transition-all text-foreground shadow-sm font-mono"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Analyst Email</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="analyst@soc.local"
                    className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-9 pr-4 text-sm outline-none transition-all text-foreground shadow-sm font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Passphrase</label>
                  {isLogin && <button type="button" className="text-[11px] text-primary hover:underline">Forgot?</button>}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-9 pr-4 text-sm outline-none transition-all text-foreground shadow-sm font-mono"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Initiate Session' : 'Provision Account'} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <p className="text-[11px] text-muted-foreground">
                {isLogin ? "Don't have clearance? " : "Already provisioned? "}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary font-bold hover:underline transition-all"
                >
                  {isLogin ? 'Request Access' : 'Authenticate Here'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
