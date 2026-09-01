import { useState } from 'react';
import { Search, Plus, Calendar, FileText, ArrowRight, FolderSearch } from 'lucide-react';
import EmptyState from './EmptyState';
import { useDebounce } from './lib/hooks/useDebounce';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';

const MOCK_INVESTIGATIONS = [
  { id: 'inv-1', title: 'Operation Nightfall', status: 'Active', updated: '2 hours ago', artifacts: 12 },
  { id: 'inv-2', title: 'Ransomware Outbreak - Q3', status: 'Closed', updated: '3 days ago', artifacts: 45 },
  { id: 'inv-3', title: 'Phishing Campaign: Finance Dept', status: 'Active', updated: '1 day ago', artifacts: 8 },
];

interface InvestigationsListProps {
  onSelect: (id: string) => void;
}

export default function InvestigationsList({ onSelect }: InvestigationsListProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [investigations, setInvestigations] = useState(MOCK_INVESTIGATIONS);

  const filteredInvestigations = investigations.filter(inv => 
    inv.title.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Investigations Workspace</h1>
          <p className="text-muted-foreground mt-1">Track and manage active security operations.</p>
        </div>
        <Button className="flex items-center gap-2 font-medium">
          <Plus className="w-4 h-4" /> New Investigation
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input 
          type="text" 
          placeholder="Search investigations..." 
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredInvestigations.length === 0 ? (
        <EmptyState 
          icon={<FolderSearch className="w-8 h-8" />}
          title="No investigations yet."
          description="Create an investigation to organize samples, IOCs and findings around a security case."
          action={{
            label: 'New Investigation',
            onClick: () => setInvestigations(MOCK_INVESTIGATIONS) // Mock adding an investigation back
          }}
        />
      ) : (
        <div className="grid gap-4">
          {filteredInvestigations.map(inv => (
            <div 
              key={inv.id} 
              className="bg-card border border-border hover:border-primary/50 p-5 rounded-xl cursor-pointer transition-all hover:shadow-md group flex items-center justify-between"
              onClick={() => onSelect(inv.id)}
            >
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                  {inv.title}
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${inv.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-muted text-muted-foreground border border-border'}`}>
                    {inv.status}
                  </span>
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Last updated {inv.updated}</span>
                  <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {inv.artifacts} artifacts</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      )}
      
      {/* Developer tool to clear list */}
      {investigations.length > 0 && (
        <button 
          onClick={() => setInvestigations([])}
          className="mt-8 text-xs text-muted-foreground hover:text-destructive underline"
        >
          Dev: Clear investigations
        </button>
      )}
    </div>
  );
}
