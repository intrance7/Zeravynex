import { CreditCard, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { PRICING_TIERS } from './config/pricing';
import { useNavigate } from 'react-router-dom';

export default function BillingSettings() {
  const navigate = useNavigate();
  const currentPlanId = 'researcher';
  const currentPlan = PRICING_TIERS.find(t => t.id === currentPlanId) || PRICING_TIERS[0];
  
  const usageAnalyses = 72;
  const limitAnalyses = typeof currentPlan.limits.analyses === 'number' ? currentPlan.limits.analyses : 100;
  const usagePercentage = (usageAnalyses / limitAnalyses) * 100;
  
  const invoices = [
    { id: 'INV-2026-08', date: 'Aug 01, 2026', amount: '₹499.00', status: 'Paid' },
    { id: 'INV-2026-07', date: 'Jul 01, 2026', amount: '₹499.00', status: 'Paid' },
    { id: 'INV-2026-06', date: 'Jun 01, 2026', amount: '₹499.00', status: 'Paid' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          Billing & Usage
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your subscription, view payment history, and monitor usage limits.</p>
      </div>

      <hr className="border-border" />

      {/* Current Plan & Limits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Plan Card */}
        <div className="bg-background border border-border rounded-xl p-6 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
          <div className="mb-6 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Current Plan</p>
            <h3 className="text-2xl font-black text-foreground mb-2">{currentPlan.name}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-foreground">₹{currentPlan.monthlyPriceINR}</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard/pricing')}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-colors text-sm shadow-sm"
            >
              Upgrade Plan
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('simulate-limit'))}
              className="flex-1 bg-muted/50 border border-border hover:bg-muted text-foreground font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              Simulate Limit
            </button>
          </div>
        </div>

        {/* Usage Card */}
        <div className="bg-background border border-border rounded-xl p-6 flex flex-col justify-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Monthly Analysis Usage</p>
          
          <div className="mb-2 flex justify-between items-end">
            <span className="text-3xl font-black text-foreground">{usageAnalyses}</span>
            <span className="text-sm font-semibold text-muted-foreground mb-1">/ {limitAnalyses}</span>
          </div>
          
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden mb-3">
            <div 
              className={`h-full ${usagePercentage > 90 ? 'bg-destructive' : usagePercentage > 75 ? 'bg-warning' : 'bg-primary'}`} 
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            {usagePercentage > 90 ? (
              <p className="text-destructive font-semibold flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Nearing monthly limit</p>
            ) : (
              <p className="text-muted-foreground">Resets on Sep 01, 2026</p>
            )}
          </div>
        </div>

      </div>

      {/* Payment Method */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Payment Method</h3>
        <div className="bg-background border border-border rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-card border border-border rounded-lg shadow-sm">
              <CreditCard className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                •••• •••• •••• 4242 
                <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded border border-primary/20">Default</span>
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">Expires 12/28</p>
            </div>
          </div>
          <button className="text-sm font-semibold text-primary hover:underline">Update</button>
        </div>
      </div>

      {/* Invoices Table */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Billing History</h3>
        <div className="bg-background border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-card border-b border-border text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
                <tr>
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-foreground">{inv.id}</td>
                    <td className="px-6 py-4 text-muted-foreground">{inv.date}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">{inv.amount}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3" /> {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-xs font-semibold">
                        <Download className="w-4 h-4" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
