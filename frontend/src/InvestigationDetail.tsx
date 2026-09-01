import { useState } from 'react';
import { ArrowLeft, Clock, ShieldAlert, FileText, Globe, Tag } from 'lucide-react';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { Badge } from './components/ui/Badge';

interface InvestigationDetailProps {
  id: string;
  onBack: () => void;
}

const MOCK_TIMELINE = [
  { time: '10:31', event: 'Sample uploaded', type: 'info', details: 'evil_sample.exe (SHA256: e3b0c442...)' },
  { time: '10:32', event: 'Static analysis completed', type: 'success', details: 'Verdict: MALICIOUS (Score: 85/100)' },
  { time: '10:33', event: 'IOC discovered', type: 'warning', details: 'Domain: c2.evil-empire.com' },
  { time: '10:34', event: 'Threat intelligence pivot', type: 'info', details: 'Domain resolves to 192.168.1.100 (Known APT infrastructure)' },
  { time: '10:37', event: 'MITRE technique identified', type: 'danger', details: 'T1059: Command and Scripting Interpreter' },
  { time: '10:41', event: 'Investigation note added', type: 'note', details: 'Analyst: Looks like a variant of Cobalt Strike beacon.' },
];

export default function InvestigationDetail({ onBack }: InvestigationDetailProps) {
  const [note, setNote] = useState('');

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex gap-8">
      
      <div className="flex-1 space-y-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium -ml-4">
          <ArrowLeft className="w-4 h-4" /> Back to Investigations
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold text-foreground">Operation Nightfall</h1>
          <div className="flex gap-2 mt-2">
            <Badge variant="success">Active</Badge>
            <Badge variant="outline" className="flex items-center gap-1 bg-muted"><Tag className="w-3 h-3"/> APT29</Badge>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 border-b border-border/50 pb-2">Timeline</h2>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {MOCK_TIMELINE.map((item, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_1px_rgba(255,255,255,0.1)] z-10">
                   <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-muted/5 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-foreground text-sm">{item.event}</span>
                    <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">{item.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="w-80 shrink-0 space-y-6">
        <Card className="p-5">
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Quick Add Note</h3>
          <textarea 
            className="w-full bg-muted/50 border border-border/50 rounded-md p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px] mb-3"
            placeholder="Type your findings..."
            value={note}
            onChange={e => setNote(e.target.value)}
          ></textarea>
          <Button className="w-full">
            Add to Timeline
          </Button>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Linked Artifacts</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm">
              <div className="bg-red-500/10 p-2 rounded text-red-400"><FileText className="w-4 h-4" /></div>
              <div>
                <span className="block font-medium text-foreground">evil_sample.exe</span>
                <span className="block text-xs text-muted-foreground">Sample</span>
              </div>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <div className="bg-orange-500/10 p-2 rounded text-orange-400"><Globe className="w-4 h-4" /></div>
              <div>
                <span className="block font-medium text-foreground">c2.evil-empire.com</span>
                <span className="block text-xs text-muted-foreground">Domain</span>
              </div>
            </li>
             <li className="flex items-center gap-3 text-sm">
              <div className="bg-blue-500/10 p-2 rounded text-blue-400"><ShieldAlert className="w-4 h-4" /></div>
              <div>
                <span className="block font-medium text-foreground">T1059</span>
                <span className="block text-xs text-muted-foreground">MITRE Technique</span>
              </div>
            </li>
          </ul>
        </Card>
      </div>

    </div>
  );
}
