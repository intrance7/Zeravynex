import { useState } from 'react';
import { KeyRound, ShieldAlert, MonitorSmartphone, Clock, LogOut, Smartphone, CheckCircle2, AlertTriangle, Github, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function SecuritySettings() {
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);

  const handleSignOutAll = () => {
    toast.success('Successfully terminated all other active sessions.');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      <div>
        <h2 className="text-xl font-bold text-foreground">Security & Access</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage authentication methods, active sessions, and account security.</p>
      </div>

      <hr className="border-border" />

      {/* Two-Factor Authentication */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary" /> Two-Factor Authentication (2FA)
        </h3>
        <div className="bg-background border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg border ${isMFAEnabled ? 'bg-success/10 border-success/30' : 'bg-muted/50 border-border'}`}>
              <Smartphone className={`w-6 h-6 ${isMFAEnabled ? 'text-success' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground">Authenticator App</h4>
                {isMFAEnabled ? (
                  <span className="px-1.5 py-0.5 rounded-sm bg-success/20 text-success text-[9px] font-bold uppercase tracking-wider">Enabled</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-sm bg-warning/20 text-warning text-[9px] font-bold uppercase tracking-wider">Disabled</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground max-w-lg">
                Protect your account with an extra layer of security. We strongly recommend enabling 2FA for all analyst accounts.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsMFAEnabled(!isMFAEnabled)}
            className="shrink-0 bg-card border border-border hover:bg-muted text-foreground font-semibold px-4 py-2 rounded-lg transition-colors text-sm shadow-sm"
          >
            {isMFAEnabled ? 'Manage 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </div>

      {/* Password Management */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-primary" /> Password Management
        </h3>
        <form className="bg-background border border-border rounded-xl p-6 space-y-4 max-w-2xl">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Current Password</label>
            <input 
              type="password" 
              className="w-full bg-card border border-border rounded-lg py-2.5 px-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-foreground font-mono"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">New Password</label>
              <input 
                type="password" 
                className="w-full bg-card border border-border rounded-lg py-2.5 px-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-foreground font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Confirm Password</label>
              <input 
                type="password" 
                className="w-full bg-card border border-border rounded-lg py-2.5 px-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-foreground font-mono"
              />
            </div>
          </div>
          <div className="pt-2">
            <button 
              type="button"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-lg transition-colors text-sm shadow-sm"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Connected Accounts */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Github className="w-5 h-5 text-primary" /> Connected Accounts
        </h3>
        <div className="bg-background border border-border rounded-xl overflow-hidden divide-y divide-border">
          <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-card border border-border rounded-md">
                <Github className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">GitHub</h4>
                <p className="text-xs text-muted-foreground">Not connected</p>
              </div>
            </div>
            <button className="text-sm font-semibold text-primary hover:underline">Connect</button>
          </div>
          <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-card border border-border rounded-md">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Google</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-success" /> Connected
                </p>
              </div>
            </div>
            <button className="text-sm font-semibold text-destructive hover:underline">Disconnect</button>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MonitorSmartphone className="w-5 h-5 text-primary" /> Active Sessions
          </h3>
          <button 
            onClick={handleSignOutAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-md transition-colors border border-transparent hover:border-destructive/20"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out All Other Devices
          </button>
        </div>
        
        <div className="bg-background border border-border rounded-xl overflow-hidden divide-y divide-border">
          {[
            { os: 'macOS', browser: 'Chrome', ip: '192.168.1.104', location: 'Seattle, WA', time: 'Active now', current: true },
            { os: 'Windows', browser: 'Edge', ip: '10.0.0.45', location: 'Austin, TX', time: 'Last active 2 days ago', current: false },
          ].map((session, i) => (
            <div key={i} className="flex items-start justify-between p-5 hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-card border border-border rounded-lg mt-0.5">
                  <MonitorSmartphone className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    {session.os} • {session.browser}
                    {session.current && (
                      <span className="px-1.5 py-0.5 rounded-sm bg-success/20 text-success text-[9px] font-bold uppercase tracking-wider">Current</span>
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">IP: {session.ip} ({session.location})</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {session.time}
                  </p>
                </div>
              </div>
              {!session.current && (
                <button className="text-xs font-semibold text-destructive hover:underline mt-1">Revoke</button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
