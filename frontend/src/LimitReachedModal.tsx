import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType?: 'analyses' | 'history' | 'api';
  currentUsage?: number;
  maxLimit?: number;
}

export default function LimitReachedModal({ 
  isOpen, 
  onClose,
  limitType = 'analyses',
  currentUsage = 10,
  maxLimit = 10
}: LimitReachedModalProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate('/dashboard/pricing');
  };

  const contentMap = {
    analyses: {
      title: "Monthly Analysis Limit Reached",
      description: "You've reached your monthly analysis limit for your current plan. Upgrade your workspace to continue analyzing new files and URLs immediately.",
      metric: `${currentUsage} / ${maxLimit} Analyses`
    },
    history: {
      title: "History Retention Limit Reached",
      description: "You've reached the maximum history retention for your current plan. Older analyses are hidden. Upgrade to unlock full access.",
      metric: `${currentUsage} Days Retention`
    },
    api: {
      title: "API Rate Limit Exceeded",
      description: "You've exceeded the API rate limit for your current tier. Upgrade to Pro or Team for increased throughput and priority processing.",
      metric: "API Quota Exceeded"
    }
  };

  const content = contentMap[limitType];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] p-4"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 pb-6">
                <div className="w-12 h-12 rounded-full bg-warning/20 border border-warning/30 flex items-center justify-center mb-6">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3">{content.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {content.description}
                </p>

                <div className="bg-background border border-border rounded-lg p-4 flex items-center justify-between mb-8">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Usage</span>
                  <span className="text-sm font-mono font-bold text-foreground bg-muted px-2 py-1 rounded">{content.metric}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={onClose}
                    className="flex-1 bg-muted/50 hover:bg-muted text-foreground border border-border font-semibold py-2.5 rounded-lg transition-colors text-sm"
                  >
                    Dismiss
                  </button>
                  <button 
                    onClick={handleUpgrade}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    View Plans <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
