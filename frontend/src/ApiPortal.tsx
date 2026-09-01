import { useState } from 'react';
import { Key, BookOpen, Webhook, Activity, Code, Trash2, Plus, ArrowRight } from 'lucide-react';
import { CopyButton } from './CopyButton';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsed: string;
}

export default function ApiPortal() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production Key',
      keyPrefix: 'sk_live_',
      createdAt: '2026-08-20',
      lastUsed: '2 hours ago'
    },
    {
      id: '2',
      name: 'Development Key',
      keyPrefix: 'sk_test_',
      createdAt: '2026-08-25',
      lastUsed: 'Just now'
    }
  ]);

  // showTokens and toggleTokenVisibility were removed as they were not used

  const handleRevoke = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };

  return (
    <div className="flex-1 h-full w-full overflow-y-auto bg-background p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">API Developer Portal</h1>
          <p className="text-muted-foreground">Manage your API keys, webhooks, and integrate our services into your application.</p>
        </div>

        {/* API Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border p-6 rounded-xl hover:border-primary/50 transition-colors group cursor-pointer">
            <BookOpen className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Documentation</h3>
            <p className="text-sm text-muted-foreground mb-4">Read our comprehensive API guides and reference.</p>
            <div className="flex items-center text-primary text-sm font-medium">
              View Docs <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl hover:border-primary/50 transition-colors group cursor-pointer" onClick={() => window.location.href = '/dashboard/usage'}>
            <Activity className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Usage & Limits</h3>
            <p className="text-sm text-muted-foreground mb-4">Monitor your API request volume and rate limits.</p>
            <div className="flex items-center text-primary text-sm font-medium">
              View Analytics <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl hover:border-primary/50 transition-colors group cursor-pointer">
            <Webhook className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Webhooks</h3>
            <p className="text-sm text-muted-foreground mb-4">Configure endpoints to receive real-time events.</p>
            <div className="flex items-center text-primary text-sm font-medium">
              Manage Webhooks <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" /> API Keys
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Authenticate your API requests using these secret keys.</p>
            </div>
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-glow-primary transition-all">
              <Plus className="w-4 h-4" /> Create New Key
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-muted/30 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Secret Key</th>
                    <th className="px-6 py-4 font-medium">Created</th>
                    <th className="px-6 py-4 font-medium">Last Used</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{key.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 bg-muted/30 px-3 py-1.5 rounded-md border border-border/50 w-max">
                          <code className="font-mono text-primary font-medium tracking-wide">
                            {key.keyPrefix}••••••••••••••••
                          </code>
                          <CopyButton text={`${key.keyPrefix}mock_secret_key`} label="" />
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1 ml-1 flex items-center gap-1">
                          Full secret is never displayed again after creation.
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{key.createdAt}</td>
                      <td className="px-6 py-4 text-muted-foreground">{key.lastUsed}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleRevoke(key.id)}
                            className="text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {apiKeys.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        No API keys found. Create one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Start Code */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" /> Quick Start
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Make your first API request using curl.</p>
          </div>
          <div className="bg-[#0D1117] border border-border rounded-xl p-4 overflow-hidden relative group">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text="curl -X GET https://api.zeravynex.com/v1/health \n  -H 'Authorization: Bearer sk_live_...'" className="text-white hover:text-white bg-white/10 hover:bg-white/20" />
            </div>
            <pre className="text-sm font-mono text-gray-300 overflow-x-auto leading-relaxed">
              <span className="text-[#7EE787]">curl</span> -X GET https://api.zeravynex.com/v1/health \
              <br />
              {'  '}-H <span className="text-[#A5D6FF]">'Authorization: Bearer sk_live_...'</span>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
