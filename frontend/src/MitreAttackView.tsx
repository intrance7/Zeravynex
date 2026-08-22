import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { ShieldAlert, Info, ArrowRight, ExternalLink } from 'lucide-react';

interface MitreAttackViewProps {
  mitreMappings: any[];
}

const TACTICS = [
  'Initial Access',
  'Execution',
  'Persistence',
  'Privilege Escalation',
  'Defense Evasion',
  'Credential Access',
  'Discovery',
  'Command and Control',
  'Exfiltration',
  'Impact'
];

export default function MitreAttackView({ mitreMappings }: MitreAttackViewProps) {
  const [selectedTechnique, setSelectedTechnique] = useState<any | null>(null);

  const mappingsByTactic = mitreMappings?.reduce((acc: any, mapping: any) => {
    const tactic = mapping.tactic || 'Unknown';
    if (!acc[tactic]) acc[tactic] = [];
    acc[tactic].push(mapping);
    return acc;
  }, {}) || {};

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[700px]">
      
      {/* ── Matrix View ───────────────────────────────────────── */}
      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col min-w-0">
        <div className="p-4 border-b border-border/50 bg-muted/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">MITRE ATT&CK Matrix</h3>
          </div>
          <span className="text-xs text-muted-foreground">{mitreMappings?.length || 0} Techniques Detected</span>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 custom-scrollbar">
          <div className="flex gap-4 min-w-max pb-4">
            {TACTICS.map(tactic => {
              const techniques = mappingsByTactic[tactic] || [];
              const hasTechniques = techniques.length > 0;
              
              // Map legacy Command and Control to match AI Analyst output which might just use "Command and Control" or "Command & Control"
              // The AI analyst output uses specific strings, we should just match loosely if possible or use exactly what we get.
              // For robustness, let's just render all tactics and slot techniques where they fit.
              
              // We will render columns for all standard tactics.
              return (
                <div key={tactic} className="w-48 shrink-0 flex flex-col gap-2">
                  <div className={cn(
                    "px-3 py-2 text-xs font-bold uppercase tracking-wider text-center border-b-2",
                    hasTechniques ? "border-primary text-foreground" : "border-border/50 text-muted-foreground"
                  )}>
                    {tactic}
                  </div>
                  
                  <div className="flex flex-col gap-2 pt-2">
                    {techniques.map((tech: any) => (
                      <button
                        key={tech.technique_id}
                        onClick={() => setSelectedTechnique(tech)}
                        className={cn(
                          "text-left p-3 rounded border text-xs transition-all",
                          selectedTechnique?.technique_id === tech.technique_id
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "bg-destructive/10 border-destructive/30 hover:bg-destructive/20 text-foreground"
                        )}
                      >
                        <div className="font-mono font-bold mb-1 opacity-80">{tech.technique_id}</div>
                        <div className="font-semibold leading-tight line-clamp-2">{tech.technique_name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Detail Panel ──────────────────────────────────────── */}
      <motion.div
        layout
        className="w-full xl:w-96 bg-card border border-border rounded-xl shadow-sm flex flex-col shrink-0"
      >
        <div className="p-4 border-b border-border/50 bg-muted/5">
          <h3 className="text-sm font-bold text-foreground">Technique Details</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-5 relative">
          <AnimatePresence mode="wait">
            {selectedTechnique ? (
              <motion.div
                key={selectedTechnique.technique_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-lg font-black text-primary">{selectedTechnique.technique_id}</span>
                    <a
                      href={`https://attack.mitre.org/techniques/${selectedTechnique.technique_id.replace('.', '/')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title="View on MITRE ATT&CK website"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <h2 className="text-xl font-bold text-foreground leading-tight mb-2">
                    {selectedTechnique.technique_name}
                  </h2>
                  <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded bg-muted text-muted-foreground">
                    {selectedTechnique.tactic}
                  </span>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Info className="w-3 h-3" /> Description
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {selectedTechnique.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3" /> Matched Evidence
                  </h4>
                  {selectedTechnique.matched_indicators?.length > 0 ? (
                    <ul className="space-y-1.5">
                      {selectedTechnique.matched_indicators.map((indicator: string, i: number) => (
                        <li key={i} className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono px-2.5 py-1.5 rounded">
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No specific indicators extracted.</p>
                  )}
                </div>
                
                <div className="bg-muted/10 border border-border/50 rounded-lg p-4 text-center mt-auto">
                    <p className="text-xs text-muted-foreground">This mapping is automatically generated by AI Analyst correlation of static analysis artifacts.</p>
                </div>
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm font-medium">Select a technique from the matrix to view detailed evidence and context.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

    </div>
  );
}
