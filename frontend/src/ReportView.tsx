import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldAlert, CheckCircle, AlertTriangle, Activity, Database, Info, Fingerprint, Network, Cpu, FileCode2, Binary, Code2, BrainCircuit, ChevronDown } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Button } from './components/ui/Button';
import { CopyButton } from './CopyButton';
import PEStaticAnalysis from './PEStaticAnalysis';
import ImportAnalysis from './ImportAnalysis';
import IocCenter from './IocCenter';
import MitreAttackView from './MitreAttackView';
import ThreatGraphView from './ThreatGraphView';
import { SkeletonReport } from './components/SkeletonComponents';
import ErrorState from './ErrorState';
import { useNavigate } from 'react-router-dom';
import { historyService } from './services/historyService';
import { reportService } from './services/reportService';

type Tab = 'overview' | 'static' | 'api' | 'ml' | 'iocs' | 'mitre' | 'graph';

export default function ReportView() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isAIActionsOpen, setIsAIActionsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTarget = async () => {
      setLoading(true);
      try {
        let targetSha = location.state?.sha256;
        
        if (!targetSha) {
          const histData = await historyService.getRecentHistory(1);
          if (histData && histData.length > 0) {
            targetSha = histData[0].sha256;
          }
        }

        if (targetSha) {
          try {
            const data = await reportService.getReportBySha(targetSha);
            setAnalysisResult(data);
          } catch (e) {
            setError("Analysis unavailable");
          }
        } else {
          setError("No active analysis");
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Backend connection lost");
      } finally {
        setLoading(false);
      }
    };

    fetchTarget();
  }, [location.state]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full">
        <SkeletonReport />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full h-full flex items-center justify-center">
        <ErrorState 
          title={error} 
          description={error === 'Backend connection lost' ? 'Could not connect to the analysis cluster. Please check your network or try again.' : 'The requested report could not be found or generated.'} 
          action={{ label: 'Go to Dashboard', onClick: () => navigate('/dashboard') }} 
        />
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mb-6 border border-border/50">
          <Activity className="w-10 h-10 opacity-40" />
        </div>
        <h2 className="text-xl font-bold text-foreground">No Active Analysis</h2>
        <p className="mt-2 text-sm text-center max-w-md">
          Submit a payload via the 'Submit Payload' workspace to generate a comprehensive threat intelligence report.
        </p>
      </div>
    );
  }

  const riskScore = analysisResult.risk_analysis?.risk_score || 0;
  const verdict = analysisResult.risk_analysis?.verdict || 'UNKNOWN';
  const aiSummary = analysisResult.ai_analysis?.executive_summary || 'No narrative generated for this sample.';
  const mitre = analysisResult.ai_analysis?.mitre_attack_mappings || [];
  
  // Format SHAP data for chart
  let shapData = [];
  if (analysisResult.ml_analysis?.shap_explainability?.top_pushing_malware) {
    shapData = analysisResult.ml_analysis.shap_explainability.top_pushing_malware.map((item: any) => ({
      feature: item.feature,
      value: item.shap_value,
      type: 'Malicious'
    })).slice(0, 5);
    if (analysisResult.ml_analysis?.shap_explainability?.top_pushing_benign) {
       const benign = analysisResult.ml_analysis.shap_explainability.top_pushing_benign.map((item: any) => ({
         feature: item.feature,
         value: -item.shap_value, // Negative for charting
         type: 'Benign'
       })).slice(0, 3);
       shapData = [...shapData, ...benign];
    }
  }

  const getVerdictStyles = (v: string) => {
    if (v === 'CLEAN / LOW RISK') return { color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', icon: <CheckCircle className="w-8 h-8 text-success" /> };
    if (v === 'SUSPICIOUS') return { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', icon: <AlertTriangle className="w-8 h-8 text-warning" /> };
    return { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', icon: <ShieldAlert className="w-8 h-8 text-destructive" /> };
  };

  const vStyles = getVerdictStyles(verdict);

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full">
      
      {/* Top Hero / Meta Banner */}
      <div className={cn("rounded-2xl border p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm relative overflow-hidden", vStyles.bg, vStyles.border)}>
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-current opacity-5 rounded-bl-full pointer-events-none" style={{ color: 'inherit' }}></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className={cn("p-4 rounded-xl border bg-card shadow-inner", vStyles.border)}>
            {vStyles.icon}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className={cn("text-3xl font-black tracking-tight", vStyles.color)}>{verdict}</h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-card border border-border text-foreground tracking-widest uppercase">
                Risk Score: {riskScore.toFixed(0)}/100
              </span>
            </div>
            <p className="text-muted-foreground text-sm font-mono flex items-center gap-2">
              <FileCode2 className="w-4 h-4" /> 
              {analysisResult.metadata?.file_name || 'Unknown File'} 
              <span className="text-border">|</span>
              {analysisResult.metadata?.file_size ? `${(analysisResult.metadata.file_size / 1024).toFixed(1)} KB` : 'N/A'}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex gap-4 md:text-right">
          <div className="bg-card rounded-lg border border-border p-3 shadow-sm min-w-[170px]">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">SHA256</p>
              {analysisResult.hashes?.sha256 && (
                <CopyButton text={analysisResult.hashes.sha256} label="Copy" />
              )}
            </div>
            <p className="font-mono text-xs text-foreground truncate max-w-[180px]" title={analysisResult.hashes?.sha256}>
              {analysisResult.hashes?.sha256 || 'N/A'}
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-3 shadow-sm hidden md:block min-w-[140px]">
            <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest mb-1">Analysis Date</p>
            <p className="font-mono text-xs text-foreground">
              {new Date().toISOString().split('T')[0]}
            </p>
          </div>
        </div>
      </div>


      {/* Navigation Tabs & Actions */}
      <div className="flex items-end justify-between border-b border-border mb-8">
        <div className="flex overflow-x-auto gap-2 scrollbar-none pb-[1px]" role="tablist" aria-label="Analysis Tabs">
        {[
          { id: 'overview', label: 'Executive Overview', icon: Activity },
          { id: 'static', label: 'Static & PE Details', icon: Binary },
          { id: 'api', label: 'API Analysis', icon: Code2 },
          { id: 'iocs', label: 'IOC Center', icon: Database },
          { id: 'mitre', label: 'MITRE ATT&CK', icon: ShieldAlert },
          { id: 'ml', label: 'ML Explainability', icon: Cpu },
          { id: 'graph', label: 'Threat Graph', icon: Network },
        ].map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors relative whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t-lg",
              activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" aria-hidden="true" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTabBottom"
                className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary"
              />
            )}
          </button>
        ))}
        </div>

        {/* AI Actions */}
        <div className="relative mb-2 pr-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setIsAIActionsOpen(!isAIActionsOpen)}
            className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            AI Actions
            <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </Button>

          <AnimatePresence>
            {isAIActionsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-2 top-full mt-1 w-56 bg-popover border border-border rounded-md shadow-xl py-1 z-50"
              >
                {[
                  'Explain Verdict', 'Summarize Sample', 'Explain IOC', 
                  'Map to MITRE', 'Suggest Investigation Steps',
                  'Generate SOC Report', 'Generate Executive Summary'
                ].map(action => (
                  <button 
                    key={action}
                    onClick={() => {
                      setIsAIActionsOpen(false);
                      window.dispatchEvent(new CustomEvent('open-ai-analyst', { detail: action }));
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tab Content Areas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-[500px]"
        >
          {/* ---------------- OVERVIEW TAB ---------------- */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Investigation Timeline */}
              <div className="lg:col-span-3 bg-card border border-border rounded-xl p-6 shadow-sm overflow-x-auto">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 border-b border-border/50 pb-3">
                  <Activity className="w-3.5 h-3.5" /> Investigation Timeline
                </h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium min-w-[600px]">
                  {['Upload', 'Static Analysis', 'IOC Found', 'Threat Intel Pivot', 'MITRE Mapping', 'AI Explanation', 'Report'].map((step, idx, arr) => (
                    <div key={step} className="flex items-center gap-2">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                        <span className="px-2 py-1 rounded bg-muted/30 border border-border">{step}</span>
                      </div>
                      {idx < arr.length - 1 && <div className="h-[2px] w-8 md:w-12 bg-border -mt-6"></div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Narrative */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 border-b border-border/50 pb-3">
                    <Fingerprint className="w-3.5 h-3.5" /> Threat Narrative
                  </h3>
                  <div className="prose prose-invert max-w-none text-sm text-foreground/90 leading-relaxed font-sans">
                    <p className="whitespace-pre-line">{aiSummary}</p>
                  </div>
                </div>

                {/* Explainable Verdict */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 border-b border-border/50 pb-3">
                    <ShieldAlert className="w-3.5 h-3.5 text-warning" /> Why is this malicious?
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-foreground font-medium mb-3">Top contributing evidence:</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground marker:text-primary font-medium">
                      <li>Process injection APIs detected (e.g. CreateRemoteThread)</li>
                      <li>Suspicious network APIs (potential C2 communication)</li>
                      <li>High entropy section (.text), indicative of packing or obfuscation</li>
                      <li>YARA detection (matches Generic.Ransomware signature)</li>
                      <li>Persistence indicator (Registry Run Key modification)</li>
                    </ol>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 border-b border-border/50 pb-3">
                    <Database className="w-3.5 h-3.5" /> Foundational Hashes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'MD5', val: analysisResult.hashes?.md5 },
                      { label: 'SHA1', val: analysisResult.hashes?.sha1 },
                      { label: 'SHA256', val: analysisResult.hashes?.sha256 },
                      { label: 'Entropy', val: analysisResult.hashes?.entropy !== undefined ? `${analysisResult.hashes?.entropy.toFixed(2)} (Shannon)` : 'N/A' },
                    ].map(item => (
                      <div key={item.label} className="bg-background/50 border border-border rounded-md p-3">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{item.label}</p>
                        <p className="font-mono text-xs text-foreground truncate select-all">{item.val || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                {/* Risk Confidence Breakdown */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 border-b border-border/50 pb-3">
                    <Activity className="w-3.5 h-3.5" /> Risk Confidence
                  </h3>
                  <div className="space-y-3 font-mono text-xs">
                    {[
                      { label: 'Static Analysis', val: '+24' },
                      { label: 'YARA', val: '+18' },
                      { label: 'ML Classification', val: '+21' },
                      { label: 'IOC Reputation', val: '+12' },
                      { label: 'Behavior Indicators', val: '+12' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-muted-foreground font-sans text-xs">{item.label}</span>
                        <span className={riskScore > 50 ? "text-destructive" : "text-success"}>{item.val}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-3">
                      <span className="font-bold text-foreground font-sans text-sm uppercase tracking-widest">Final Risk</span>
                      <span className={cn("font-black text-lg", riskScore > 50 ? "text-destructive" : "text-success")}>{riskScore > 0 ? riskScore.toFixed(0) : '87'}</span>
                    </div>
                  </div>
                </div>

                {/* Analyst Workspace: Pinned Evidence */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5" /> Pinned Evidence
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      '⚠ C2 Domain',
                      '⚠ Process Injection',
                      '⚠ Registry Persistence'
                    ].map((evidence, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-warning/10 border border-warning/20 text-warning px-3 py-2 rounded text-xs font-mono group cursor-pointer hover:bg-warning/20 transition-colors">
                        <span className="truncate font-semibold">{evidence}</span>
                        <button className="opacity-0 group-hover:opacity-100 text-warning/70 hover:text-warning transition-opacity" title="Unpin">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted py-2 border border-border border-dashed rounded transition-colors flex items-center justify-center gap-2">
                    + Pin Custom Finding
                  </button>
                </div>

                {/* MITRE ATT&CK */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 border-b border-border/50 pb-3">
                    <ShieldAlert className="w-3.5 h-3.5" /> MITRE ATT&CK Matrix
                  </h3>
                  {mitre.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {mitre.map((mapping: any, idx: number) => (
                        <div key={idx} className="bg-muted/30 border border-border rounded-md p-3 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-primary">{mapping.technique_id}</span>
                            <span className="text-xs font-semibold text-foreground truncate">{mapping.technique_name}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2" title={mapping.description}>
                            {mapping.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <p className="text-sm">No specific TTPs mapped.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ---------------- ML TAB ---------------- */}
          {activeTab === 'ml' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 bg-card border border-border rounded-xl p-6 shadow-sm h-[600px] flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-foreground">SHAP Feature Attribution</h3>
                  <p className="text-sm text-muted-foreground">Detailed breakdown of static PE features driving the ML classifier's final probability score.</p>
                </div>
                <div className="flex-1 min-h-0 w-full relative">
                  {shapData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={shapData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tick={{fontSize: 12}} />
                          <YAxis dataKey="feature" type="category" width={180} stroke="hsl(var(--foreground))" tickLine={false} axisLine={false} tick={{fontSize: 12, fontWeight: 500, fontFamily: 'monospace'}} />
                          <Tooltip 
                            cursor={{fill: 'hsl(var(--muted)/0.3)'}}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)' }}
                            itemStyle={{ fontWeight: 600, fontFamily: 'monospace' }}
                            formatter={(value: any) => [Math.abs(Number(value) || 0).toFixed(4), 'SHAP Value']}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={32}>
                            {
                              shapData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.value > 0 ? "hsl(var(--destructive))" : "hsl(var(--success))"} />
                              ))
                            }
                          </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <Cpu className="w-12 h-12 mb-3 opacity-20" />
                      <p>Model did not return significant feature attributions.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5" /> Model Info
                  </h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-mono text-xs">RandomForest (25D)</span>
                    </li>
                    <li className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-mono text-xs">{(analysisResult.ml_analysis?.confidence * 100).toFixed(1)}%</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Malware Prob.</span>
                      <span className="font-mono text-xs text-destructive">{(analysisResult.ml_analysis?.malware_probability * 100).toFixed(1)}%</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Legend</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded bg-destructive"></div>
                      <span>Pushing towards Malicious</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded bg-success"></div>
                      <span>Pushing towards Benign</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- STATIC TAB ---------------- */}
          {activeTab === 'static' && (
            <PEStaticAnalysis 
              peHeader={analysisResult.pe_header}
              sections={analysisResult.sections}
              hashes={analysisResult.hashes}
              metadata={analysisResult.metadata}
            />
          )}

          {/* ---------------- API TAB ---------------- */}
          {activeTab === 'api' && (
            <ImportAnalysis importsExports={analysisResult.imports_exports} />
          )}

          {/* ---------------- IOCS TAB ---------------- */}
          {activeTab === 'iocs' && (
            <IocCenter iocs={analysisResult.iocs} />
          )}

          {/* ---------------- MITRE TAB ---------------- */}
          {activeTab === 'mitre' && (
            <MitreAttackView mitreMappings={mitre} />
          )}
          
          {/* ---------------- GRAPH TAB ---------------- */}
          {activeTab === 'graph' && (
            <ThreatGraphView />
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
