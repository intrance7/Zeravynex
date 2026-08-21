import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from './lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  iconClassName?: string;
  label?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  className,
  iconClassName = "w-3.5 h-3.5",
  label
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied to clipboard!" : `Copy ${label || text}`}
      className={cn(
        "inline-flex items-center gap-1.5 px-1.5 py-1 rounded text-xs transition-colors hover:bg-muted/80 focus:outline-none focus:ring-1 focus:ring-primary text-muted-foreground hover:text-foreground",
        copied && "text-success hover:text-success",
        className
      )}
    >
      {copied ? (
        <>
          <Check className={cn(iconClassName, "text-emerald-500")} />
          <span className="text-[11px] font-medium text-emerald-500">Copied!</span>
        </>
      ) : (
        <>
          <Copy className={iconClassName} />
          {label && <span className="text-[11px] font-medium">{label}</span>}
        </>
      )}
    </button>
  );
};
