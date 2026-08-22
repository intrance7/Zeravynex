import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import {
  Search, ChevronDown, ChevronRight, Shield, AlertTriangle, Cpu,
  HardDrive, Globe, FolderCog, FileKey, Lock, Eye, Layers, Filter,
  X as XIcon
} from 'lucide-react';

interface ImportAnalysisProps {
  importsExports: any;
}

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  'Process Injection & Execution': { icon: Cpu, color: 'text-destructive', label: 'Process' },
  'Memory Manipulation': { icon: Layers, color: 'text-orange-400', label: 'Memory' },
  'Network & C2 Activity': { icon: Globe, color: 'text-purple-400', label: 'Network' },
  'Registry & Persistence': { icon: FolderCog, color: 'text-warning', label: 'Registry' },
  'Anti-Analysis & Evasion': { icon: Eye, color: 'text-rose-400', label: 'Anti-Analysis' },
  'Input Monitoring & Crypto': { icon: Lock, color: 'text-cyan-400', label: 'Cryptography' },
};

const FILTER_CATEGORIES = [
  { key: 'all', label: 'All', icon: Filter },
  { key: 'Process Injection & Execution', label: 'Process', icon: Cpu },
  { key: 'Memory Manipulation', label: 'Memory', icon: Layers },
  { key: 'Network & C2 Activity', label: 'Network', icon: Globe },
  { key: 'Registry & Persistence', label: 'Registry', icon: FolderCog },
  { key: 'Anti-Analysis & Evasion', label: 'Anti-Analysis', icon: Eye },
  { key: 'Input Monitoring & Crypto', label: 'Crypto', icon: Lock },
];

