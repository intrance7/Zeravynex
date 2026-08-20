import { useState, useRef, useEffect } from 'react';
import { Shield, ShieldAlert, Activity, FileSearch, UploadCloud, Settings, Database, Server, CheckCircle, AlertTriangle, AlertCircle, Trash2 } from 'lucide-react';
import { cn } from './lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

// API Base URL - Assuming FastAPI runs on 8000
const API_BASE = 'http://localhost:8000/api/v1';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Fetch full report
        const reportRes = await fetch(`${API_BASE}/report/${data.sha256}`);
        const reportData = await reportRes.json();
        setAnalysisResult(reportData);
        setActiveTab('dashboard');
        fetchHistory(); // Refresh history
      } else {
        alert(`Analysis failed: ${data.detail}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to backend server. Is it running?');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const viewReport = async (sha256: string) => {
    try {
      const reportRes = await fetch(`${API_BASE}/report/${sha256}`);
      const reportData = await reportRes.json();
      setAnalysisResult(reportData);
      setActiveTab('dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  // Derive display values from analysisResult or use defaults
  const isAnalyzed = !!analysisResult;
  const riskScore = isAnalyzed ? analysisResult.risk_analysis?.risk_score : 0;
  const verdict = isAnalyzed ? analysisResult.risk_analysis?.verdict : 'NO DATA';
  const fileName = isAnalyzed ? analysisResult.metadata?.file_name : '';
  const aiSummary = isAnalyzed ? analysisResult.ai_analysis?.executive_summary : 'Upload a file to generate an AI Analyst summary.';
  
  let shapData = [];
  if (isAnalyzed && analysisResult.ml_analysis?.shap_explainability?.top_pushing_malware) {
    shapData = analysisResult.ml_analysis.shap_explainability.top_pushing_malware.map((item: any) => ({
      feature: item.feature,
      value: item.shap_value
    })).slice(0, 5); // top 5
    // Add top benign to show negative values
    if (analysisResult.ml_analysis?.shap_explainability?.top_pushing_benign) {
       const benign = analysisResult.ml_analysis.shap_explainability.top_pushing_benign.map((item: any) => ({
         feature: item.feature,
         value: -item.shap_value
       })).slice(0, 3);
       shapData = [...shapData, ...benign];
    }
  }

  // Get dynamic colors based on verdict
  const getVerdictColor = (v: string) => {
    if (v === 'CLEAN / LOW RISK') return 'text-green-500';
    if (v === 'SUSPICIOUS') return 'text-yellow-500';
    if (v === 'HIGH RISK') return 'text-orange-500';
    return 'text-destructive';
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      
      {/* Sidebar */}
      <div className="w-64 bg-card/40 backdrop-blur-md border-r border-border p-4 flex flex-col justify-between z-10">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2 mt-4">
            <Shield className="w-8 h-8 text-primary animate-pulse-slow" />
            <h1 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">ZERAVYNEX</h1>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: Activity, label: 'Dashboard' },
              { id: 'analysis', icon: FileSearch, label: 'New Analysis' },
              { id: 'history', icon: Database, label: 'History' },
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
        
        <div className="px-4 py-3 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" /> v1.6.0 Core
          </div>
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-green-500" /> API Online
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-destructive/20 blur-[120px]"></div>
        </div>

        <header className="mb-8 flex justify-between items-end relative z-10">
          <div>
            <h2 className="text-3xl font-bold mb-1">Security Dashboard</h2>
            <p className="text-muted-foreground">Explainable AI Malware Analysis Platform</p>
          </div>
          
          {fileName && (
            <div className="flex items-center gap-3 bg-card/60 backdrop-blur-md px-4 py-2 rounded-full border border-border">
              <span className="text-sm text-muted-foreground">Active File:</span>
              <span className="text-sm font-medium">{fileName}</span>
            </div>
          )}
        </header>

        <div className="relative z-10">
          {activeTab === 'analysis' && (
            <div className="max-w-2xl mx-auto mt-20 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-card/80 backdrop-blur-xl border border-border p-12 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-300">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <UploadCloud className={cn("w-12 h-12 text-primary", isUploading ? "animate-pulse" : "animate-float")} />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Drop PE File Here</h3>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Upload a Windows executable (.exe, .dll) for deep static analysis, heuristics, YARA, and ML evaluation.
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload} 
                  accept=".exe,.dll,.sys"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={cn(
                    "bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transform hover:-translate-y-1",
                    isUploading && "opacity-70 cursor-not-allowed transform-none shadow-none hover:shadow-none"
                  )}
                >
                  {isUploading ? 'Analyzing...' : 'Select File'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-card/50 backdrop-blur-lg border border-border rounded-xl shadow-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-card/80 border-b border-border">
                  <tr>
                    <th className="p-4 font-medium text-muted-foreground">File Name</th>
                    <th className="p-4 font-medium text-muted-foreground">Date</th>
                    <th className="p-4 font-medium text-muted-foreground">Verdict</th>
                    <th className="p-4 font-medium text-muted-foreground">Risk Score</th>
                    <th className="p-4 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No analysis history found.</td></tr>
                  ) : (
                    history.map((record) => (
                      <tr key={record.id} className="hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-medium">{record.file_name}</td>
                        <td className="p-4 text-muted-foreground">{new Date(record.created_at).toLocaleString()}</td>
                        <td className={cn("p-4 font-semibold", getVerdictColor(record.verdict))}>{record.verdict}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-background rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${record.risk_score}%`, backgroundColor: record.risk_score > 75 ? 'hsl(var(--destructive))' : record.risk_score > 40 ? 'orange' : 'green' }}
                              ></div>
                            </div>
                            <span>{record.risk_score.toFixed(0)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => viewReport(record.sha256)}
                            className="text-primary hover:underline text-sm font-medium"
                          >
                            View Report
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Risk Card */}
              <div className="col-span-1 bg-card/50 backdrop-blur-lg border border-border rounded-xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-medium text-muted-foreground">Threat Verdict</h3>
                    <div className={cn("text-3xl font-bold mt-1", getVerdictColor(verdict))}>{verdict}</div>
                  </div>
                  {verdict === 'CLEAN / LOW RISK' ? <CheckCircle className="w-8 h-8 text-green-500" /> : 
                   verdict === 'SUSPICIOUS' ? <AlertTriangle className="w-8 h-8 text-yellow-500" /> : 
                   <ShieldAlert className="w-8 h-8 text-destructive" />}
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-5xl font-black">{riskScore.toFixed(0)}<span className="text-xl text-muted-foreground font-medium">/100</span></div>
                    <div className="text-sm text-muted-foreground mt-2">Unified Risk Score</div>
                  </div>
                </div>
              </div>

              {/* AI Explanation Card */}
              <div className="col-span-2 bg-card/50 backdrop-blur-lg border border-border rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-medium text-muted-foreground mb-4">AI Analyst Executive Summary</h3>
                <div className="bg-background/50 rounded-lg p-5 border border-border/50 text-sm leading-relaxed overflow-y-auto max-h-40">
                  <p className="text-foreground/90 whitespace-pre-line">
                    {aiSummary}
                  </p>
                </div>
                
                {isAnalyzed && analysisResult.ai_analysis?.mitre_attack_mappings?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {analysisResult.ai_analysis.mitre_attack_mappings.map((mapping: any, idx: number) => (
                      <div key={idx} className="bg-muted px-3 py-1 rounded border border-border/50 text-xs font-medium" title={mapping.description}>
                        {mapping.technique_id}: {mapping.technique_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SHAP Feature Importance */}
              <div className="col-span-1 md:col-span-3 bg-card/50 backdrop-blur-lg border border-border rounded-xl p-6 shadow-xl h-80">
                 <h3 className="text-lg font-medium text-muted-foreground mb-6">ML Feature Explanations (SHAP)</h3>
                 {shapData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={shapData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 20 }}>
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                        <YAxis dataKey="feature" type="category" width={150} stroke="hsl(var(--muted-foreground))" tick={{fill: "hsl(var(--muted-foreground))", fontSize: 12}} />
                        <Tooltip 
                          cursor={{fill: 'hsl(var(--muted)/0.3)'}}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {
                            shapData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.value > 0 ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
                            ))
                          }
                        </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                     Upload a file to see ML feature importance
                   </div>
                 )}
              </div>
              
              {/* Detailed Technical View */}
              {isAnalyzed && (
                <div className="col-span-1 md:col-span-3 bg-card/50 backdrop-blur-lg border border-border rounded-xl p-6 shadow-xl">
                  <h3 className="text-lg font-medium text-muted-foreground mb-4">Technical Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-background/50 p-4 rounded-lg border border-border">
                      <h4 className="font-medium mb-2 text-primary">Engine Scores</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex justify-between"><span>Heuristics Score</span><span>{analysisResult.risk_analysis?.components?.heuristics_score?.toFixed(1)}/100</span></li>
                        <li className="flex justify-between"><span>YARA Score</span><span>{analysisResult.risk_analysis?.components?.yara_score?.toFixed(1)}/100</span></li>
                        <li className="flex justify-between"><span>ML Score</span><span>{analysisResult.risk_analysis?.components?.ml_score?.toFixed(1)}/100</span></li>
                        <li className="flex justify-between"><span>IOC Score</span><span>{analysisResult.risk_analysis?.components?.ioc_score?.toFixed(1)}/100</span></li>
                      </ul>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg border border-border overflow-hidden">
                      <h4 className="font-medium mb-2 text-primary">File Hashes</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground break-all">
                        <li><strong>MD5:</strong> {analysisResult.hashes?.md5}</li>
                        <li><strong>SHA1:</strong> {analysisResult.hashes?.sha1}</li>
                        <li><strong>SHA256:</strong> {analysisResult.hashes?.sha256}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
