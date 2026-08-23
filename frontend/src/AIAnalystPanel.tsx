import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Terminal, Send, Sparkles, BrainCircuit, Bot, User, 
  ShieldAlert, Activity, Command, ArrowRight
} from 'lucide-react';
import { cn } from './lib/utils';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  content: string;
  evidence?: {
    label: string;
    items: string[];
    mitre?: string;
  };
}

interface AIAnalystPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export default function AIAnalystPanel({ isOpen, onClose, initialPrompt }: AIAnalystPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      content: 'I am the Zeravynex AI Analyst. I have access to the current sample\'s static analysis report, heuristics, and ML attributions.\n\nHow can I assist your investigation today?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && initialPrompt) {
       handleSend(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  const handleSend = (text: string = inputValue) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: text
    };
    setMessages(prev => [...prev, userMsg]);
    if (inputValue === text) {
      setInputValue('');
    }
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      let aiContent = "I've analyzed the report based on your request.";
      let evidence;

      if (text.toLowerCase().includes('critical') || text.toLowerCase().includes('verdict')) {
        aiContent = "This sample was classified as critical due to the presence of high-entropy packed sections combined with known process injection APIs. The ML model assigned an 88% malware probability.";
        evidence = {
          label: 'Process Injection Indicators',
          items: ['VirtualAllocEx', 'WriteProcessMemory', 'CreateRemoteThread'],
          mitre: 'T1055'
        };
      } else if (text.toLowerCase().includes('persistence')) {
        aiContent = "The static analysis engines detected string patterns indicating the sample attempts to maintain persistence via the Windows Registry Run keys.";
        evidence = {
          label: 'Registry Run Keys Found',
          items: ['SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run', 'CurrentVersion\\Run'],
          mitre: 'T1547.001'
        };
      } else if (text.toLowerCase().includes('summarize')) {
        aiContent = "This sample is a packed 32-bit executable. Upon execution, it is highly likely to unpack a secondary payload into memory using process injection, and it contains hardcoded IPs for command and control.";
      } else if (text.toLowerCase().includes('investigate') || text.toLowerCase().includes('steps')) {
        aiContent = "I recommend the following immediate investigation steps:\n\n1. Pivot on the extracted IP addresses to check for associated threat campaigns.\n2. Detonate the binary in a secure sandbox to capture the unpacked payload.\n3. Search your SIEM for any endpoints communicating with the C2 URLs.";
      } else if (text.toLowerCase().includes('ioc')) {
        aiContent = "I found 3 suspicious domains and 1 external IP address embedded in the string sections. They appear to be used for Command and Control (C2).";
        evidence = {
          label: 'C2 Indicators',
          items: ['192.168.100.45', 'malicious-c2.net'],
          mitre: 'T1071.001'
        };
      } else if (text.toLowerCase().includes('mitre')) {
        aiContent = "I mapped the static traits to the following MITRE ATT&CK techniques:";
        evidence = {
          label: 'MITRE ATT&CK Mappings',
          items: ['Process Injection (T1055)', 'Web Protocols (T1071.001)', 'Registry Run Keys (T1547.001)']
        };
      } else {
        aiContent = "I can see the relevant static features. Is there a specific aspect (like IOCs, API imports, or MITRE tactics) you'd like me to explain?";
      }

      setMessages(prev => [
        ...prev, 
        { id: (Date.now() + 1).toString(), sender: 'ai', content: aiContent, evidence }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const quickPrompts = [
    "Why was this classified as critical?",
    "What persistence mechanisms were found?",
    "Summarize the attack chain.",
    "What should I investigate next?"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/50 backdrop-blur-[2px] z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[450px] bg-card border-l border-border z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center border border-primary/30">
                  <BrainCircuit className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">AI Analyst Assistant</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Contextual Mode</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-background/30">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-3", msg.sender === 'user' ? "flex-row-reverse" : "")}>
                  <div className={cn(
                    "w-7 h-7 rounded flex items-center justify-center shrink-0 border",
                    msg.sender === 'user' 
                      ? "bg-muted border-border" 
                      : "bg-primary/10 border-primary/20 text-primary"
                  )}>
                    {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  
                  <div className={cn(
                    "max-w-[85%] space-y-3",
                    msg.sender === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap",
                      msg.sender === 'user'
                        ? "bg-primary/20 border border-primary/30 text-foreground"
                        : "bg-card border border-border text-foreground shadow-sm"
                    )}>
                      {msg.content}
                    </div>

                    {/* Evidence Rendering */}
                    {msg.evidence && (
                      <div className="bg-card border border-border rounded-lg p-3 shadow-sm space-y-2 w-full mt-2">
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground tracking-wider border-b border-border/50 pb-2">
                          <Activity className="w-3 h-3 text-warning" />
                          Evidence Cited: {msg.evidence.label}
                        </div>
                        <ul className="space-y-1.5 pt-1">
                          {msg.evidence.items.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                              <span className="font-mono text-[11px] text-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">{item}</span>
                            </li>
                          ))}
                        </ul>
                        {msg.evidence.mitre && (
                          <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
                            <span className="text-[10px] uppercase text-muted-foreground font-bold">Related Technique:</span>
                            <span className="text-[11px] font-mono font-bold text-destructive px-1.5 py-0.5 bg-destructive/10 border border-destructive/20 rounded">{msg.evidence.mitre}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div className="bg-card border border-border rounded-lg shadow-sm p-4 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            {messages.length === 1 && !isTyping && (
              <div className="px-4 pb-2 bg-background/30">
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="text-[11px] bg-card hover:bg-muted border border-border shadow-sm rounded px-3 py-2 text-muted-foreground hover:text-foreground transition-colors text-left font-medium"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-card">
              <div className="relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask the AI Analyst..."
                  className="w-full bg-muted/30 border border-border rounded-lg pl-3 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none h-[60px]"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 top-2 bottom-2 w-8 flex items-center justify-center rounded-md bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
