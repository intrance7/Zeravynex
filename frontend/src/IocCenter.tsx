import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { CopyButton } from './CopyButton';
import {
  Network, Globe, MapPin, Mail, FolderCog, FileCode2, Link,
  Search, Filter, Activity, ShieldAlert, ArrowUpRight, ChevronDown, ChevronRight
} from 'lucide-react';

interface IocCenterProps {
  iocs: any;
}

const IOC_TYPES = [
  { key: 'ip_addresses', label: 'IP Addresses', icon: MapPin, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  { key: 'domains', label: 'Domains', icon: Globe, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { key: 'urls', label: 'URLs', icon: Link, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { key: 'emails', label: 'Emails', icon: Mail, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { key: 'registry_keys', label: 'Registry Keys', icon: FolderCog, color: 'text-warning', bg: 'bg-warning/10' },
  { key: 'file_paths', label: 'File Paths', icon: FileCode2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { key: 'mutexes', label: 'Mutexes', icon: Lock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
];

// Fallback icon for unrecognized types
import { Lock } from 'lucide-react';

export default function IocCenter({ iocs }: IocCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(IOC_TYPES.map(t => t.key)));

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const iocData = iocs || {};

  const totalIocs = useMemo(() => {
    return IOC_TYPES.reduce((acc, type) => acc + (iocData[type.key]?.length || 0), 0);
  }, [iocData]);

  const filteredData = useMemo(() => {
    const result: Record<string, string[]> = {};
    
    IOC_TYPES.forEach(type => {
      const items = iocData[type.key] || [];
      if (items.length === 0) return;
      if (activeFilter !== 'all' && activeFilter !== type.key) return;

      const q = searchQuery.toLowerCase();
      if (!q) {
        result[type.key] = items;
      } else {
        const filtered = items.filter((item: string) => item.toLowerCase().includes(q));
        if (filtered.length > 0) result[type.key] = filtered;
      }
    });
    
    return result;
  }, [iocData, searchQuery, activeFilter]);

  const activeCount = Object.values(filteredData).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

      {/* ── Sidebar ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="xl:col-span-1 space-y-4"
      >
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm text-center">
          <Activity className="w-8 h-8 text-primary mx-auto mb-3" />
          <h2 className="text-3xl font-black text-foreground">{totalIocs}</h2>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mt-1">Total IOCs Extracted</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 pb-3 border-b border-border/50">
            <Filter className="w-3.5 h-3.5 text-primary" /> Filter by Type
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all text-xs",
                activeFilter === 'all'
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-muted/10 border-border/50 hover:bg-muted/30 text-foreground"
              )}
            >
              <Network className="w-4 h-4 shrink-0" />
              <span className="flex-1 font-medium">All Types</span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded border bg-background border-border text-muted-foreground">
                {totalIocs}
              </span>
            </button>
            
            {IOC_TYPES.map(type => {
              const count = iocData[type.key]?.length || 0;
              if (count === 0) return null;
              
              const Icon = type.icon;
              return (
                <button
                  key={type.key}
                  onClick={() => setActiveFilter(type.key)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all text-xs",
                    activeFilter === type.key
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-muted/10 border-border/50 hover:bg-muted/30 text-foreground"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", type.color)} />
                  <span className="flex-1 font-medium">{type.label}</span>
                  <span className={cn("px-1.5 py-0.5 text-[9px] font-bold rounded border", type.bg, type.color.replace('text-', 'border-'))}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm bg-warning/5 border-warning/20">
            <p className="text-xs text-warning flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Extracted strings may contain benign indicators (e.g. microsoft.com). Context is required before blocklisting.</span>
            </p>
        </div>
      </motion.div>

      {/* ── Main View ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="xl:col-span-3 bg-card border border-border rounded-xl shadow-sm flex flex-col min-h-[600px]"
      >
        <div className="p-4 border-b border-border/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search IOCs..."
              className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-8">
          {Object.keys(filteredData).length > 0 ? (
            IOC_TYPES.map(type => {
              const items = filteredData[type.key];
              if (!items || items.length === 0) return null;
              
              const Icon = type.icon;
              const isExpanded = expandedSections.has(type.key);

              return (
                <div key={type.key} className="space-y-3">
                  <button 
                    onClick={() => toggleSection(type.key)}
                    className="flex items-center gap-2 w-full text-left focus:outline-none group"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <Icon className={cn("w-4 h-4", type.color)} />
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{type.label}</h3>
                    <span className="text-xs font-mono text-muted-foreground ml-auto bg-muted/30 px-2 py-0.5 rounded border border-border/50">
                        {items.length}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-6"
                      >
                        <ul className="space-y-1.5 pt-1 pb-2">
                          {items.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 bg-muted/10 hover:bg-muted/30 border border-border/50 rounded-md p-2 transition-colors group">
                                <span className="font-mono text-[13px] text-foreground/90 flex-1 truncate select-all">{item.replace(/^http/i, 'hxxp')}</span>
                                
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button title="Pivot/Search (Coming Soon)" className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors">
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </button>
                                    <CopyButton text={item} />
                                </div>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-20">
              <Network className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">No IOCs found matching your criteria.</p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-border/50 bg-muted/5 text-[10px] text-muted-foreground text-center">
            Showing {activeCount} IOCs
        </div>
      </motion.div>
    </div>
  );
}
