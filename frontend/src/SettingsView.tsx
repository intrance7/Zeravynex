import { useState } from 'react';
import { User, ShieldAlert, CreditCard, Users, Terminal, Settings } from 'lucide-react';
import { cn } from './lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import ProfileSettings from './ProfileSettings';
import SecuritySettings from './SecuritySettings';
import BillingSettings from './BillingSettings';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing' | 'team' | 'api'>('profile');

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'security', label: 'Security & Access', icon: ShieldAlert },
    { id: 'billing', label: 'Billing & Usage', icon: CreditCard },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'api', label: 'API Keys', icon: Terminal },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Workspace Settings
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Manage your account preferences, security configuration, billing, and API access from your central dashboard.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Settings Navigation */}
        <div className="w-full lg:w-64 shrink-0 bg-card border border-border rounded-xl p-3 shadow-sm sticky top-8">
          <nav className="flex flex-col gap-1" role="tablist" aria-orientation="vertical" aria-label="Settings Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`settings-panel-${tab.id}`}
                id={`settings-tab-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  activeTab === tab.id 
                    ? "text-primary bg-primary/10 border border-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                )}
              >
                <tab.icon className="w-4 h-4 z-10" aria-hidden="true" />
                <span className="z-10">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeSettingsTab"
                    className="absolute inset-0 bg-primary/5"
                    initial={false}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 w-full bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && <ProfileSettings />}
              {activeTab === 'security' && <SecuritySettings />}
              {activeTab === 'billing' && <BillingSettings />}
              {activeTab === 'team' && (
                <div className="text-center py-20 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-bold text-foreground">Team Management</h3>
                  <p className="text-sm mt-2">Team workspaces and role-based access control are coming soon.</p>
                </div>
              )}
              {activeTab === 'api' && (
                <div className="text-center py-20 text-muted-foreground">
                  <Terminal className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-bold text-foreground">API Developer Portal</h3>
                  <p className="text-sm mt-2">Manage programmatic access tokens and webhooks.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
