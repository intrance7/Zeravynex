import { useState, useEffect } from 'react';
import { Database, Search, ChevronLeft, ChevronRight, Activity, ShieldAlert, CheckCircle, AlertTriangle, ExternalLink, Filter, Download, Tags, Trash2, CheckSquare, Square } from 'lucide-react';
import { cn } from './lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import EmptyState from './EmptyState';

const API_BASE = 'http://localhost:8000/api/v1';

export default function HistoryContent() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced filters state
  const [filters, setFilters] = useState({
    verdict: 'all',
    malwareFamily: '',
    architecture: 'all',
    fileType: 'all',
    minScore: 0
  });

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
      } else {
        generateMockHistory();
      }
    } catch (err) {
      console.error("Failed to load history:", err);
      generateMockHistory();
    } finally {
      setLoading(false);
    }
  };

  const generateMockHistory = () => {
    const mockData = Array.from({ length: 15 }).map((_, i) => ({
      id: `mock-${i}-${Date.now()}`,
      sha256: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      file_name: `sample_${i}.exe`,
      risk_score: Math.random() * 100,
      verdict: Math.random() > 0.7 ? 'CRITICAL' : Math.random() > 0.4 ? 'SUSPICIOUS' : 'CLEAN / LOW RISK',
      created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      architecture: Math.random() > 0.5 ? 'x64' : 'x86',
      file_type: 'PE32',
      tags: Math.random() > 0.5 ? ['APT', 'Ransomware'] : []
    }));
    setHistory(mockData);
  }

  const getVerdictStyles = (v: string) => {
    if (v === 'CLEAN / LOW RISK') return { color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', icon: <CheckCircle className="w-3.5 h-3.5 text-success" /> };
    if (v === 'SUSPICIOUS') return { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', icon: <AlertTriangle className="w-3.5 h-3.5 text-warning" /> };
    return { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', icon: <ShieldAlert className="w-3.5 h-3.5 text-destructive" /> };
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === history.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(history.map(item => item.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkExport = () => {
    toast.success(`Exporting ${selectedIds.size} samples...`);
  };

  const handleBulkTag = () => {
    toast.success(`Opening tag editor for ${selectedIds.size} samples...`);
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.sha256.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.file_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVerdict = filters.verdict === 'all' || item.verdict === filters.verdict;
    const matchesScore = item.risk_score >= filters.minScore;
    return matchesSearch && matchesVerdict && matchesScore;
  });

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3 text-foreground">
            <Database className="w-7 h-7 text-primary" />
            Sample History
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Archive of all payloads processed by the Zeravynex analysis cluster.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search SHA256, Name, Tag..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 md:w-80 bg-card border border-border rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-mono shadow-sm"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn("px-3 py-2 rounded-md transition-colors shadow-sm focus:outline-none flex items-center gap-2 text-sm font-semibold border",
                showFilters ? "bg-primary/10 text-primary border-primary/30" : "bg-card hover:bg-muted text-foreground border-border"
              )}
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden shrink-0 mb-6"
          >
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5 block">Verdict</label>
                <select 
                  value={filters.verdict}
                  onChange={(e) => setFilters({...filters, verdict: e.target.value})}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="all">All Verdicts</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="SUSPICIOUS">Suspicious</option>
                  <option value="CLEAN / LOW RISK">Clean / Low Risk</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5 block">Min Risk Score</label>
                <input 
                  type="number" 
                  min="0" max="100"
                  value={filters.minScore}
                  onChange={(e) => setFilters({...filters, minScore: Number(e.target.value)})}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5 block">Architecture</label>
                <select 
                  value={filters.architecture}
                  onChange={(e) => setFilters({...filters, architecture: e.target.value})}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="all">All Architectures</option>
                  <option value="x64">x64</option>
                  <option value="x86">x86</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5 block">File Type</label>
                <select 
                  value={filters.fileType}
                  onChange={(e) => setFilters({...filters, fileType: e.target.value})}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="PE32">PE32</option>
                  <option value="ELF">ELF</option>
                  <option value="Mach-O">Mach-O</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col relative min-h-0">
        
        {/* Bulk Actions Bar */}
        <div className="h-14 border-b border-border bg-muted/20 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSelectAll}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              {selectedIds.size === history.length && history.length > 0 ? (
                <CheckSquare className="w-5 h-5 text-primary" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
            <span className="text-sm font-medium text-foreground">
              {selectedIds.size} selected
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBulkTag}
              disabled={selectedIds.size === 0}
              className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-md text-xs font-semibold hover:bg-muted disabled:opacity-50 transition-colors"
            >
              <Tags className="w-3.5 h-3.5" /> Bulk Tag
            </button>
            <button 
              onClick={handleBulkExport}
              disabled={selectedIds.size === 0}
              className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-md text-xs font-semibold hover:bg-muted disabled:opacity-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button 
              disabled={selectedIds.size === 0}
              className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-xs font-semibold hover:bg-destructive/20 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 pt-14">
            <Activity className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-sm font-medium text-foreground">Querying database...</p>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border sticky top-0 z-20 backdrop-blur-md">
              <tr>
                <th className="px-4 py-4 w-12 text-center"></th>
                <th className="px-6 py-4 font-bold">Timestamp</th>
                <th className="px-6 py-4 font-bold">Sample</th>
                <th className="px-6 py-4 font-bold">Tags</th>
                <th className="px-6 py-4 font-bold">Risk Score</th>
                <th className="px-6 py-4 font-bold">Verdict</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item, idx) => {
                  const vStyles = getVerdictStyles(item.verdict);
                  const date = new Date(item.created_at);
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <motion.tr 
                      key={item.id} 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.1, delay: idx * 0.02 }}
                      className={cn(
                        "hover:bg-muted/30 transition-colors group",
                        isSelected ? "bg-primary/5" : ""
                      )}
                    >
                      <td className="px-4 py-4 text-center">
                        <button 
                          onClick={() => toggleSelect(item.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-primary" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-muted-foreground">
                        {date.toISOString().split('T')[0]} <span className="text-border mx-1">|</span> {date.toISOString().split('T')[1].substring(0, 8)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-foreground font-medium max-w-[200px] truncate" title={item.file_name}>
                            {item.file_name || 'unknown_sample.exe'}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground mt-0.5 tracking-tight" title={item.sha256}>
                            {item.sha256.substring(0, 16)}...{item.sha256.substring(item.sha256.length - 8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5">
                          {item.tags?.map((tag: string) => (
                            <span key={tag} className="px-2 py-0.5 bg-muted rounded text-[10px] font-bold text-muted-foreground border border-border">
                              {tag}
                            </span>
                          ))}
                          {(!item.tags || item.tags.length === 0) && (
                            <span className="text-muted-foreground/50 text-[10px] italic">No tags</span>
                          )}
                        </div>
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
                          onClick={() => navigate('/dashboard', { state: { sha256: item.sha256 } })}
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
                  <td colSpan={7} className="p-0">
                    {!loading && (
                      <EmptyState 
                        icon={<Database className="w-8 h-8" />}
                        title="No analysis history found."
                        description="There are no historical records matching your current filters. Try adjusting your search criteria or submit a new analysis."
                      />
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="border-t border-border bg-muted/20 p-3 flex items-center justify-between shrink-0">
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
