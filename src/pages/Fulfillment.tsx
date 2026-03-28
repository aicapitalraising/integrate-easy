import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import logo from '@/assets/logo-aicra.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import {
  Lock, Phone, Building2, Target, DollarSign, Globe, Calendar, Users,
  FileText, Palette, ExternalLink, Copy, CheckCircle2, Clock, Loader2,
  ClipboardList, Sparkles, Trash2, Plus,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AllCopyView from '@/components/fulfillment/AllCopyView';
import CreativesHub from '@/components/fulfillment/CreativesHub';
import { Progress } from '@/components/ui/progress';
import { Bot, RefreshCw, Image } from 'lucide-react';

interface Client {
  id: string;
  share_token: string;
  company_name: string;
  fund_name: string | null;
  website: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  fund_type: string | null;
  raise_amount: string | null;
  timeline: string | null;
  min_investment: string | null;
  target_investor: string | null;
  pitch_deck_link: string | null;
  pitch_deck_path: string | null;
  budget_mode: string | null;
  budget_amount: string | null;
  investor_list_path: string | null;
  brand_notes: string | null;
  additional_notes: string | null;
  kickoff_date: string | null;
  kickoff_time: string | null;
  status: string;
  current_step: number;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  onboarding: 'bg-amber-500/10 text-amber-600 border-amber-200',
  partial: 'bg-rose-500/10 text-rose-600 border-rose-200',
  researching: 'bg-blue-500/10 text-blue-600 border-blue-200',
  drafting: 'bg-purple-500/10 text-purple-600 border-purple-200',
  internal_review: 'bg-orange-500/10 text-orange-600 border-orange-200',
  client_review: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
  approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  launch_ready: 'bg-primary/10 text-primary border-primary/20',
};

const stepLabels = ['Company', 'Goals', 'Assets', 'Kickoff', 'Review'];

