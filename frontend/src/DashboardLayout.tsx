import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Shield, Activity, Database, Settings, 
  LogOut, User as UserIcon, Search, Bell, Hexagon, Terminal, Network
} from 'lucide-react';
import { cn } from './lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import AIAnalystPanel from './AIAnalystPanel';
import CommandPalette from './CommandPalette';

export default function DashboardLayout({ onLogout }: { onLogout: () => void }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { to: '/dashboard', icon: Activity, label: 'Overview' },
    { to: '/dashboard/analyze', icon: Hexagon, label: 'Analyze' },
    { to: '/dashboard/investigations', icon: Search, label: 'Investigations' },
    { to: '/dashboard/samples', icon: Database, label: 'Samples' },
    { to: '/dashboard/intel', icon: Shield, label: 'Threat Intelligence' },
    { to: '/dashboard/graph', icon: Network, label: 'Threat Graph' },
    { to: '/dashboard/reports', icon: Terminal, label: 'Reports' },
    { to: '/dashboard/collections', icon: Database, label: 'Collections' },
    { to: '/dashboard/api', icon: Terminal, label: 'API' },
    { to: '/dashboard/usage', icon: Activity, label: 'Usage' },
    { to: '/dashboard/billing', icon: Database, label: 'Billing' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      
      {/* Sidebar - Compact & Utilitarian */}
      <aside className="w-64 bg-card border-r border-border flex flex-col justify-between z-20 shrink-0 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.5)]">
        
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 px-6 h-16 border-b border-border bg-background/30">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold tracking-tight text-foreground">
              Zeravynex<span className="text-primary text-xs ml-1 align-top">OS</span>
            </span>
          </div>
          
          <div className="px-3 py-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-3">Workspace</p>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                    isActive 
                      ? "bg-primary/15 text-primary border border-primary/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
        
        {/* User / Status */}
        <div className="px-4 py-4 border-t border-border">
          <button 
            onClick={() => setIsAIOpen(true)}
            className="w-full flex items-center gap-3 p-2 bg-background/50 hover:bg-background transition-colors rounded-md border border-border text-left focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <Terminal className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold truncate text-foreground">Analyst Terminal</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Standby</p>
              </div>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-background">
        
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 z-20 shrink-0">
          
          {/* Search Bar */}
          <div className="flex-1 max-w-xl flex items-center">
            <button 
              onClick={() => setIsCommandOpen(true)}
              className="relative w-full flex items-center bg-background border border-border rounded-md py-1.5 pl-3 pr-4 text-sm text-muted-foreground/70 hover:border-primary/50 transition-all font-mono shadow-inner text-left"
            >
              <Search className="w-4 h-4 mr-2" />
              Search by SHA256, Tag, or IP...
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <kbd className="px-1.5 py-0.5 bg-card rounded text-[10px] text-muted-foreground border border-border font-mono">Ctrl</kbd>
                <kbd className="px-1.5 py-0.5 bg-card rounded text-[10px] text-muted-foreground border border-border font-mono">K</kbd>
              </div>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-5 pl-6">
            
            <button className="text-muted-foreground hover:text-foreground transition-colors relative focus:outline-none">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border-2 border-card"></span>
            </button>

            <div className="h-5 w-px bg-border"></div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
              >
                <div className="w-7 h-7 rounded bg-muted flex items-center justify-center border border-border">
                  <UserIcon className="w-4 h-4 text-foreground" />
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-xl py-1 z-50 origin-top-right"
                  >
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="text-[11px] font-semibold text-popover-foreground truncate">admin@zeravynex.local</p>
                    </div>
                    <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Settings className="w-3.5 h-3.5" /> Settings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-destructive hover:bg-destructive/10 transition-colors mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Terminate Session
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto bg-background scroll-smooth">
          <Outlet />
        </main>

      </div>

      <AIAnalystPanel isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </div>
  );
}
