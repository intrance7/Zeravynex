import { ShieldAlert, Activity, Database, Search, FileCode2, Network, Shield, Hexagon, BarChart2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from './lib/utils';
import { motion } from 'framer-motion';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { Badge } from './components/ui/Badge';

export default function DashboardMain() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="w-7 h-7 text-primary" /> Overview
          </h1>
          <p className="text-muted-foreground mt-1">Analyst workspace and global threat telemetry.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/analyze">
            <Button className="flex items-center gap-2 shadow-sm font-medium">
              <Hexagon className="w-4 h-4" /> Analyze File
            </Button>
          </Link>
          <Button variant="outline" className="flex items-center gap-2 shadow-sm font-medium">
            <Search className="w-4 h-4" /> Search IOC
          </Button>
          <Button variant="outline" className="flex items-center gap-2 shadow-sm font-medium">
            <Plus className="w-4 h-4" /> New Investigation
          </Button>
        </div>
      </div>

      {/* Threat Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Samples Analyzed', value: '1,248', desc: 'Last 24h', icon: FileCode2, color: 'text-blue-500' },
          { label: 'Malicious', value: '86', desc: '7% of total', icon: ShieldAlert, color: 'text-destructive' },
          { label: 'Suspicious', value: '243', desc: '19% of total', icon: Activity, color: 'text-warning' },
          { label: 'Benign', value: '919', desc: '74% of total', icon: Shield, color: 'text-success' },
          { label: 'Critical Findings', value: '14', desc: 'Requires attention', icon: Network, color: 'text-destructive' },
        ].map((kpi, idx) => (
          <motion.div 
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-5">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
                <kpi.icon className={cn("w-4 h-4", kpi.color)} />
              </div>
              <h3 className="text-2xl font-black text-foreground">{kpi.value}</h3>
              <p className="text-xs text-muted-foreground mt-1">{kpi.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Investigations (Takes up 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" /> Recent Investigations
            </h2>
            <Link to="/dashboard/investigations" className="text-xs font-semibold text-primary hover:underline">View All</Link>
          </div>
          <Card className="overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">Sample / Indicator</th>
                  <th className="px-4 py-3 font-semibold">Verdict</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Analyst</th>
                  <th className="px-4 py-3 font-semibold text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  { name: 'invoice_v2.pdf.exe', verdict: 'CRITICAL', score: 92, user: 'admin', time: '10 min ago', color: 'text-destructive', bg: 'bg-destructive/10' },
                  { name: 'update_pkg_mac.dmg', verdict: 'SUSPICIOUS', score: 68, user: 'admin', time: '1 hr ago', color: 'text-warning', bg: 'bg-warning/10' },
                  { name: '192.168.100.45', verdict: 'MALICIOUS', score: 85, user: 'sys_auto', time: '2 hrs ago', color: 'text-destructive', bg: 'bg-destructive/10' },
                  { name: 'clean_setup.msi', verdict: 'BENIGN', score: 12, user: 'j.doe', time: '4 hrs ago', color: 'text-success', bg: 'bg-success/10' },
                  { name: 'unknown_blob.bin', verdict: 'SUSPICIOUS', score: 55, user: 'sys_auto', time: '5 hrs ago', color: 'text-warning', bg: 'bg-warning/10' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/10 transition-colors group cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{row.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={row.verdict === 'CRITICAL' || row.verdict === 'MALICIOUS' ? 'destructive' : row.verdict === 'SUSPICIOUS' ? 'warning' : 'success'}>
                        {row.verdict}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{row.score}</span>
                        <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={cn("h-full", row.score > 75 ? "bg-destructive" : row.score > 40 ? "bg-warning" : "bg-success")} style={{ width: `${row.score}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{row.user}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground text-right">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Threat Activity (Takes up 1 column) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary" /> Threat Activity
            </h2>
          </div>
          
          <div className="space-y-4">
            {/* Top MITRE Techniques */}
            <Card className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Top MITRE Techniques</h3>
              <div className="space-y-3">
                {[
                  { t: 'T1059', name: 'Command and Scripting', pct: 85 },
                  { t: 'T1055', name: 'Process Injection', pct: 62 },
                  { t: 'T1547', name: 'Boot or Logon Autostart', pct: 45 },
                  { t: 'T1082', name: 'System Info Discovery', pct: 30 },
                ].map(mitre => (
                  <div key={mitre.t}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-foreground"><span className="text-primary font-mono">{mitre.t}</span> {mitre.name}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/70 rounded-full" style={{ width: `${mitre.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Severity Distribution */}
            <Card className="p-5 flex items-center justify-center min-h-[180px]">
               <div className="text-center">
                 <div className="flex items-center justify-center gap-1 h-24 items-end mb-4 border-b border-border/50 pb-2">
                    <div className="w-8 bg-success/80 rounded-t-sm h-[74%]" title="Benign"></div>
                    <div className="w-8 bg-warning/80 rounded-t-sm h-[19%]" title="Suspicious"></div>
                    <div className="w-8 bg-destructive/80 rounded-t-sm h-[7%]" title="Malicious"></div>
                 </div>
                 <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Severity Distribution</p>
               </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
