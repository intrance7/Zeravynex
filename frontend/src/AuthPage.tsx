import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, User, ArrowRight, Activity, Zap, Server, Mail, ChevronLeft, Code } from 'lucide-react';

export default function AuthPage({ onLogin }: { onLogin: () => void }) {
  const [authState, setAuthState] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication process
    setTimeout(() => {
      setIsLoading(false);
      if (authState === 'register') {
        setAuthState('verify');
      } else if (authState === 'forgot') {
        setAuthState('login');
        // Show toast in real app
      } else {
        onLogin();
      }
    }, 1500);
  };

  const handleSocialLogin = (_provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[5%] right-[5%] w-[35rem] h-[35rem] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 p-6 relative z-10 items-center h-full min-h-screen">
        
        {/* Left Side: Brand Story / Visuals */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex flex-col justify-center text-left max-w-lg mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-widest text-foreground">
              ZERAVYNEX<span className="text-primary ml-1 text-sm align-top">OS</span>
            </h1>
          </div>
          
          <h2 className="text-4xl font-bold mb-6 leading-tight text-foreground tracking-tight">
            Advanced Threat <br/>
            <span className="text-muted-foreground">
              Intelligence Platform
            </span>
          </h2>
          
          <p className="text-sm text-muted-foreground mb-12 max-w-md leading-relaxed">
            Enterprise-grade malware analysis designed for elite SOC teams. Leverage explainable AI to dissect execution flows, extract IOCs, and generate MITRE ATT&CK mappings in seconds.
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
                className="flex items-center gap-4 bg-card/50 border border-border/50 p-4 rounded-xl backdrop-blur-sm"
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

        {/* Right Side: Auth Form Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto relative"
        >
          <div className="bg-card border border-border p-8 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-cyan-400 opacity-50"></div>
            
            <AnimatePresence mode="wait">
              {/* === VERIFY EMAIL STATE === */}
              {authState === 'verify' && (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center pt-4 pb-2"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Check your email</h3>
                  <p className="text-sm text-muted-foreground mb-8">
                    We sent a verification link to <span className="text-foreground font-medium">{email || 'your email'}</span>.
                  </p>
                  <button 
                    onClick={() => setAuthState('login')}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Return to login
                  </button>
                </motion.div>
              )}

              {/* === FORGOT PASSWORD STATE === */}
              {authState === 'forgot' && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <button 
                    onClick={() => setAuthState('login')}
                    className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-6"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back to login
                  </button>
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-foreground mb-2">Reset Password</h3>
                    <p className="text-sm text-muted-foreground">Enter your email and we'll send you instructions.</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
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
                        "Send Reset Link"
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* === LOGIN / REGISTER STATE === */}
              {(authState === 'login' || authState === 'register') && (
                <motion.div
                  key="auth"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="mb-8 text-center md:text-left pt-2">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {authState === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {authState === 'login' 
                        ? 'Enter your operator credentials to continue.' 
                        : 'Register a new analyst profile for the environment.'}
                    </p>
                  </div>

                  {/* Social Logins */}
                  <div className="space-y-3 mb-6">
                    <button 
                      type="button"
                      onClick={() => handleSocialLogin('github')}
                      className="w-full flex items-center justify-center gap-3 bg-background border border-border hover:bg-muted text-foreground py-2.5 rounded-lg font-medium transition-colors text-sm"
                    >
                      <Code className="w-4 h-4" /> Continue with GitHub
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleSocialLogin('google')}
                      className="w-full flex items-center justify-center gap-3 bg-background border border-border hover:bg-muted text-foreground py-2.5 rounded-lg font-medium transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </button>
                  </div>

                  <div className="relative flex items-center py-2 mb-6">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="flex-shrink-0 mx-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">or continue with email</span>
                    <div className="flex-grow border-t border-border"></div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {authState === 'register' && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
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
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Password</label>
                        {authState === 'login' && (
                          <button 
                            type="button" 
                            onClick={() => setAuthState('forgot')}
                            className="text-[11px] text-primary hover:underline font-semibold"
                          >
                            Forgot?
                          </button>
                        )}
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

                    {authState === 'login' && (
                      <div className="flex items-center gap-2 pt-1">
                        <input 
                          type="checkbox" 
                          id="remember" 
                          className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background"
                        />
                        <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer">
                          Remember me for 30 days
                        </label>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>
                          {authState === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-8 pt-6 border-t border-border/50 text-center">
                    <p className="text-[12px] text-muted-foreground">
                      {authState === 'login' ? "Don't have an account? " : "Already have an account? "}
                      <button 
                        onClick={() => setAuthState(authState === 'login' ? 'register' : 'login')}
                        className="text-foreground font-bold hover:text-primary transition-colors"
                      >
                        {authState === 'login' ? 'Sign up' : 'Log in'}
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
