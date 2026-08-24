import { useState } from 'react';
import { Camera, Mail, ShieldCheck, Activity, CreditCard, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@zeravynex.local',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Profile updated successfully');
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div>
        <h2 className="text-xl font-bold text-foreground">User Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your public analyst identity and workspace preferences.</p>
      </div>

      <hr className="border-border" />

      {/* Profile Picture & Basic Info */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center text-3xl font-bold text-primary shadow-lg overflow-hidden">
              AD
            </div>
            <button className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-border">
              <Camera className="w-5 h-5 text-foreground mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
            </button>
          </div>
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-success/10 text-success border border-success/30 text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" /> Active Analyst
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex-1 space-y-5 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full bg-background border border-border rounded-lg py-2.5 px-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-foreground font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Operator Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="email" 
                  value={profile.email}
                  disabled
                  className="w-full bg-muted/50 border border-border rounded-lg py-2.5 pl-9 pr-4 text-sm outline-none text-muted-foreground font-mono cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Contact support to change associated email address.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
             <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Account Provider</label>
              <input 
                type="text" 
                value="Email / Password"
                disabled
                className="w-full bg-muted/30 border border-border rounded-lg py-2.5 px-4 text-sm outline-none text-foreground font-medium cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Provision Date</label>
              <input 
                type="text" 
                value="August 24, 2026"
                disabled
                className="w-full bg-muted/30 border border-border rounded-lg py-2.5 px-4 text-sm outline-none text-foreground font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg transition-all shadow-sm disabled:opacity-70 text-sm"
            >
              {isSaving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      <hr className="border-border/50" />

      {/* Plan & Usage Summary */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Plan Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-background border border-border rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Current Plan</p>
                <h4 className="text-xl font-bold text-foreground flex items-center gap-2">
                  Researcher <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] uppercase tracking-wider font-bold">Pro</span>
                </h4>
              </div>
              <div className="p-2 bg-muted rounded-lg border border-border">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            <button className="text-sm font-semibold text-primary hover:underline">Manage Subscription &rarr;</button>
          </div>

          <div className="bg-background border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Monthly Analysis Quota</p>
              <span className="text-xs font-mono font-bold text-foreground">72 / 100</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-3">
              <div className="h-full bg-primary" style={{ width: '72%' }}></div>
            </div>
            <p className="text-[11px] text-muted-foreground">Resets in 14 days (Sept 7, 2026)</p>
          </div>

        </div>
      </div>

    </div>
  );
}
