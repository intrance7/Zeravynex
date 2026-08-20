import { useState } from 'react';
import { Shield, ShieldAlert, Activity, FileSearch, UploadCloud, Settings, Database, Server } from 'lucide-react';
import { cn } from './lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isUploading, setIsUploading] = useState(false);
  
  // Dummy data for visual presentation
  const riskScore = 85;
  const verdict = 'CRITICAL MALWARE';
  
  const shapData = [
    { feature: 'entropy', value: 0.45 },
    { feature: 'Suspicious_APIs', value: 0.32 },
    { feature: 'rwx_sections', value: 0.28 },
    { feature: 'yara_packer', value: 0.15 },
    { feature: 'file_size', value: -0.05 },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      
      {/* Sidebar */}
      <div className="w-64 bg-card/40 backdrop-blur-md border-r border-border p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2">
            <Shield className="w-8 h-8 text-primary animate-pulse-slow" />
            <h1 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">ZERAVYNEX</h1>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: Activity, label: 'Dashboard' },
              { id: 'analysis', icon: FileSearch, label: 'New Analysis' },
              { id: 'history', icon: Database, label: 'History' },
              { id: 'engine', icon: Server, label: 'Engine Status' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                  activeTab === item.id 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
          <Settings className="w-4 h-4" /> v1.6.0 Core
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-destructive/20 blur-[120px]"></div>
        </div>

        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold mb-1">Security Dashboard</h2>
            <p className="text-muted-foreground">Explainable AI Malware Analysis Platform</p>
          </div>
          
          <div className="flex items-center gap-4 bg-card/60 backdrop-blur-md px-4 py-2 rounded-full border border-border">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium">Engines Online</span>
          </div>
        </header>

        {activeTab === 'analysis' && (
          <div className="max-w-2xl mx-auto mt-20 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-card/80 backdrop-blur-xl border border-border p-12 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-300">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <UploadCloud className="w-12 h-12 text-primary animate-float" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Drop PE File Here</h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                Upload a Windows executable (.exe, .dll) for deep static analysis, heuristics, YARA, and ML evaluation.
              </p>
              <button 
                onClick={() => setIsUploading(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transform hover:-translate-y-1"
              >
                {isUploading ? 'Analyzing...' : 'Select File'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Risk Card */}
            <div className="col-span-1 bg-card/50 backdrop-blur-lg border border-border rounded-xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-lg font-medium text-muted-foreground">Threat Verdict</h3>
                  <div className="text-3xl font-bold text-destructive mt-1">{verdict}</div>
                </div>
                <ShieldAlert className="w-8 h-8 text-destructive" />
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-5xl font-black">{riskScore}<span className="text-xl text-muted-foreground font-medium">/100</span></div>
                  <div className="text-sm text-muted-foreground mt-2">Unified Risk Score</div>
                </div>
              </div>
            </div>

            {/* AI Explanation Card */}
            <div className="col-span-2 bg-card/50 backdrop-blur-lg border border-border rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-medium text-muted-foreground mb-4">AI Analyst Executive Summary</h3>
              <div className="bg-background/50 rounded-lg p-5 border border-border/50 text-sm leading-relaxed">
                <p className="mb-3 text-foreground/90">
                  <strong className="text-primary">Executive Summary:</strong> Static security evaluation of sample 'sample_ml.exe' resulted in a threat verdict of <span className="text-destructive font-semibold">CRITICAL MALWARE</span> with a normalized Risk Score of 85.0/100.
                </p>
                <p className="text-muted-foreground">
                  The sample exhibits severe malicious characteristics including high-entropy executable code, suspicious process injection APIs, and signature matches corresponding to known malware primitives. Immediate containment and host isolation are recommended.
                </p>
              </div>
            </div>

            {/* SHAP Feature Importance */}
            <div className="col-span-1 md:col-span-3 bg-card/50 backdrop-blur-lg border border-border rounded-xl p-6 shadow-xl h-80">
               <h3 className="text-lg font-medium text-muted-foreground mb-6">ML Feature Explanations (SHAP)</h3>
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shapData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 20 }}>
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="feature" type="category" width={120} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--muted)/0.3)'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                      {
                        shapData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.value > 0 ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
                        ))
                      }
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
