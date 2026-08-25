import { useState } from 'react';
import { Folder, Search, Plus, Calendar, Tag, Share2, MoreVertical, FileArchive, Library } from 'lucide-react';
import EmptyState from './EmptyState';

const MOCK_COLLECTIONS = [
  { id: 'c-1', name: 'Ransomware Research', tags: ['Research', 'High Priority'], count: 124, updated: '1 hour ago', shared: true, icon: FileArchive, color: 'text-rose-400' },
  { id: 'c-2', name: 'APT Samples', tags: ['Threat Intel', 'APT29', 'Lazarus'], count: 42, updated: '2 days ago', shared: false, icon: FileArchive, color: 'text-purple-400' },
  { id: 'c-3', name: 'University Lab', tags: ['Education', 'Malware 101'], count: 15, updated: '1 week ago', shared: true, icon: Folder, color: 'text-emerald-400' },
  { id: 'c-4', name: 'Incident 2026-014', tags: ['Incident Response', 'Active'], count: 8, updated: '4 hours ago', shared: false, icon: Folder, color: 'text-amber-400' },
  { id: 'c-5', name: 'Phishing Campaign', tags: ['Email', 'Credential Harvester'], count: 56, updated: '3 days ago', shared: true, icon: FileArchive, color: 'text-blue-400' },
];

export default function CollectionsView() {
  const [search, setSearch] = useState('');
  const [collections, setCollections] = useState(MOCK_COLLECTIONS);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Artifact Collections</h1>
          <p className="text-muted-foreground mt-1">Organize samples, reports, and indicators.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium">
          <Plus className="w-4 h-4" /> New Collection
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search collections..." 
          className="w-full bg-card border border-border rounded-lg py-2.5 pl-10 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {collections.length === 0 ? (
        <EmptyState 
          icon={<Library className="w-8 h-8" />}
          title="No collections yet."
          description="Create a collection to organize your malware samples, analysis reports, and threat indicators."
          action={{
            label: 'New Collection',
            onClick: () => setCollections(MOCK_COLLECTIONS)
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map(collection => {
            const Icon = collection.icon;
            return (
              <div key={collection.id} className="bg-card border border-border hover:border-primary/50 rounded-xl p-6 transition-all hover:shadow-lg group flex flex-col cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg bg-muted/50 border border-border/50 group-hover:bg-muted transition-colors ${collection.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <button className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{collection.name}</h3>
                
                <div className="flex flex-wrap gap-2 mb-6 flex-1">
                  {collection.tags.map(tag => (
                    <span key={tag} className="text-[10px] uppercase font-bold text-muted-foreground bg-muted border border-border/50 px-2 py-1 rounded-full flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border/50">
                  <span className="font-medium">{collection.count} items</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1" title="Last updated">
                      <Calendar className="w-3.5 h-3.5" /> {collection.updated}
                    </span>
                    {collection.shared && (
                      <span className="flex items-center gap-1 text-primary" title="Shared collection">
                        <Share2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Developer tool to clear list */}
      {collections.length > 0 && (
        <button 
          onClick={() => setCollections([])}
          className="mt-8 text-xs text-muted-foreground hover:text-destructive underline block"
        >
          Dev: Clear collections
        </button>
      )}
    </div>
  );
}
