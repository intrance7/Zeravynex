import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Circle, ShieldAlert, FileText, CreditCard, Activity, Share2, Info } from 'lucide-react';
import { cn } from './lib/utils';
import { useNavigate } from 'react-router-dom';

export type NotificationType = 'analysis' | 'threat' | 'report' | 'subscription' | 'usage' | 'investigation';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'threat', title: 'Threat detected', message: 'CRITICAL: APT29 signature matched in sample-xyz.exe', time: '2m ago', read: false },
  { id: '2', type: 'analysis', title: 'Analysis completed', message: 'Static and dynamic analysis finished for unknown_binary.elf', time: '15m ago', read: false },
  { id: '3', type: 'usage', title: 'Usage limit approaching', message: "You've used 80% of your monthly analyses.", time: '1h ago', read: true },
  { id: '4', type: 'investigation', title: 'Investigation shared', message: 'Alex shared "Ransomware Outbreak - Q3" with you.', time: '2h ago', read: true },
  { id: '5', type: 'report', title: 'Report generated', message: 'Executive summary for Incident 2026-014 is ready.', time: '1d ago', read: true },
  { id: '6', type: 'subscription', title: 'Subscription updated', message: 'Your payment was successful and plan upgraded to Pro.', time: '2d ago', read: true },
];

const getIconForType = (type: NotificationType) => {
  switch (type) {
    case 'threat': return <ShieldAlert className="w-4 h-4 text-destructive" />;
    case 'analysis': return <Activity className="w-4 h-4 text-success" />;
    case 'report': return <FileText className="w-4 h-4 text-primary" />;
    case 'subscription': return <CreditCard className="w-4 h-4 text-emerald-400" />;
    case 'usage': return <Info className="w-4 h-4 text-warning" />;
    case 'investigation': return <Share2 className="w-4 h-4 text-purple-400" />;
    default: return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleNotificationClick = (n: Notification) => {
    markAsRead(n.id);
    onClose();
    if (n.type === 'report') navigate('/dashboard/reports');
    else if (n.type === 'subscription' || n.type === 'usage') navigate('/dashboard/billing');
    else if (n.type === 'investigation') navigate('/dashboard/investigations');
    else if (n.type === 'analysis' || n.type === 'threat') navigate('/dashboard/history');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={onClose}></div>
      )}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh] origin-top-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} NEW
                  </span>
                )}
              </h3>
              <button 
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 disabled:hover:text-muted-foreground flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="px-4 py-12 text-center flex flex-col items-center">
                  <Bell className="w-8 h-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-foreground">All caught up</p>
                  <p className="text-xs text-muted-foreground mt-1">Check back later for updates.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "p-4 flex gap-3 cursor-pointer transition-colors relative hover:bg-muted/40",
                        !notification.read ? "bg-primary/5" : ""
                      )}
                    >
                      <div className="shrink-0 mt-0.5">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border",
                          !notification.read ? "bg-card border-primary/30" : "bg-muted border-border/50"
                        )}>
                          {getIconForType(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-0.5">
                          <p className={cn("text-sm font-semibold truncate", !notification.read ? "text-foreground" : "text-muted-foreground")}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 font-medium">
                            {notification.time}
                          </span>
                        </div>
                        <p className={cn("text-xs line-clamp-2", !notification.read ? "text-foreground/80 font-medium" : "text-muted-foreground")}>
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="shrink-0 flex items-center">
                          <Circle className="w-2 h-2 fill-primary text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-2 border-t border-border bg-muted/10">
              <button 
                onClick={onClose}
                className="w-full py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
