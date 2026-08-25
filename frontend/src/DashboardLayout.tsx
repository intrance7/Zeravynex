import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, Activity, Database, Settings, 
  LogOut, User as UserIcon, Search, Bell, Hexagon, Terminal, Network, Menu
} from 'lucide-react';
import { cn } from './lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import AIAnalystPanel from './AIAnalystPanel';
import CommandPalette from './CommandPalette';
import LimitReachedModal from './LimitReachedModal';
import NotificationCenter from './NotificationCenter';

export default function DashboardLayout({ onLogout }: { onLogout: () => void }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string | undefined>();
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showUsageBanner, setShowUsageBanner] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOpenAI = (e: any) => {
      setAiPrompt(e.detail);
      setIsAIOpen(true);
    };
    const handleSimulateLimit = () => {
      setIsLimitModalOpen(true);
    };
    window.addEventListener('open-ai-analyst', handleOpenAI);
    window.addEventListener('simulate-limit', handleSimulateLimit);
    return () => {
      window.removeEventListener('open-ai-analyst', handleOpenAI);
      window.removeEventListener('simulate-limit', handleSimulateLimit);
    };
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  // Close sidebar when navigating on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

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
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Compact & Utilitarian */}
      <aside className={cn(
        "w-64 bg-card border-r border-border flex flex-col justify-between z-40 shrink-0 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.5)] transition-transform duration-300 absolute lg:relative h-full",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        
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
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 z-20 shrink-0">
          
          <div className="flex items-center gap-2 lg:hidden mr-2">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl flex items-center">
            <button 
              onClick={() => setIsCommandOpen(true)}
              className="relative w-full flex items-center bg-background border border-border rounded-md py-1.5 pl-3 pr-4 text-sm text-muted-foreground/70 hover:border-primary/50 transition-all font-mono shadow-inner text-left"
            >
              <Search className="w-4 h-4 mr-2 shrink-0" />
              <span className="truncate hidden sm:inline">Search by SHA256, Tag, or IP...</span>
              <span className="truncate sm:hidden">Search...</span>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex gap-1">
                <kbd className="px-1.5 py-0.5 bg-card rounded text-[10px] text-muted-foreground border border-border font-mono">Ctrl</kbd>
                <kbd className="px-1.5 py-0.5 bg-card rounded text-[10px] text-muted-foreground border border-border font-mono">K</kbd>
              </div>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-5 pl-6">
            
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="text-muted-foreground hover:text-foreground transition-colors relative focus:outline-none"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border-2 border-card"></span>
              </button>
              <NotificationCenter isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
            </div>

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
                    <button 
                      onClick={() => { setIsProfileOpen(false); navigate('/dashboard/settings'); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
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
          {/* Usage Limit Banner (80% approaching) */}
          <AnimatePresence>
            {showUsageBanner && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-warning/10 border-b border-warning/20 px-6 py-3 flex items-center justify-between overflow-hidden"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-warning" />
                  </div>
                  <div className="flex-1 max-w-xl">
                    <p className="text-sm font-semibold text-warning-foreground">You've used 80% of your monthly analyses.</p>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-warning transition-all" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <button 
                    onClick={() => setShowUsageBanner(false)} 
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dismiss
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard/pricing')}
                    className="bg-warning text-warning-foreground hover:bg-warning/90 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                  >
                    View Plans
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Outlet />
        </main>

      </div>

      <AIAnalystPanel isOpen={isAIOpen} onClose={() => { setIsAIOpen(false); setAiPrompt(undefined); }} initialPrompt={aiPrompt} />
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
      <LimitReachedModal isOpen={isLimitModalOpen} onClose={() => setIsLimitModalOpen(false)} limitType="analyses" currentUsage={10} maxLimit={10} />
    </div>
  );
}
