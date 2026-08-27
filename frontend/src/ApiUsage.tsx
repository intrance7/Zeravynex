import React, { useMemo } from 'react';
import { Activity, Clock, Zap, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ApiUsage() {
  const data = useMemo(() => {
    const generateData = () => {
      const now = new Date();
      return Array.from({ length: 30 }).map((_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          requests: Math.floor(Math.random() * 50000) + 10000,
        };
      });
    };
    return generateData();
  }, []);

  return (
    <div className="flex-1 h-full w-full overflow-y-auto bg-background p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">API Usage</h1>
          <p className="text-muted-foreground">Monitor your API consumption, rate limits, and performance metrics.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Requests this month
              </h3>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">1.2M</div>
                <div className="text-xs text-muted-foreground mt-1 text-success flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1" /> +12% from last month
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning" /> Rate limit
              </h3>
            </div>
            <div className="flex items-end justify-between">
              <div className="w-full">
                <div className="text-2xl font-bold text-foreground mb-2">1,000 / min</div>
                <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-warning h-full rounded-full" style={{ width: '45%' }}></div>
                </div>
                <div className="text-xs text-muted-foreground mt-2 text-right">450 rpm current</div>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" /> Errors
              </h3>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">0.05%</div>
                <div className="text-xs text-muted-foreground mt-1 text-success flex items-center">
                  <ArrowDownRight className="w-3 h-3 mr-1" /> -0.02% from last month
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" /> Latency
              </h3>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">42ms</div>
                <div className="text-xs text-muted-foreground mt-1">Avg response time (P95)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">API Requests (30 Days)</h2>
            <select className="bg-background border border-border text-sm rounded-md px-3 py-1.5 text-foreground outline-none focus:ring-1 focus:ring-primary">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Today</option>
            </select>
          </div>
          
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRequests)" 
                  activeDot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
