import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldAlert, CheckCircle, AlertTriangle, ShieldX, Activity, Database } from 'lucide-react';
import { cn } from './lib/utils';
import { motion } from 'framer-motion';
import { Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const API_BASE = 'http://localhost:8000/api/v1';

export default function DashboardMain() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchTarget = async () => {
      setLoading(true);
      try {
        let targetSha = location.state?.sha256;
        
        // If no specific sha256 passed, fetch the latest from history
        if (!targetSha) {
          const histRes = await fetch(`${API_BASE}/history?limit=1`);
          if (histRes.ok) {
            const histData = await histRes.json();
            if (histData.length > 0) {
              targetSha = histData[0].sha256;
            }
          }
        }

        if (targetSha) {
          const res = await fetch(`${API_BASE}/report/${targetSha}`);
          if (res.ok) {
            const data = await res.json();
            setAnalysisResult(data);
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTarget();
  }, [location.state]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        <div className="col-span-1 h-48 bg-muted/30 rounded-2xl"></div>
        <div className="col-span-2 h-48 bg-muted/30 rounded-2xl"></div>
        <div className="col-span-3 h-80 bg-muted/30 rounded-2xl"></div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <ShieldX className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-medium">No Analysis Data</h2>
        <p className="mt-2">Upload a payload in the 'New Analysis' tab to see metrics.</p>
      </div>
    );
  }

  const riskScore = analysisResult.risk_analysis?.risk_score || 0;
  const verdict = analysisResult.risk_analysis?.verdict || 'UNKNOWN';
  const aiSummary = analysisResult.ai_analysis?.executive_summary || 'No AI summary generated.';
  const mitre = analysisResult.ai_analysis?.mitre_attack_mappings || [];
  
  // Format SHAP data for chart
  let shapData = [];
  if (analysisResult.ml_analysis?.shap_explainability?.top_pushing_malware) {
    shapData = analysisResult.ml_analysis.shap_explainability.top_pushing_malware.map((item: any) => ({
      feature: item.feature,
      value: item.shap_value,
      type: 'Malicious Indicator'
    })).slice(0, 4);
    if (analysisResult.ml_analysis?.shap_explainability?.top_pushing_benign) {
       const benign = analysisResult.ml_analysis.shap_explainability.top_pushing_benign.map((item: any) => ({
         feature: item.feature,
         value: -item.shap_value,
         type: 'Benign Indicator'
       })).slice(0, 2);
       shapData = [...shapData, ...benign];
    }
  }

  const getVerdictColor = (v: string) => {
    if (v === 'CLEAN / LOW RISK') return 'text-green-500';
    if (v === 'SUSPICIOUS') return 'text-yellow-500';
    if (v === 'HIGH RISK') return 'text-orange-500';
    return 'text-destructive';
  };

  const VerdictIcon = () => {
    if (verdict === 'CLEAN / LOW RISK') return <CheckCircle className="w-10 h-10 text-green-500" />;
    if (verdict === 'SUSPICIOUS') return <AlertTriangle className="w-10 h-10 text-yellow-500" />;
    return <ShieldAlert className="w-10 h-10 text-destructive" />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {/* File Info Header */}
      <div className="col-span-3 mb-2 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Analysis Overview</h2>
        <div className="text-sm px-4 py-2 bg-background/50 border border-border rounded-full flex items-center gap-2 text-muted-foreground shadow-sm backdrop-blur-md">
          <span>Target:</span>
          <span className="font-mono text-foreground">{analysisResult.metadata?.file_name}</span>
        </div>
      </div>

      {/* Risk Card */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="col-span-1 bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-xl relative overflow-hidden group"
      >
        <div className={cn(
          "absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-8 -mt-8 transition-transform duration-700 group-hover:scale-125 opacity-10",
          verdict === 'CLEAN / LOW RISK' ? "bg-green-500" : verdict === 'SUSPICIOUS' ? "bg-yellow-500" : "bg-destructive"
        )}></div>
        
        <div className="flex items-start justify-between mb-8 relative z-10">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Threat Verdict</h3>
            <div className={cn("text-2xl font-black mt-1", getVerdictColor(verdict))}>{verdict}</div>
          </div>
          <div className="p-2 bg-background/50 rounded-xl backdrop-blur-md border border-border/50 shadow-sm">
            <VerdictIcon />
          </div>
        </div>
        
        <div className="flex items-end justify-between relative z-10">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-black tracking-tighter">{riskScore.toFixed(0)}</span>
              <span className="text-xl text-muted-foreground font-medium">/100</span>
            </div>
            <div className="text-sm text-muted-foreground mt-2 font-medium">Unified Risk Score</div>
          </div>
        </div>
      </motion.div>

      {/* AI Explanation Card */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="col-span-2 bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-xl flex flex-col"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">AI Analyst Executive Summary</h3>
        <div className="bg-background/40 rounded-xl p-5 border border-border/50 text-sm leading-relaxed overflow-y-auto flex-1 shadow-inner">
          <p className="text-foreground/90 whitespace-pre-line">
            {aiSummary}
          </p>
        </div>
        
        {mitre.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-2">
            {mitre.map((mapping: any, idx: number) => (
              <div 
                key={idx} 
                className="bg-muted/50 hover:bg-muted transition-colors px-3 py-1.5 rounded-lg border border-border/50 text-xs font-semibold shadow-sm cursor-help" 
                title={mapping.description}
              >
                <span className="text-primary mr-1">{mapping.technique_id}</span> 
                {mapping.technique_name}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* SHAP Feature Importance */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="col-span-1 md:col-span-3 bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-xl h-96 flex flex-col"
      >
         <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">ML Feature Explanations (SHAP)</h3>
         <div className="flex-1 min-h-0">
           {shapData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shapData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis dataKey="feature" type="category" width={160} stroke="hsl(var(--foreground))" tickLine={false} axisLine={false} tick={{fontSize: 13, fontWeight: 500}} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted)/0.3)'}}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={40}>
                    {
                      shapData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.value > 0 ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
                      ))
                    }
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
               <Activity className="w-10 h-10 mb-2 opacity-20" />
               <p>Model did not return significant feature attributions.</p>
             </div>
           )}
         </div>
      </motion.div>
      
      {/* Detailed Technical View */}
      <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div whileHover={{ y: -5 }} className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-xl">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Fusion Engine Scores
          </h4>
          <ul className="space-y-3 text-sm">
            {[
              { label: 'Heuristics Score', val: analysisResult.risk_analysis?.components?.heuristics_score },
              { label: 'YARA Score', val: analysisResult.risk_analysis?.components?.yara_score },
              { label: 'ML Score', val: analysisResult.risk_analysis?.components?.ml_score },
              { label: 'IOC Score', val: analysisResult.risk_analysis?.components?.ioc_score },
            ].map(item => (
              <li key={item.label} className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                <span className="font-medium">{item.label}</span>
                <span className="font-mono bg-muted px-2 py-1 rounded text-xs">{(item.val || 0).toFixed(1)}/100</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-xl overflow-hidden">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
            <Database className="w-4 h-4" /> File Hashes
          </h4>
          <ul className="space-y-3 text-sm break-all">
            {[
              { label: 'MD5', val: analysisResult.hashes?.md5 },
              { label: 'SHA1', val: analysisResult.hashes?.sha1 },
              { label: 'SHA256', val: analysisResult.hashes?.sha256 },
            ].map(item => (
              <li key={item.label} className="flex flex-col gap-1 p-3 bg-background/50 rounded-lg border border-border/50">
                <span className="font-bold text-xs text-muted-foreground">{item.label}</span>
                <span className="font-mono text-foreground text-xs">{item.val}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

    </motion.div>
  );
}