const getSeverity = (category: string) => {
  if (category === 'Process Injection & Execution') return { level: 'CRITICAL', color: 'bg-destructive/10 text-destructive border-destructive/30' };
  if (category === 'Memory Manipulation') return { level: 'HIGH', color: 'bg-orange-400/10 text-orange-400 border-orange-400/30' };
  if (category === 'Network & C2 Activity') return { level: 'HIGH', color: 'bg-purple-400/10 text-purple-400 border-purple-400/30' };
  if (category === 'Registry & Persistence') return { level: 'MEDIUM', color: 'bg-warning/10 text-warning border-warning/30' };
  if (category === 'Anti-Analysis & Evasion') return { level: 'MEDIUM', color: 'bg-rose-400/10 text-rose-400 border-rose-400/30' };
  return { level: 'LOW', color: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30' };
};

export default function ImportAnalysis({ importsExports }: ImportAnalysisProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedDlls, setExpandedDlls] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);

  const imports = importsExports?.imports || {};
  const suspiciousApis = importsExports?.suspicious_apis || [];

  // Build suspicious API lookup
  const suspiciousLookup = useMemo(() => {
    const lookup = new Map<string, { category: string; dll: string }>();
    suspiciousApis.forEach((api: any) => {
      lookup.set(api.api, { category: api.category, dll: api.dll });
    });
    return lookup;
  }, [suspiciousApis]);

  // Group suspicious APIs by category
  const categorizedApis = useMemo(() => {
    const groups: Record<string, any[]> = {};
    suspiciousApis.forEach((api: any) => {
      if (!groups[api.category]) groups[api.category] = [];
      groups[api.category].push(api);
    });
    return groups;
  }, [suspiciousApis]);

  // Filter DLLs based on search and category filter
  const filteredDlls = useMemo(() => {
    const dllEntries = Object.entries(imports) as [string, string[]][];
    return dllEntries.filter(([dll, funcs]) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q
        || dll.toLowerCase().includes(q)
        || funcs.some(f => f.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (activeFilter === 'all') return true;

      // Check if any function in this DLL belongs to the active filter category
      return funcs.some(f => {
        const info = suspiciousLookup.get(f);
        return info && info.category === activeFilter;
      });
    }).sort(([a], [b]) => a.localeCompare(b));
  }, [imports, searchQuery, activeFilter, suspiciousLookup]);

  const toggleDll = (dll: string) => {
    setExpandedDlls(prev => {
      const next = new Set(prev);
      if (next.has(dll)) next.delete(dll);
      else next.add(dll);
      return next;
    });
  };

  const handleExpandAll = () => {
    if (expandAll) {
      setExpandedDlls(new Set());
    } else {
      setExpandedDlls(new Set(filteredDlls.map(([dll]) => dll)));
    }
    setExpandAll(!expandAll);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

      {/* ── Suspicious API Categories Sidebar ──────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="xl:col-span-1 space-y-4"
      >
        {/* Summary Card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 pb-3 border-b border-border/50">
            <AlertTriangle className="w-3.5 h-3.5 text-warning" /> Threat Summary
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/20 border border-border/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-black text-foreground">{Object.keys(imports).length}</p>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">DLLs</p>
            </div>
            <div className="bg-muted/20 border border-border/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-black text-foreground">{importsExports?.total_imported_functions || 0}</p>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Functions</p>
            </div>
            <div className="col-span-2 bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-black text-destructive">{suspiciousApis.length}</p>
              <p className="text-[10px] text-destructive/70 font-semibold uppercase tracking-wider">Suspicious APIs</p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 pb-3 border-b border-border/50">
            <Shield className="w-3.5 h-3.5 text-primary" /> By Category
          </h3>
          <div className="space-y-2">
            {Object.entries(categorizedApis).map(([category, apis]) => {
              const config = CATEGORY_CONFIG[category] || { icon: FileKey, color: 'text-muted-foreground', label: category };
              const severity = getSeverity(category);
              const Icon = config.icon;
              return (
                <button
                  key={category}
                  onClick={() => setActiveFilter(activeFilter === category ? 'all' : category)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all text-xs",
                    activeFilter === category
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-muted/10 border-border/50 hover:bg-muted/30 text-foreground"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", config.color)} />
                  <span className="flex-1 font-medium truncate">{config.label}</span>
                  <span className={cn("px-1.5 py-0.5 text-[9px] font-bold rounded border", severity.color)}>
                    {apis.length}
                  </span>
                </button>
              );
            })}
            {Object.keys(categorizedApis).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4 italic">No suspicious APIs detected</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Main Import Table ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="xl:col-span-3 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col"
      >
        {/* Search and Controls */}
        <div className="p-4 border-b border-border/50 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search DLLs or function names..."
                className="w-full pl-10 pr-4 py-2.5 bg-muted/20 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={handleExpandAll}
              className="px-3 py-2.5 bg-muted/20 border border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors whitespace-nowrap"
            >
              {expandAll ? 'Collapse All' : 'Expand All'}
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {FILTER_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const count = cat.key === 'all' ? suspiciousApis.length : (categorizedApis[cat.key]?.length || 0);
              if (cat.key !== 'all' && count === 0) return null;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveFilter(cat.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all whitespace-nowrap",
                    activeFilter === cat.key
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "bg-muted/10 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {cat.label}
                  {count > 0 && <span className="ml-0.5 opacity-60">({count})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* DLL Import List */}
        <div className="flex-1 overflow-y-auto max-h-[650px] divide-y divide-border/30">
          {filteredDlls.length > 0 ? filteredDlls.map(([dll, funcs]) => {
            const isExpanded = expandedDlls.has(dll);
            const suspFuncsInDll = funcs.filter(f => suspiciousLookup.has(f));
            const hasSuspicious = suspFuncsInDll.length > 0;

            return (
              <div key={dll}>
                <button
                  onClick={() => toggleDll(dll)}
                  className={cn(
                    "w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-muted/10 transition-colors",
                    hasSuspicious && "border-l-2 border-l-destructive/60"
                  )}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <HardDrive className="w-4 h-4 text-primary/60 shrink-0" />
                  <span className="font-mono text-sm text-foreground font-semibold flex-1">{dll}</span>
                  <div className="flex items-center gap-2">
                    {hasSuspicious && (
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-destructive/10 border border-destructive/20 text-destructive rounded">
                        {suspFuncsInDll.length} SUSPICIOUS
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground font-mono">{funcs.length} functions</span>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 pl-14">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                          {funcs.map((func, i) => {
                            const suspInfo = suspiciousLookup.get(func);
                            const severity = suspInfo ? getSeverity(suspInfo.category) : null;
                            const catConfig = suspInfo ? CATEGORY_CONFIG[suspInfo.category] : null;

                            return (
                              <div
                                key={i}
                                className={cn(
                                  "flex items-center gap-2 px-2.5 py-1.5 rounded border text-xs font-mono transition-colors",
                                  suspInfo
                                    ? "bg-destructive/5 border-destructive/20 text-foreground"
                                    : "bg-muted/10 border-border/30 text-muted-foreground"
                                )}
                              >
                                {suspInfo && catConfig && (
                                  <catConfig.icon className={cn("w-3 h-3 shrink-0", catConfig.color)} />
                                )}
                                <span className="truncate flex-1">{func}</span>
                                {severity && (
                                  <span className={cn("px-1 py-0.5 text-[8px] font-bold rounded border shrink-0", severity.color)}>
                                    {severity.level}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Search className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm">No matching imports found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="p-4 border-t border-border/50 bg-muted/5 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Showing {filteredDlls.length} of {Object.keys(imports).length} DLLs</span>
          <span>{importsExports?.total_exported_functions || 0} exported functions</span>
        </div>
      </motion.div>
    </div>
  );
}
