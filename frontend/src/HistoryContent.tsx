import { useState, useEffect } from 'react';
import { cn } from './lib/utils';
import { motion } from 'framer-motion';
import { FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api/v1';

export default function HistoryContent() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (v: string) => {
    if (v === 'CLEAN / LOW RISK') return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (v === 'SUSPICIOUS') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    if (v === 'HIGH RISK') return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-destructive bg-destructive/10 border-destructive/20';
  };

  const getProgressBarColor = (score: number) => {
    if (score > 75) return 'bg-destructive';
    if (score > 40) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Threat History</h2>
          <p className="text-muted-foreground">Log of all previously analyzed payloads.</p>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-card/90 border-b border-border/50 text-sm">
              <tr>
                <th className="p-5 font-semibold text-muted-foreground">Payload Identifier</th>
                <th className="p-5 font-semibold text-muted-foreground">Timestamp</th>
                <th className="p-5 font-semibold text-muted-foreground">Verdict</th>
                <th className="p-5 font-semibold text-muted-foreground">Risk Score</th>
                <th className="p-5 font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-5"><div className="h-5 bg-muted rounded w-3/4"></div></td>
                    <td className="p-5"><div className="h-5 bg-muted rounded w-1/2"></div></td>
                    <td className="p-5"><div className="h-6 bg-muted rounded-full w-24"></div></td>
                    <td className="p-5"><div className="h-5 bg-muted rounded w-full"></div></td>
                    <td className="p-5"><div className="h-5 bg-muted rounded w-8"></div></td>
                  </tr>
                ))
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 mb-4 opacity-20" />
                      <p>No analysis records found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((record, index) => (
                  <motion.tr 
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="p-5">
                      <div className="font-medium text-foreground">{record.file_name}</div>
                      <div className="text-xs text-muted-foreground mt-1 font-mono truncate max-w-[200px]">{record.sha256}</div>
                    </td>
                    <td className="p-5 text-sm text-muted-foreground">
                      {new Date(record.created_at).toLocaleString()}
                    </td>
                    <td className="p-5">
                      <span className={cn("px-3 py-1 text-xs font-bold rounded-full border", getVerdictColor(record.verdict))}>
                        {record.verdict}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-background/50 rounded-full overflow-hidden border border-border/50">
                          <div 
                            className={cn("h-full transition-all duration-1000", getProgressBarColor(record.risk_score))} 
                            style={{ width: `${record.risk_score}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-sm">{record.risk_score.toFixed(0)}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <button 
                        onClick={() => navigate('/', { state: { sha256: record.sha256 } })}
                        className="text-primary hover:text-primary/80 transition-colors p-2 rounded-lg hover:bg-primary/10 flex items-center gap-2 text-sm font-medium"
                      >
                        Report <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
