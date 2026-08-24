import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldAlert, Zap, ArrowRight, Server, Building2 } from 'lucide-react';
import { PRICING_TIERS } from './config/pricing';
import { cn } from './lib/utils';
import { useNavigate } from 'react-router-dom';

export default function PricingView() {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)] overflow-y-auto bg-background text-foreground py-16 px-4 md:px-8">
      
      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
            <Zap className="w-3.5 h-3.5" /> Zeravynex Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-foreground">
            Professional Threat Intelligence <br className="hidden md:block" />
            <span className="text-muted-foreground">For Elite SOC Teams</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience the platform with our free community tier, or upgrade to unleash full AI capabilities, advanced pivoting, and unlimited history.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={cn("text-sm font-bold transition-colors", !isYearly ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-7 rounded-full bg-muted border border-border shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
            >
              <div className={cn(
                "absolute top-1 left-1 w-5 h-5 rounded-full bg-primary shadow-md transition-transform duration-300",
                isYearly ? "translate-x-7" : "translate-x-0"
              )} />
            </button>
            <span className={cn("text-sm font-bold transition-colors flex items-center gap-2", isYearly ? "text-foreground" : "text-muted-foreground")}>
              Annually <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-success/20 text-success border border-success/30 tracking-wider">Save 20%</span>
            </span>
          </div>
        </motion.div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRICING_TIERS.map((tier, idx) => {
          const price = isYearly ? tier.yearlyPriceINR : tier.monthlyPriceINR;
          const displayPrice = price === 'Custom' ? 'Custom' : `₹${price}`;
          const period = price === 'Custom' ? '' : isYearly ? '/yr' : '/mo';
          
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={cn(
                "relative flex flex-col bg-card rounded-2xl border p-6 lg:p-8 shadow-sm transition-all hover:shadow-xl",
                tier.isPopular ? "border-primary shadow-[0_0_20px_rgba(37,99,235,0.15)] scale-[1.02] z-10 bg-card/80 backdrop-blur-sm" : "border-border hover:border-primary/50"
              )}
            >
              {tier.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-full shadow-md">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-black text-foreground mb-2">{tier.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed h-10">{tier.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-foreground">{displayPrice}</span>
                  <span className="text-sm font-semibold text-muted-foreground mb-1">{period}</span>
                </div>
                {isYearly && price !== 'Custom' && price > 0 && (
                  <p className="text-[11px] font-bold text-success mt-1">₹{(tier.monthlyPriceINR as number) * 12 - (tier.yearlyPriceINR as number)} savings</p>
                )}
                {(!isYearly || price === 0) && price !== 'Custom' && (
                  <p className="text-[11px] font-bold text-transparent mt-1 select-none">No savings</p>
                )}
              </div>

              <button 
                onClick={() => navigate('/dashboard/settings')}
                className={cn(
                  "w-full py-2.5 rounded-lg font-bold text-sm transition-all mb-8 shadow-sm flex items-center justify-center gap-2",
                  tier.isPopular 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(37,99,235,0.3)]" 
                    : "bg-muted/50 border border-border text-foreground hover:bg-muted"
                )}
              >
                {tier.id === 'community' ? 'Get Started' : tier.id === 'team' ? 'Contact Sales' : 'Upgrade Plan'} <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Features Included</p>
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-border/50">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Limits</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Analyses</span>
                    <span className="font-mono font-bold text-foreground">{tier.limits.analyses}{typeof tier.limits.analyses === 'number' && '/mo'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">History Retention</span>
                    <span className="font-mono font-bold text-foreground">{tier.limits.historyDays}{typeof tier.limits.historyDays === 'number' && ' days'}</span>
                  </div>
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>
      
      {/* FAQ / Trust Section */}
      <div className="max-w-4xl mx-auto mt-24 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-8">Enterprise Grade Security</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-card border border-border rounded-xl">
            <Server className="w-6 h-6 text-primary mb-4" />
            <h4 className="font-bold text-foreground mb-2">Secure Enclave</h4>
            <p className="text-sm text-muted-foreground">All static analyses run in strictly isolated, ephemeral environments. Payloads are never detonated.</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-xl">
            <ShieldAlert className="w-6 h-6 text-primary mb-4" />
            <h4 className="font-bold text-foreground mb-2">Data Privacy</h4>
            <p className="text-sm text-muted-foreground">Pro and Team tiers guarantee private analysis. Your samples and reports are never shared publicly.</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-xl">
            <Building2 className="w-6 h-6 text-primary mb-4" />
            <h4 className="font-bold text-foreground mb-2">SSO Integration</h4>
            <p className="text-sm text-muted-foreground">Team tier supports Okta, Azure AD, and standard SAML 2.0 implementations.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
