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
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[10%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[5%] right-[5%] w-[35rem] h-[35rem] bg-blue-500/10 rounded-full blur-[120px]"
        />
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
            <div className="p-3 bg-primary/20 rounded-xl border border-primary/30">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
              ZERAVYNEX
            </h1>
          </div>
          
          <h2 className="text-5xl font-bold mb-6 leading-tight text-foreground">
            Next-Gen <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Threat Intelligence
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-lg">
            Explainable AI malware analysis platform designed for SOC teams. Upload payloads, dissect execution flows, and generate MITRE ATT&CK mappings in seconds.
          </p>

          <div className="space-y-6">
            {[
              { icon: Activity, title: 'Deep Heuristics', desc: 'Identify behavioral anomalies and injection primitives.' },
              { icon: Zap, title: 'SHAP Explainability', desc: 'Understand exactly why the ML model flagged a sample.' },
              { icon: Server, title: 'Secure Enclave', desc: 'Strictly static analysis. Payloads are never detonated.' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                className="flex items-center gap-4 bg-card/40 border border-border/50 p-4 rounded-xl backdrop-blur-sm"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
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
          <div className="bg-card/70 backdrop-blur-2xl border border-border/50 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.2)]">
            
            <div className="mb-8 text-center md:text-left">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {isLogin ? 'Secure Authentication' : 'Create Access Key'}
              </h3>
              <p className="text-muted-foreground">
                {isLogin ? 'Enter your credentials to access the analyst portal.' : 'Register to deploy your isolated analysis environment.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Operator Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-10 pr-4 outline-none transition-all text-foreground"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Analyst Email</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="analyst@soc.local"
                    className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-10 pr-4 outline-none transition-all text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">Passphrase</label>
                  {isLogin && <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-10 pr-4 outline-none transition-all text-foreground"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Initiate Session' : 'Provision Account'} <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have clearance? " : "Already provisioned? "}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary font-medium hover:underline transition-all"
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
