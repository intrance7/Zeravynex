import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Shield, Activity, FileSearch, Database, Server, Settings, 
  LogOut, User as UserIcon, Sun, Moon, Bell, ChevronRight 
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ onLogout }: { onLogout: () => void }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Apply theme
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-300">
      
      {/* Sidebar */}
      <div className="w-72 bg-card/40 backdrop-blur-md border-r border-border flex flex-col justify-between z-20 shadow-2xl relative">
        <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
        
        <div>
          <div className="flex items-center gap-3 mb-8 px-6 pt-8">
            <Shield className="w-9 h-9 text-primary animate-pulse-slow drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
            <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              ZERAVYNEX
            </h1>
          </div>
          
          <div className="px-6 mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Main Menu</p>
            <nav className="space-y-1.5">
              {[
                { to: '/', icon: Activity, label: 'Dashboard' },
                { to: '/analysis', icon: FileSearch, label: 'New Analysis' },
                { to: '/history', icon: Database, label: 'Threat History' },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden",
                    isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.05)]"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />
                      <item.icon className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="px-6 pb-6">
          <div className="bg-muted/30 border border-border/50 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" /> v1.6.0 Core
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                API Online
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
          <div className="absolute top-[-15%] left-[20%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[150px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-destructive/10 blur-[120px]"></div>
        </div>

        {/* Top Header */}
        <header className="h-20 border-b border-border/50 bg-background/50 backdrop-blur-xl flex items-center justify-between px-8 z-20 sticky top-0">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Shield className="w-4 h-4" />
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Workspace</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary">Terminal</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
            </button>

            <div className="h-6 w-px bg-border mx-2"></div>

            {/* User Profile */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">OP</span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold leading-tight text-foreground">Operator</p>
                  <p className="text-xs text-muted-foreground leading-tight">SOC Level 3</p>
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-56 bg-card border border-border rounded-xl shadow-2xl py-2 overflow-hidden z-50"
                  >
                    <div className="px-4 py-2 border-b border-border/50 mb-1">
                      <p className="text-sm font-semibold">Operator Account</p>
                      <p className="text-xs text-muted-foreground truncate">analyst@soc.local</p>
                    </div>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <UserIcon className="w-4 h-4" /> Profile Settings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Terminate Session
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-8 relative z-10 scroll-smooth">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
