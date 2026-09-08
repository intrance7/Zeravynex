import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, CheckCircle2, HelpCircle, Activity } from 'lucide-react';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { useAuthStore } from './store/authStore';
import { apiClient } from './services/apiClient';

export default function AuthPage() {
  const [authState, setAuthState] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      setIsLoading(true);
      // Temporarily set token in store so apiClient can use it
      useAuthStore.getState().setToken(token);
      
      // Fetch user profile
      apiClient.get<any>('/auth/me')
        .then(user => {
           login(token, user);
        })
        .catch(err => {
           console.error("Failed to fetch user profile", err);
           useAuthStore.getState().logout();
        })
        .finally(() => {
           setIsLoading(false);
           // Clear token from URL
           window.history.replaceState({}, document.title, window.location.pathname);
        });
    }
  }, [login]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Fallback simple auth mock for email/password (or implement actual backend flow)
    setTimeout(() => {
      setIsLoading(false);
      if (authState === 'register') {
        setAuthState('verify');
      } else if (authState === 'forgot') {
        setAuthState('login');
      } else {
        login("mock-token", { id: '1', name: 'Admin', email, role: 'admin' });
      }
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    if (provider === 'google') {
      window.location.href = 'http://localhost:8000/api/v1/auth/google/login';
    } else if (provider === 'github') {
      window.location.href = 'http://localhost:8000/api/v1/auth/github/login';
    } else {
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#09090b] overflow-hidden text-foreground selection:bg-primary/30 font-sans">
      
      {/* Background Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Top Gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

      {/* TERMINAL BACKGROUND TEXT */}
      <div className="absolute top-[20%] left-12 hidden lg:flex flex-col gap-1 font-mono text-[10px] text-muted-foreground/50 tracking-widest pointer-events-none">
        <div>[SYS] INIT_SEQ: 0x4FBA</div>
        <div>[SEC] HANDSHAKE: OK</div>
        <div className="text-emerald-500/80 flex items-center gap-1 mt-1">
          <Activity className="w-3 h-3" /> ACTIVE
        </div>
      </div>

      <div className="absolute bottom-[25%] right-12 hidden lg:flex flex-col gap-1 font-mono text-[10px] text-muted-foreground/50 tracking-widest text-right pointer-events-none">
        <div>NODE.77A_CONNECTED</div>
        <div>LATENCY: 12ms</div>
        <div>ENC: AES-256-GCM</div>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-[440px] mx-auto">
        
        {/* LOGO */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-12 h-12 rounded-xl bg-transparent border border-border/50 shadow-sm flex items-center justify-center mb-4 text-foreground">
            <Shield className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h1 className="text-xl font-bold tracking-[0.2em] uppercase mb-3">Zeravynex</h1>
          <div className="px-4 py-1.5 rounded-full bg-muted/40 border border-border/30 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Malware Analysis & Threat Intelligence
          </div>
        </motion.div>

        {/* AUTH CARD */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full bg-[#0f0f11] border border-border/40 rounded-2xl p-8 shadow-2xl relative"
        >
          {/* Card header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1 text-white">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to continue to your analysis workspace.</p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button 
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-2 bg-transparent border border-border/50 hover:bg-muted/30 transition-colors py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button 
              type="button"
              onClick={() => handleSocialLogin('github')}
              className="flex items-center justify-center gap-2 bg-transparent border border-border/50 hover:bg-muted/30 transition-colors py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-[1px] bg-border/40"></div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">OR</span>
            <div className="flex-1 h-[1px] bg-border/40"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white">Email</label>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="agent@zeravynex.com"
                className="bg-[#09090b] border-border/40 text-sm focus-visible:ring-primary/50 py-5"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white">Password</label>
                <button type="button" className="text-xs text-muted-foreground hover:text-white transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="bg-[#09090b] border-border/40 text-sm focus-visible:ring-primary/50 py-5 pr-10 tracking-widest"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-2 bg-white text-black hover:bg-neutral-200 py-5 font-semibold text-[15px] flex items-center justify-center gap-2 group transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Sign in 
                  <svg className="w-4 h-4 text-muted-foreground group-hover:text-black transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-muted-foreground">Don't have an account? </span>
            <button className="text-sm font-semibold text-white hover:underline">
              Create account
            </button>
          </div>

        </motion.div>
      </main>

      {/* Footer absolute text */}
      <div className="absolute bottom-6 left-8 flex items-center gap-2 text-[11px] font-mono text-muted-foreground/60 tracking-wider">
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
        Systems operational
      </div>
      
      <div className="absolute bottom-6 right-8 flex items-center gap-2 text-[11px] font-mono text-muted-foreground/60 tracking-wider hidden sm:flex">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Secure authentication <span className="mx-1">•</span> Encrypted connection
        <button className="w-6 h-6 rounded-full border border-border/50 flex items-center justify-center ml-2 hover:bg-muted/30">
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
