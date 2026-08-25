import { useState } from 'react';
import { CreditCard, Download, CheckCircle2, AlertCircle, RefreshCw, XCircle, PauseCircle, PlayCircle, Clock } from 'lucide-react';
import { PRICING_TIERS, SubscriptionState } from './config/pricing';
import { useNavigate } from 'react-router-dom';
import { RazorpayProvider } from './lib/payments';

export default function BillingSettings() {
  const navigate = useNavigate();
  const currentPlanId = 'researcher';
  const currentPlan = PRICING_TIERS.find(t => t.id === currentPlanId) || PRICING_TIERS[0];
  
  const usageAnalyses = 72;
  const limitAnalyses = typeof currentPlan.limits.analyses === 'number' ? currentPlan.limits.analyses : 100;
  const usagePercentage = (usageAnalyses / limitAnalyses) * 100;
  
  // Mocking subscription state
  const [subState, setSubState] = useState<SubscriptionState>('Active');

  const invoices = [
    { id: 'INV-2026-08', date: 'Aug 01, 2026', amount: '₹499.00', status: 'Paid' },
    { id: 'INV-2026-07', date: 'Jul 01, 2026', amount: '₹499.00', status: 'Paid' },
    { id: 'INV-2026-06', date: 'Jun 01, 2026', amount: '₹499.00', status: 'Paid' },
  ];

  const handleCheckout = async () => {
    const provider = new RazorpayProvider();
    const loaded = await provider.load();
    if (!loaded) {
      console.error('Payment provider failed to load');
      return;
    }

    // In a real app, you'd fetch an order ID from your backend here.
    const mockOrderId = 'order_' + Math.random().toString(36).substring(7);

    provider.initializeCheckout(mockOrderId, {
      name: 'Zeravynex',
      description: 'Upgrade to ' + currentPlan.name,
      amount: (currentPlan.monthlyPriceINR as number) * 100, // in paise
      onSuccess: (res) => {
        console.log('Payment success frontend callback:', res);
        // Let backend verify and update. We don't trust frontend alone.
        alert('Payment authorized! Waiting for backend confirmation...');
      },
      onError: (err) => {
        console.error('Payment failed', err);
      }
    });
  };

  const getSubStateBanner = () => {
    switch (subState) {
      case 'Past Due':
        return (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-destructive">Payment Past Due</h4>
              <p className="text-sm text-destructive/80 mt-1">Your last payment failed. Please update your payment method to avoid service interruption.</p>
            </div>
            <button className="ml-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-md text-sm font-semibold transition-colors">
              Pay Now
            </button>
          </div>
        );
      case 'Trial':
        return (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3 mb-6">
            <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-primary">Trial Active</h4>
              <p className="text-sm text-primary/80 mt-1">You have 7 days left in your Pro trial. Upgrade now to keep advanced features.</p>
            </div>
            <button onClick={() => navigate('/dashboard/pricing')} className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold transition-colors">
              Upgrade Now
            </button>
          </div>
        );
      case 'Paused':
        return (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start gap-3 mb-6">
            <PauseCircle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-warning">Subscription Paused</h4>
              <p className="text-sm text-warning/80 mt-1">Your subscription is currently paused. You will not be billed, but access is restricted.</p>
            </div>
            <button onClick={() => setSubState('Active')} className="ml-auto bg-warning hover:bg-warning/90 text-warning-foreground px-4 py-2 rounded-md text-sm font-semibold transition-colors">
              Resume
            </button>
          </div>
        );
      case 'Canceled':
      case 'Expired':
        return (
          <div className="bg-muted border border-border rounded-lg p-4 flex items-start gap-3 mb-6">
            <XCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Subscription {subState}</h4>
              <p className="text-sm text-muted-foreground mt-1">Your subscription has {subState.toLowerCase()}. You are currently on the Free plan.</p>
            </div>
            <button onClick={() => navigate('/dashboard/pricing')} className="ml-auto bg-foreground hover:bg-foreground/90 text-background px-4 py-2 rounded-md text-sm font-semibold transition-colors">
              Reactivate
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          Billing & Usage
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your subscription, view payment history, and monitor usage limits.</p>
      </div>

      <hr className="border-border" />

      {getSubStateBanner()}

      {/* Current Plan & Limits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Plan Card */}
        <div className="bg-background border border-border rounded-xl p-6 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
          <div className="mb-6 flex-1 relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Current Plan</p>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-black text-foreground">{currentPlan.name}</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${subState === 'Active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                {subState}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-foreground">₹{currentPlan.monthlyPriceINR}</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 relative z-10">
            <button 
              onClick={handleCheckout}
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
        <div className="bg-background border border-border rounded-xl p-6 flex flex-col justify-center relative overflow-hidden">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Monthly Analysis Usage</p>
          
          <div className="mb-2 flex justify-between items-end relative z-10">
            <span className="text-3xl font-black text-foreground">{usageAnalyses}</span>
            <span className="text-sm font-semibold text-muted-foreground mb-1">/ {limitAnalyses}</span>
          </div>
          
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden mb-3 relative z-10">
            <div 
              className={`h-full transition-all duration-500 ${usagePercentage > 90 ? 'bg-destructive' : usagePercentage > 75 ? 'bg-warning' : 'bg-primary'}`} 
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>
          
          <div className="flex items-center gap-2 text-sm relative z-10">
            {usagePercentage > 90 ? (
              <p className="text-destructive font-semibold flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Nearing monthly limit</p>
            ) : usagePercentage === 100 ? (
              <p className="text-destructive font-semibold flex items-center gap-1.5">Limit reached. <button className="underline hover:text-destructive/80" onClick={handleCheckout}>Upgrade</button></p>
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

      {/* Billing History / Invoices */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Billing History & Invoices</h3>
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

      {/* Manage Subscription */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Manage Subscription</h3>
        <div className="bg-background border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-6">
            If you no longer need your premium features, you can pause or cancel your subscription. Your data will remain safe, but advanced features will be locked at the end of your billing cycle.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {subState === 'Active' || subState === 'Trial' ? (
              <>
                <button 
                  onClick={() => setSubState('Paused')}
                  className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg transition-colors text-sm"
                >
                  <PauseCircle className="w-4 h-4" /> Pause Subscription
                </button>
                <button 
                  onClick={() => setSubState('Canceled')}
                  className="flex items-center gap-2 px-4 py-2 border border-destructive/20 text-destructive hover:bg-destructive/10 font-semibold rounded-lg transition-colors text-sm"
                >
                  <XCircle className="w-4 h-4" /> Cancel Subscription
                </button>
              </>
            ) : subState === 'Paused' ? (
              <button 
                onClick={() => setSubState('Active')}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors text-sm"
              >
                <PlayCircle className="w-4 h-4" /> Resume Subscription
              </button>
            ) : (
              <button 
                onClick={() => navigate('/dashboard/pricing')}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" /> Reactivate Plan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Developer State Toggles for Demo */}
      <div className="pt-10">
        <div className="p-4 border border-border border-dashed rounded-lg bg-card/50">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Dev Tools: Test States</p>
          <div className="flex flex-wrap gap-2">
            {(['Free', 'Trial', 'Active', 'Past Due', 'Paused', 'Canceled', 'Expired'] as SubscriptionState[]).map(state => (
              <button 
                key={state} 
                onClick={() => setSubState(state)}
                className={`px-3 py-1 text-xs font-semibold rounded-md border ${subState === state ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent text-muted-foreground border-border hover:bg-muted'}`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
