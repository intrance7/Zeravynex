import type { ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  icon?: ReactNode;
  title?: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function ErrorState({ 
  icon = <AlertOctagon className="w-10 h-10 text-destructive" />, 
  title = "Something went wrong", 
  description, 
  action 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px]">
      <div className="w-20 h-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed">
        {description}
      </p>
      {action ? (
        <button
          onClick={action.onClick}
          className="bg-background border border-border hover:bg-muted text-foreground px-6 py-2.5 rounded-md font-semibold text-sm transition-colors shadow-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {action.label}
        </button>
      ) : (
        <button
          onClick={() => window.location.reload()}
          className="bg-background border border-border hover:bg-muted text-foreground px-6 py-2.5 rounded-md font-semibold text-sm transition-colors shadow-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Page
        </button>
      )}
    </div>
  );
}
