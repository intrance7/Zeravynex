import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShieldAlert, Globe, 
  Database, GitBranch, ArrowRight, ShieldCheck, FileText, Activity, Network
} from 'lucide-react';
import { cn } from './lib/utils';
import { CopyButton } from './CopyButton';

export default function ThreatIntelView() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setHasResults(false);
    
    // Simulate API delay
    setTimeout(() => {
      setIsSearching(false);
      setHasResults(true);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      
      {/* Omni-Search Header */}
      <div className={cn(
        "flex flex-col items-center justify-center transition-all duration-500 ease-in-out px-6",
        hasResults ? "pt-8 pb-6 border-b border-border bg-card" : "flex-1 pb-32"
      )}>
        {!hasResults && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground mb-3 text-center">Global Threat Intelligence</h1>
            <p className="text-muted-foreground text-center max-w-lg">
              Search across billions of historical indicators, malware families, and global telemetry data.
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSearch} className={cn(
          "w-full transition-all duration-500",
          hasResults ? "max-w-3xl" : "max-w-2xl"
        )}>
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl group-focus-within:bg-primary/30 transition-all opacity-50"></div>
            <div className="relative flex items-center bg-card border border-border rounded-xl overflow-hidden shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
              <div className="pl-4 pr-2 text-muted-foreground">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search IP, Domain, URL, Hash, CVE, or Malware Family..."
                className="flex-1 bg-transparent py-4 text-sm focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
              <button 
                type="submit"
                disabled={isSearching || !query.trim()}
                className="mx-2 px-6 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg font-semibold tracking-wide text-xs uppercase transition-colors"
              >
                {isSearching ? 'Searching...' : 'Analyze'}
              </button>
            </div>
          </div>
          
          {!hasResults && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="text-xs text-muted-foreground mr-2 mt-1.5">Trending:</span>
              {['8.8.8.8', 'wannacry', 'T1055', 'CVE-2023-38831'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => { setQuery(tag); handleSearch(); }}
                  className="px-3 py-1 bg-muted/40 hover:bg-muted border border-border rounded-full text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Results Dashboard */}
      <AnimatePresence>
        {hasResults && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 overflow-y-auto p-6 md:p-8"
          >
            <div className="max-w-7xl mx-auto space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
                    <Globe className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold font-mono">{query || '192.168.1.100'}</h2>
                      <CopyButton text={query || '192.168.1.100'} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-muted">IPv4 Address</span>
                      Last observed: 2 hours ago
                    </p>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 flex gap-6">
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Reputation</p>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-destructive" />
                      <span className="font-bold text-destructive">Malicious</span>
                    </div>
                  </div>
                  <div className="w-px bg-border"></div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Confidence</p>
                    <div className="font-mono font-bold">98%</div>
                  </div>
                </div>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Context & Pivots */}
                <div className="space-y-6">
                  {/* Whois / Context */}
                  <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 border-b border-border/50 pb-2">
                      <Database className="w-3.5 h-3.5" /> Context
                    </h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">ASN</span>
                        <span className="font-mono">AS13335 (Cloudflare)</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Country</span>
                        <span>United States</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Malware Family</span>
                        <span className="text-destructive font-bold cursor-pointer hover:underline">Cobalt Strike</span>
                      </li>
                    </ul>
                  </div>

                  {/* Investigation Pivots */}
                  <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 border-b border-border/50 pb-2">
                      <GitBranch className="w-3.5 h-3.5" /> Quick Pivots
                    </h3>
                    <div className="space-y-2">
                      {[
                        'Search all samples communicating with this IP',
                        'View related domains resolving to this IP',
                        'Query SIEM logs for this IP in the last 7 days'
                      ].map((pivot, i) => (
                        <button key={i} className="w-full text-left p-2.5 rounded-lg bg-muted/30 hover:bg-muted border border-border text-xs text-foreground transition-colors flex items-center justify-between group">
                          <span>{pivot}</span>
                          <ArrowRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Middle/Right Column: Relationships & Samples */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Associated Samples */}
                  <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-border/50">
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" /> Associated Samples (Last 30 Days)
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                          <tr>
                            <th className="px-5 py-3 font-semibold">SHA256</th>
                            <th className="px-5 py-3 font-semibold">Type</th>
                            <th className="px-5 py-3 font-semibold">Detections</th>
                            <th className="px-5 py-3 font-semibold">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {[
                            { hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', type: 'PE32', det: '65/72', date: '2026-08-22' },
                            { hash: '8d141e97dfc89d268d0672ba9a8c7df946955cb858004f216298dc4e548325a2', type: 'ELF', det: '41/72', date: '2026-08-15' },
                            { hash: '522c0b4ebfdf6ce303a2fc1e6e00b5bbde2b0e7041a943a41c210515e02422fa', type: 'Mach-O', det: '23/72', date: '2026-08-01' },
                          ].map((s, i) => (
                            <tr key={i} className="hover:bg-muted/20 transition-colors">
                              <td className="px-5 py-3 font-mono text-xs text-primary cursor-pointer hover:underline truncate max-w-[200px]">{s.hash}</td>
                              <td className="px-5 py-3 text-xs">{s.type}</td>
                              <td className="px-5 py-3 text-xs text-destructive font-bold">{s.det}</td>
                              <td className="px-5 py-3 text-xs text-muted-foreground">{s.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* MITRE ATT&CK */}
                  <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 border-b border-border/50 pb-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> Commonly Observed MITRE Techniques
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'T1059.001', name: 'PowerShell' },
                        { id: 'T1105', name: 'Ingress Tool Transfer' },
                        { id: 'T1573.001', name: 'Symmetric Cryptography' },
                        { id: 'T1071.001', name: 'Web Protocols' },
                        { id: 'T1055', name: 'Process Injection' },
                      ].map((t) => (
                        <div key={t.id} className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 border border-border rounded-md text-xs">
                          <span className="font-mono text-primary font-bold">{t.id}</span>
                          <span className="text-foreground">{t.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Historical Observations */}
                  <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 border-b border-border/50 pb-2">
                      <Activity className="w-3.5 h-3.5" /> Historical Observations
                    </h3>
                    <div className="relative pl-4 border-l-2 border-border/50 space-y-4">
                      {[
                        { date: '2026-08-22', text: 'Associated with Emotet campaign targeting healthcare sector.' },
                        { date: '2026-06-14', text: 'First seen resolving to known Cobalt Strike Team Server.' },
                        { date: '2025-11-03', text: 'Registered via Namecheap.' }
                      ].map((obs, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary/40 border-2 border-card"></div>
                          <p className="text-[10px] font-mono text-muted-foreground font-bold mb-0.5">{obs.date}</p>
                          <p className="text-sm text-foreground">{obs.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Relationships */}
                  <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 border-b border-border/50 pb-2">
                      <Network className="w-3.5 h-3.5" /> Known Relationships
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { type: 'Domain', val: 'malicious-c2.net', icon: Globe },
                        { type: 'Hash', val: 'e3b0c44298fc...', icon: FileText },
                        { type: 'Actor', val: 'APT29', icon: ShieldAlert }
                      ].map((rel, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 border border-border bg-muted/20 rounded-lg pr-4">
                          <div className="p-1.5 bg-background rounded-md border border-border">
                            <rel.icon className="w-3 h-3 text-primary" />
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">{rel.type}</p>
                            <p className="text-xs font-mono font-medium">{rel.val}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
