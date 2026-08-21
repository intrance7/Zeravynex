import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileCode2, Network, ShieldAlert, Activity, Users, X } from 'lucide-react';

type CommandGroup = 'Samples' | 'IOCs' | 'Investigations' | 'Reports' | 'Threat Actors';

interface SearchResult {
  id: string;
  type: CommandGroup;
  title: string;
  subtitle: string;
  icon: any;
}

const mockResults: SearchResult[] = [
  { id: '1', type: 'Samples', title: '8f4a...91c2', subtitle: 'Malicious Document', icon: FileCode2 },
  { id: '2', type: 'Samples', title: 'invoice.exe', subtitle: 'Suspicious PE32', icon: FileCode2 },
  { id: '3', type: 'IOCs', title: '192.168.1.10', subtitle: 'C2 Server', icon: Network },
  { id: '4', type: 'IOCs', title: 'example.com', subtitle: 'Phishing Domain', icon: Network },
  { id: '5', type: 'Investigations', title: 'INV-2023-11', subtitle: 'Ransomware Outbreak', icon: ShieldAlert },
  { id: '6', type: 'Reports', title: 'Q3 Threat Landscape', subtitle: 'Quarterly Analysis', icon: Activity },
  { id: '7', type: 'Threat Actors', title: 'APT29', subtitle: 'Cozy Bear', icon: Users },
];

export default function CommandPalette({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [query, setQuery] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredResults = mockResults.filter(r => 
    r.title.toLowerCase().includes(query.toLowerCase()) || 
    r.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const groupedResults = filteredResults.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<CommandGroup, SearchResult[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              
              {/* Search Input */}
              <div className="flex items-center px-4 py-3 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search Zeravynex..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-foreground text-sm font-mono placeholder:text-muted-foreground/50"
                />
                <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-none">
                {Object.keys(groupedResults).length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No results found for "{query}"
                  </div>
                ) : (
                  Object.entries(groupedResults).map(([group, items]) => (
                    <div key={group} className="mb-4 last:mb-0">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {group}
                      </div>
                      <div className="space-y-1">
                        {items.map(item => (
                          <button
                            key={item.id}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary/10 hover:text-primary group transition-colors text-left"
                            onClick={() => {
                              // Handle navigation here
                              onClose();
                            }}
                          >
                            <div className="w-8 h-8 rounded bg-muted group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                              <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-sm font-semibold text-foreground group-hover:text-primary truncate">{item.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Footer */}
              <div className="bg-muted/30 border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-card border border-border rounded font-mono text-[10px]">↑</kbd><kbd className="px-1.5 py-0.5 bg-card border border-border rounded font-mono text-[10px]">↓</kbd> Navigate</span>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-card border border-border rounded font-mono text-[10px]">↵</kbd> Select</span>
                </div>
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-card border border-border rounded font-mono text-[10px]">ESC</kbd> Close</span>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
