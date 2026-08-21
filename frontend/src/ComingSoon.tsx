import { Hexagon, Lock } from 'lucide-react';

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex-1 h-full w-full flex flex-col items-center justify-center p-8 bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="bg-card border border-border p-8 rounded-2xl flex flex-col items-center text-center max-w-md shadow-sm relative z-10">
        <div className="w-16 h-16 rounded-full bg-muted/50 border border-border flex items-center justify-center mb-6 relative">
          <Hexagon className="w-8 h-8 text-muted-foreground opacity-50" />
          <Lock className="w-4 h-4 text-primary absolute bottom-4 right-4" />
        </div>
        
        <h2 className="text-xl font-bold text-foreground tracking-tight mb-2">{title}</h2>
        
        <p className="text-sm text-muted-foreground mb-6">
          This feature is currently under active development. Our engineers are finalizing the data models and UI components.
        </p>
        
        <div className="text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          Coming Soon
        </div>
      </div>
    </div>
  );
}
