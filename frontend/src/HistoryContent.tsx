import { useState, useEffect } from 'react';
import { Database, Search, ChevronLeft, ChevronRight, Activity, ShieldAlert, CheckCircle, AlertTriangle, ExternalLink, Filter } from 'lucide-react';
import { cn } from './lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:8000/api/v1';

export default function HistoryContent() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 15;
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/history?skip=${page * limit}&limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  };

  const getVerdictStyles = (v: string) => {
    if (v === 'CLEAN / LOW RISK') return { color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', icon: <CheckCircle className="w-3.5 h-3.5" /> };
    if (v === 'SUSPICIOUS') return { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', icon: <AlertTriangle className="w-3.5 h-3.5" /> };
    return { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', icon: <ShieldAlert className="w-3.5 h-3.5" /> };
  };

  const filteredHistory = history.filter(item => 
    item.sha256.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.file_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col h-[calc(100vh-64px)]">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3 text-foreground">
            <Database className="w-7 h-7 text-primary" />
            Threat History
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Archive of all payloads processed by the Zeravynex analysis cluster.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Filter by SHA256 or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 bg-card border border-border rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-mono shadow-sm"
            />
          </div>
          <button className="bg-card hover:bg-muted border border-border text-foreground px-3 py-2 rounded-md transition-colors shadow-sm focus:outline-none">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10">
            <Activity className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-sm font-medium text-foreground">Querying database...</p>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border sticky top-0 z-20 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 font-bold">Timestamp</th>
                <th className="px-6 py-4 font-bold">SHA-256 Hash</th>
                <th className="px-6 py-4 font-bold">File Name</th>
                <th className="px-6 py-4 font-bold">Risk Score</th>
                <th className="px-6 py-4 font-bold">Final Verdict</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item, idx) => {
                  const vStyles = getVerdictStyles(item.verdict);
                  const date = new Date(item.created_at);
                  return (
                    <motion.tr 
                      key={item.id} 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-[11px] text-muted-foreground">
                        {date.toISOString().split('T')[0]} <span className="text-border mx-1">|</span> {date.toISOString().split('T')[1].substring(0, 8)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary/50"></span>
                          <span className="font-mono text-xs text-foreground tracking-tight" title={item.sha256}>
                            {item.sha256.substring(0, 16)}...{item.sha256.substring(item.sha256.length - 8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium max-w-[200px] truncate" title={item.file_name}>
                        {item.file_name || 'unknown_sample.exe'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-mono font-bold text-xs", vStyles.color)}>{item.risk_score.toFixed(0)}</span>
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={cn("h-full", vStyles.bg.replace('/10', ''))} style={{ width: `${item.risk_score}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold tracking-widest uppercase", vStyles.bg, vStyles.border, vStyles.color)}>
                          {vStyles.icon}
                          {item.verdict}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate('/', { state: { sha256: item.sha256 } })}
                          className="inline-flex items-center gap-1.5 bg-background hover:bg-muted border border-border text-foreground px-3 py-1.5 rounded-md text-xs font-semibold transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm"
                        >
                          View Report <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    {!loading && "No historical analysis records found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="border-t border-border bg-card p-3 flex items-center justify-between shrink-0">
          <span className="text-xs text-muted-foreground font-medium pl-2">
            Showing {filteredHistory.length} records on page {page + 1}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="p-1.5 rounded-md border border-border bg-background hover:bg-muted text-foreground disabled:opacity-50 transition-colors shadow-sm focus:outline-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={history.length < limit || loading}
              className="p-1.5 rounded-md border border-border bg-background hover:bg-muted text-foreground disabled:opacity-50 transition-colors shadow-sm focus:outline-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
