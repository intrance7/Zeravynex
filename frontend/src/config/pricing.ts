export const SUBSCRIPTION_STATES = ['Free', 'Trial', 'Active', 'Past Due', 'Paused', 'Canceled', 'Expired'] as const;
export type SubscriptionState = typeof SUBSCRIPTION_STATES[number];

export type TierLimits = {
  analyses: number | 'Unlimited';
  historyDays: number | 'Unlimited';
  privateSamples: boolean;
  apiAccess: boolean;
};

export type PricingTier = {
  id: string;
  name: string;
  description: string;
  monthlyPriceINR: number | 'Custom';
  yearlyPriceINR: number | 'Custom';
  features: string[];
  limits: TierLimits;
  isPopular?: boolean;
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'community',
    name: 'Community',
    description: 'For students and individual researchers exploring malware analysis.',
    monthlyPriceINR: 0,
    yearlyPriceINR: 0,
    features: [
      'Basic static analysis',
      'Public investigations only',
      'Standard reports',
      'Community threat intelligence'
    ],
    limits: {
      analyses: 10,
      historyDays: 7,
      privateSamples: false,
      apiAccess: false
    }
  },
  {
    id: 'researcher',
    name: 'Researcher',
    description: 'Advanced tools for professional SOC analysts and threat hunters.',
    monthlyPriceINR: 499,
    yearlyPriceINR: 4990,
    isPopular: true,
    features: [
      'Everything in Community',
      'Private samples',
      'AI-assisted analysis & SOC reports',
      'Interactive Threat Graph',
      'Advanced historical filtering',
      'Export capabilities (JSON, PDF)'
    ],
    limits: {
      analyses: 100,
      historyDays: 90,
      privateSamples: true,
      apiAccess: false
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For power users needing API access and maximum throughput.',
    monthlyPriceINR: 1499,
    yearlyPriceINR: 14990,
    features: [
      'Everything in Researcher',
      'API access & webhooks',
      'Priority processing queue',
      'Collections and advanced tagging',
      'Full threat intelligence pivots'
    ],
    limits: {
      analyses: 500,
      historyDays: 'Unlimited',
      privateSamples: true,
      apiAccess: true
    }
  },
  {
    id: 'team',
    name: 'Team',
    description: 'Enterprise collaboration for elite security operations centers.',
    monthlyPriceINR: 'Custom',
    yearlyPriceINR: 'Custom',
    features: [
      'Everything in Pro',
      'Team workspaces & collaboration',
      'Role-based access control (RBAC)',
      'SSO-ready architecture',
      'Usage analytics & admin controls'
    ],
    limits: {
      analyses: 'Unlimited',
      historyDays: 'Unlimited',
      privateSamples: true,
      apiAccess: true
    }
  }
];
