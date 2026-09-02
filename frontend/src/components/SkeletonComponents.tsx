import { cn } from '../lib/utils';

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-5 animate-pulse", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-muted/80"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted/80 rounded w-1/3"></div>
          <div className="h-3 bg-muted/80 rounded w-1/4"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-muted/80 rounded w-full"></div>
        <div className="h-3 bg-muted/80 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full border border-border rounded-xl overflow-hidden bg-card animate-pulse">
      <div className="h-12 bg-muted/50 border-b border-border flex items-center px-6 gap-4">
        <div className="h-4 bg-muted/80 rounded w-8"></div>
        <div className="h-4 bg-muted/80 rounded w-1/4"></div>
        <div className="h-4 bg-muted/80 rounded w-1/5"></div>
        <div className="h-4 bg-muted/80 rounded w-1/6"></div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 border-b border-border/50 flex items-center px-6 gap-4">
          <div className="h-4 bg-muted/80 rounded w-8"></div>
          <div className="h-4 bg-muted/80 rounded w-1/4"></div>
          <div className="h-4 bg-muted/80 rounded w-1/5"></div>
          <div className="h-4 bg-muted/80 rounded w-1/6"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGraph() {
  return (
    <div className="w-full h-full min-h-[400px] bg-card border border-border rounded-xl animate-pulse relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
      
      {/* Central Node */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-muted/80 border-4 border-background z-10"></div>
      
      {/* Surrounding Nodes */}
      <div className="absolute top-1/4 left-1/4 w-12 h-12 rounded-full bg-muted/80"></div>
      <div className="absolute top-3/4 left-1/3 w-10 h-10 rounded-full bg-muted/80"></div>
      <div className="absolute top-1/3 right-1/4 w-14 h-14 rounded-full bg-muted/80"></div>
      <div className="absolute bottom-1/4 right-1/3 w-10 h-10 rounded-full bg-muted/80"></div>

      {/* Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
        <line x1="50%" y1="50%" x2="33%" y2="75%" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
        <line x1="50%" y1="50%" x2="75%" y2="33%" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
        <line x1="50%" y1="50%" x2="66%" y2="75%" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
      </svg>
    </div>
  );
}

export function SkeletonReport() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-8">
        <div className="flex gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-muted/80"></div>
          <div className="space-y-3 flex-1 pt-1">
            <div className="h-6 bg-muted/80 rounded w-1/3"></div>
            <div className="h-4 bg-muted/80 rounded w-1/4"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-muted/80 rounded w-1/2"></div>
              <div className="h-4 bg-muted/80 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 h-64">
            <div className="h-5 bg-muted/80 rounded w-1/4 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted/80 rounded w-full"></div>
              <div className="h-4 bg-muted/80 rounded w-full"></div>
              <div className="h-4 bg-muted/80 rounded w-5/6"></div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 h-64">
            <div className="h-5 bg-muted/80 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-muted/80 rounded"></div>
              <div className="h-20 bg-muted/80 rounded"></div>
              <div className="h-20 bg-muted/80 rounded"></div>
              <div className="h-20 bg-muted/80 rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 h-96">
            <div className="h-5 bg-muted/80 rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded bg-muted/80 shrink-0"></div>
                  <div className="space-y-2 flex-1 pt-1">
                    <div className="h-3 bg-muted/80 rounded w-full"></div>
                    <div className="h-3 bg-muted/80 rounded w-4/5"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonSettings() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-3 mb-8 border-b border-border/50 pb-6">
        <div className="h-8 bg-muted/50 rounded w-1/4"></div>
        <div className="h-4 bg-muted/50 rounded w-1/2"></div>
      </div>

      {/* Settings Sections */}
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="bg-card border border-border rounded-xl p-6">
          <div className="h-5 bg-muted/50 rounded w-1/5 mb-6"></div>
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center pb-4 border-b border-border/30 last:border-0 last:pb-0">
                <div className="space-y-2 w-1/2">
                  <div className="h-4 bg-muted/50 rounded w-1/3"></div>
                  <div className="h-3 bg-muted/50 rounded w-3/4"></div>
                </div>
                <div className="h-10 bg-muted/50 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
