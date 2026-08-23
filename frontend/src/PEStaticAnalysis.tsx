import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from './lib/utils';
import { CopyButton } from './CopyButton';
import {
  Cpu, Clock, Hash, Shield, Code2, HardDrive, Layers, ArrowUpDown,
  ChevronUp, ChevronDown, AlertTriangle, CheckCircle, Info
} from 'lucide-react';

interface PEStaticAnalysisProps {
  peHeader: any;
  sections: any[];
  hashes: any;
  metadata: any;
}

type SortField = 'name' | 'virtual_size' | 'raw_size' | 'entropy' | 'permissions';
type SortDir = 'asc' | 'desc';

const getEntropyColor = (entropy: number) => {
  if (entropy >= 7.5) return 'text-destructive';
  if (entropy >= 7.0) return 'text-orange-400';
  if (entropy >= 6.0) return 'text-warning';
  if (entropy >= 4.0) return 'text-foreground';
  return 'text-success';
};

const getEntropyBarColor = (entropy: number) => {
  if (entropy >= 7.5) return 'bg-destructive';
  if (entropy >= 7.0) return 'bg-orange-500';
  if (entropy >= 6.0) return 'bg-warning';
  if (entropy >= 4.0) return 'bg-primary';
  return 'bg-success';
};

const getEntropyLabel = (entropy: number) => {
  if (entropy >= 7.5) return { text: 'PACKED', color: 'text-destructive bg-destructive/10 border-destructive/30' };
  if (entropy >= 7.0) return { text: 'HIGH', color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' };
  if (entropy >= 6.0) return { text: 'ELEVATED', color: 'text-warning bg-warning/10 border-warning/30' };
  if (entropy >= 4.0) return { text: 'NORMAL', color: 'text-muted-foreground bg-muted/30 border-border' };
  return { text: 'LOW', color: 'text-success bg-success/10 border-success/30' };
};

const getSectionRisk = (section: any) => {
  const anomalies = section.anomalies || [];
  if (anomalies.some((a: string) => a.includes('RWX'))) return { level: 'CRITICAL', color: 'text-destructive bg-destructive/10 border-destructive/30' };
  if (section.entropy >= 7.1) return { level: 'HIGH', color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' };
  if (anomalies.length > 0) return { level: 'MEDIUM', color: 'text-warning bg-warning/10 border-warning/30' };
  return { level: 'CLEAN', color: 'text-success bg-success/10 border-success/30' };
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function PEStaticAnalysis({ peHeader, sections, hashes, metadata }: PEStaticAnalysisProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedSections = useMemo(() => {
    if (!sections?.length) return [];
    return [...sections].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sections, sortField, sortDir]);

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="px-4 py-3 font-semibold cursor-pointer hover:text-foreground select-none transition-colors group"
      onClick={() => toggleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <span className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
          {sortField === field ? (
            sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          ) : (
            <ArrowUpDown className="w-3 h-3" />
          )}
        </span>
      </div>
    </th>
  );

  const securityFeatures = peHeader?.security_features || {};

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

      {/* ── PE Metadata Panel ────────────────────────────────── */}
      <div className="xl:col-span-1 space-y-5">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-xl p-5 shadow-sm"
        >
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2 pb-3 border-b border-border/50">
            <Cpu className="w-3.5 h-3.5 text-primary" /> PE Metadata
          </h3>

          <div className="space-y-3">
            {[
              { icon: Cpu, label: 'Architecture', value: peHeader?.architecture || 'Unknown' },
              { icon: Code2, label: 'Entry Point', value: peHeader?.entry_point, mono: true },
              { icon: Layers, label: 'Image Base', value: peHeader?.image_base, mono: true },
              { icon: Clock, label: 'Compile Time', value: peHeader?.compile_timestamp ? new Date(peHeader.compile_timestamp).toLocaleString() : 'N/A' },
              { icon: HardDrive, label: 'Subsystem', value: peHeader?.subsystem?.replace('IMAGE_SUBSYSTEM_', '').replace(/_/g, ' ') || 'Unknown' },
              { icon: Shield, label: 'File Type', value: peHeader?.file_type || 'PE' },
              { icon: Hash, label: 'Checksum', value: peHeader?.checksum, mono: true },
              { icon: Layers, label: 'Sections', value: peHeader?.number_of_sections?.toString() || '0' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <span className={cn("text-xs text-foreground max-w-[180px] truncate text-right", item.mono && "font-mono text-[11px]")}>
                  {item.value || 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* File Size & Hashes */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-5 shadow-sm"
        >
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2 pb-3 border-b border-border/50">
            <Hash className="w-3.5 h-3.5 text-primary" /> File Identity
          </h3>

          <div className="space-y-3">
            <div className="bg-muted/20 border border-border/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">File Size</span>
              </div>
              <span className="text-sm font-mono text-foreground font-semibold">
                {metadata?.file_size ? formatBytes(metadata.file_size) : hashes?.size_bytes ? formatBytes(hashes.size_bytes) : 'N/A'}
              </span>
            </div>

            {[
              { label: 'MD5', val: hashes?.md5 },
              { label: 'SHA-1', val: hashes?.sha1 },
              { label: 'SHA-256', val: hashes?.sha256 },
            ].map(h => (
              <div key={h.label} className="bg-muted/20 border border-border/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{h.label}</span>
                  {h.val && <CopyButton text={h.val} />}
                </div>
                <p className="font-mono text-[11px] text-foreground/80 break-all select-all leading-relaxed">{h.val || 'N/A'}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security Features */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-xl p-5 shadow-sm"
        >
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 pb-3 border-b border-border/50">
            <Shield className="w-3.5 h-3.5 text-primary" /> Security Mitigations
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'ASLR', enabled: securityFeatures.aslr },
              { label: 'DEP/NX', enabled: securityFeatures.dep_nx },
              { label: 'SafeSEH', enabled: securityFeatures.no_seh },
              { label: 'CFG', enabled: securityFeatures.cfg },
              { label: 'Authenticode', enabled: securityFeatures.has_signature },
            ].map(feat => (
              <div key={feat.label} className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium",
                feat.enabled
                  ? "bg-success/5 border-success/20 text-success"
                  : "bg-destructive/5 border-destructive/20 text-destructive"
              )}>
                {feat.enabled ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {feat.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Sections Table ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="xl:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col"
      >
        <div className="p-5 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" /> PE Sections
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{sections?.length || 0} sections detected · Click column headers to sort</p>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success"></span> Normal</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning"></span> Elevated</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive"></span> Suspicious</span>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/20 border-b border-border sticky top-0">
              <tr>
                <SortHeader field="name" label="Name" />
                <SortHeader field="virtual_size" label="Virtual Size" />
                <SortHeader field="raw_size" label="Raw Size" />
                <SortHeader field="entropy" label="Entropy" />
                <SortHeader field="permissions" label="Permissions" />
                <th className="px-4 py-3 font-semibold">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 font-mono text-xs">
              {sortedSections.length > 0 ? sortedSections.map((sec, idx) => {
                const risk = getSectionRisk(sec);
                const entropyLabel = getEntropyLabel(sec.entropy);
                return (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-muted/10 transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-foreground font-bold text-[13px]">{sec.name}</span>
                      <span className="text-muted-foreground ml-2 text-[10px]">{sec.virtual_address}</span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{formatBytes(sec.virtual_size)}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{formatBytes(sec.raw_size)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-bold text-[13px]", getEntropyColor(sec.entropy))}>
                            {sec.entropy.toFixed(3)}
                          </span>
                          <span className={cn("px-1.5 py-0.5 text-[9px] font-bold rounded border", entropyLabel.color)}>
                            {entropyLabel.text}
                          </span>
                        </div>
                        {/* Visual entropy bar */}
                        <div className="w-full h-1.5 bg-muted/40 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(sec.entropy / 8) * 100}%` }}
                            transition={{ duration: 0.6, delay: idx * 0.05 }}
                            className={cn("h-full rounded-full", getEntropyBarColor(sec.entropy))}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        {sec.permissions.split('').map((p: string, i: number) => (
                          <span key={i} className={cn(
                            "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border",
                            p === 'X' ? "bg-destructive/15 border-destructive/30 text-destructive" :
                            p === 'W' ? "bg-warning/15 border-warning/30 text-warning" :
                            "bg-muted/30 border-border text-muted-foreground"
                          )}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("px-2 py-1 text-[10px] font-bold rounded border", risk.color)}>
                        {risk.level}
                      </span>
                    </td>
                  </motion.tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Info className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No PE sections available</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section Anomalies Summary */}
        {sortedSections.some(s => s.anomalies?.length > 0) && (
          <div className="p-4 border-t border-border/50 bg-muted/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-warning" /> Section Anomalies Detected
            </p>
            <div className="flex flex-wrap gap-2">
              {sortedSections.flatMap(s => (s.anomalies || []).map((a: string) => `${s.name}: ${a}`)).map((anomaly, i) => (
                <span key={i} className="text-[10px] px-2 py-1 bg-warning/10 border border-warning/20 text-warning rounded font-mono">
                  {anomaly}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
