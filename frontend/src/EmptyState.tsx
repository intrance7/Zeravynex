import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px]">
      <div className="w-16 h-16 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center mb-6 text-muted-foreground/60">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-md font-semibold text-sm transition-colors shadow-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