function ClientOverview({ client }: { client: Client }) {
  const shareUrl = `${window.location.origin}/portal/${client.share_token}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Link copied!', description: 'Shareable client portal link copied to clipboard.' });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Company</p>
                <p className="font-semibold text-foreground">{client.company_name}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-sm">
              <p className="text-muted-foreground">{client.contact_name} · {client.contact_email}</p>
              {client.contact_phone && <p className="text-muted-foreground">{client.contact_phone}</p>}
              {client.website && (
                <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs">
                  <Globe className="w-3 h-3" /> {client.website}
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Capital Raise</p>
                <p className="font-semibold text-foreground">{client.raise_amount ? `$${client.raise_amount}` : '—'}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>Fund: {client.fund_type || '—'}</p>
              <p>Timeline: {client.timeline || '—'}</p>
              <p>Min Investment: {client.min_investment ? `$${client.min_investment}` : '—'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kickoff</p>
                <p className="font-semibold text-foreground">
                  {client.kickoff_date ? new Date(client.kickoff_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  {client.kickoff_time && ` at ${client.kickoff_time}`}
                </p>
              </div>
            </div>
            <Badge className={`text-[10px] ${statusColors[client.status] || statusColors.onboarding}`}>
              {client.status.replace('_', ' ')}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Shareable Link */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-center gap-4">
          <ExternalLink className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Client Portal Link</p>
            <p className="text-xs text-muted-foreground truncate">{shareUrl}</p>
          </div>
          <Button size="sm" variant="outline" onClick={copyLink} className="gap-1.5 shrink-0">
            <Copy className="w-3.5 h-3.5" /> Copy
          </Button>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {client.budget_amount && (
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> Ad Budget</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>${client.budget_amount}/{client.budget_mode || 'monthly'}</p>
            </CardContent>
          </Card>
        )}
        {client.target_investor && (
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Target Investor</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground"><p>{client.target_investor}</p></CardContent>
          </Card>
        )}
        {(client.pitch_deck_link || client.pitch_deck_path) && (
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Pitch Deck</CardTitle></CardHeader>
            <CardContent className="text-sm">
              {client.pitch_deck_link && <a href={client.pitch_deck_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{client.pitch_deck_link}</a>}
              {client.pitch_deck_path && <p className="text-muted-foreground">Uploaded file</p>}
            </CardContent>
          </Card>
        )}
        {client.brand_notes && (
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Palette className="w-4 h-4 text-primary" /> Brand Notes</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground"><p>{client.brand_notes}</p></CardContent>
          </Card>
        )}
        {client.additional_notes && (
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ClipboardList className="w-4 h-4 text-primary" /> Additional Notes</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground"><p>{client.additional_notes}</p></CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ClientWorkspace({ client }: { client: Client }) {
  const [generatingAll, setGeneratingAll] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStatus, setGenStatus] = useState('');
  const [genStartTime, setGenStartTime] = useState<number | null>(null);
  const ASSET_TYPES = ['research', 'angles', 'emails', 'sms', 'adcopy', 'scripts', 'creatives', 'report', 'funnel', 'setter'];
  const ASSET_LABELS: Record<string, string> = {
    research: 'Research', angles: 'Angles', emails: 'Emails', sms: 'SMS',
    adcopy: 'Ad Copy', scripts: 'Scripts', creatives: 'Creatives',
    report: 'Report', funnel: 'Funnel', setter: 'AI Setter',
  };

  const generateAll = async () => {
    if (!confirm('Generate all 10 assets for this client? This may take 3-5 minutes.')) return;
    setGeneratingAll(true);
    setGenProgress(0);
    setGenStartTime(Date.now());
    setGenStatus('Starting generation pipeline...');
    try {
      supabase.functions.invoke('auto-generate-assets', {
        body: { client_id: client.id },
      });

      let lastCount = 0;
      let stallCount = 0;
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const { data } = await supabase
          .from('client_assets')
          .select('asset_type')
          .eq('client_id', client.id);
        const completed = new Set((data || []).map((a: any) => a.asset_type));
        const count = ASSET_TYPES.filter(t => completed.has(t)).length;
        setGenProgress(Math.round((count / ASSET_TYPES.length) * 100));
        const current = ASSET_TYPES.find(t => !completed.has(t));
        setGenStatus(current ? `Generating ${ASSET_LABELS[current] || current}... (${count}/${ASSET_TYPES.length} done)` : 'Complete!');

        if (count === lastCount) {
          stallCount++;
          if (stallCount >= 12) {
            // 60 seconds with no progress
            setGenStatus(`Still working on ${ASSET_LABELS[current || ''] || current}... (complex content takes longer)`);
          }
        } else {
          stallCount = 0;
          lastCount = count;
        }

        if (count >= ASSET_TYPES.length) break;
      }
      toast({ title: 'All assets generated!', description: 'Switch to "All Copy & Assets" to review everything.' });
    } catch (e: any) {
      toast({ title: 'Generation error', description: 'Some assets may have failed. Check each tab for details.', variant: 'destructive' });
    }
    setGeneratingAll(false);
    setGenStartTime(null);
  };

  return (
    <div className="space-y-4">
      {/* Generate All Button */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={generateAll} disabled={generatingAll} className="gap-2">
          {generatingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generatingAll ? 'Generating All...' : 'Generate All Assets'}
        </Button>
        {generatingAll && (
          <div className="flex-1 min-w-48 max-w-xs space-y-1">
            <Progress value={genProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">{genStatus}</p>
          </div>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="copy" className="text-xs">All Copy & Assets</TabsTrigger>
          <TabsTrigger value="creatives" className="text-xs gap-1.5">
            <Image className="w-3.5 h-3.5" /> Creatives
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><ClientOverview client={client} /></TabsContent>
        <TabsContent value="copy">
          <AllCopyView clientId={client.id} />
        </TabsContent>
        <TabsContent value="creatives">
          <CreativesHub client={client} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Fulfillment() {
  const [searchParams] = useSearchParams();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'HPA') {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  useEffect(() => {
    if (authenticated) {
      loadClients();
    }
  }, [authenticated]);

  const loadClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setClients(data as Client[]);
      const tokenParam = searchParams.get('client');
      if (tokenParam) {
        const match = data.find((c: any) => c.share_token === tokenParam || c.id === tokenParam);
        if (match) setSelectedClient(match as Client);
      }
    }
    setLoading(false);
  };

  const deleteClient = async (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    const clientName = clients.find(c => c.id === clientId)?.company_name || 'this client';
    if (!confirm(`Permanently delete "${clientName}" and all their campaign assets?\n\nThis action cannot be undone.`)) return;

    // Delete related data first, then the client
    await supabase.from('creative_generations').delete().eq('client_id', clientId);
    await supabase.from('creative_schedules').delete().eq('client_id', clientId);
    await supabase.from('avatar_configs').delete().eq('client_id', clientId);
    await supabase.from('client_assets').delete().eq('client_id', clientId);
    await supabase.from('clients').delete().eq('id', clientId);
    toast({ title: 'Client deleted', description: `${clientName} and all assets have been removed.` });
    setClients((prev) => prev.filter((c) => c.id !== clientId));
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <img src={logo} alt="AI Capital Raising Accelerator" className="h-8 mx-auto mb-4" />
            <CardTitle className="text-lg font-bold">Internal Access</CardTitle>
            <p className="text-sm text-muted-foreground">Enter the team password to continue.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" autoFocus />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full font-semibold">Unlock</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/"><img src={logo} alt="AI Capital Raising Accelerator" className="h-8" /></a>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={loadClients} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
            <Link to="/admin">
              <Button size="sm" variant="ghost" className="text-xs">Admin</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!selectedClient ? (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Client Workspaces</h1>
              <p className="text-sm text-muted-foreground mt-1">Select a client to manage their campaign assets and approvals.</p>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading clients…
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">No clients yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Clients will appear here after they complete onboarding.</p>
                <Link to="/onboarding"><Button className="gap-2"><Plus className="w-4 h-4" /> Onboard a Client</Button></Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map((client) => {
                  const isPartial = client.current_step < 5;
                  const displayStatus = isPartial ? 'partial' : client.status;
                  return (
                    <Card
                      key={client.id}
                      className={`border-border hover:border-primary/30 transition-all cursor-pointer ${isPartial ? 'border-dashed' : ''}`}
                      onClick={() => setSelectedClient(client)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">{client.company_name}</p>
                              <p className="text-xs text-muted-foreground">{client.fund_type || 'Fund'}</p>
                            </div>
                          </div>
                          <Badge className={`text-[9px] ${statusColors[displayStatus] || statusColors.onboarding}`}>
                            {isPartial ? `Step ${client.current_step + 1}/5 · ${stepLabels[client.current_step]}` : displayStatus.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>{client.contact_name} · {client.contact_email}</p>
                          {client.raise_amount && <p className="text-foreground font-medium">Raise: ${client.raise_amount}</p>}
                          <p>Added {new Date(client.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          {isPartial && (
                            <a
                              href={`/onboarding?resume=${client.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-primary hover:underline font-medium"
                            >
                              Resume onboarding →
                            </a>
                          )}
                          <div className="flex-1" />
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={(e) => deleteClient(e, client.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedClient(null)} className="gap-1.5 text-muted-foreground">
                ← All Clients
              </Button>
              <div className="flex-1">
                <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">{selectedClient.company_name}</h1>
                <p className="text-xs text-muted-foreground">{selectedClient.fund_type} · {selectedClient.contact_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-[10px] ${statusColors[selectedClient.status] || statusColors.onboarding}`}>
                  {selectedClient.status.replace('_', ' ')}
                </Badge>
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <a href={`/portal/${selectedClient.share_token}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" /> Client Portal
                  </a>
                </Button>
              </div>
            </div>

            <ClientWorkspace client={selectedClient} />
          </div>
        )}
      </div>
    </div>
  );
}
