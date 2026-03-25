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
  BarChart3, Mail, MessageSquare, Video, Image, Megaphone, ClipboardList,
  Plus, RefreshCw, Trash2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AssetGeneratorTab from '@/components/fulfillment/AssetGeneratorTab';
import {
  ResearchRenderer, AnglesRenderer, EmailsRenderer, SMSRenderer,
  AdCopyRenderer, ScriptsRenderer, CreativesRenderer, ReportRenderer, FunnelRenderer,
} from '@/components/fulfillment/renderers';

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
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  onboarding: 'bg-amber-500/10 text-amber-600 border-amber-200',
  researching: 'bg-blue-500/10 text-blue-600 border-blue-200',
  drafting: 'bg-purple-500/10 text-purple-600 border-purple-200',
  internal_review: 'bg-orange-500/10 text-orange-600 border-orange-200',
  client_review: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
  approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  launch_ready: 'bg-primary/10 text-primary border-primary/20',
};

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
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
        <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
        <TabsTrigger value="research" className="text-xs">Research</TabsTrigger>
        <TabsTrigger value="angles" className="text-xs">Angles</TabsTrigger>
        <TabsTrigger value="emails" className="text-xs">Emails</TabsTrigger>
        <TabsTrigger value="sms" className="text-xs">SMS</TabsTrigger>
        <TabsTrigger value="adcopy" className="text-xs">Ad Copy</TabsTrigger>
        <TabsTrigger value="scripts" className="text-xs">Scripts</TabsTrigger>
        <TabsTrigger value="creatives" className="text-xs">Creatives</TabsTrigger>
        <TabsTrigger value="report" className="text-xs">Report</TabsTrigger>
        <TabsTrigger value="funnel" className="text-xs">Funnel</TabsTrigger>
      </TabsList>

      <TabsContent value="overview"><ClientOverview client={client} /></TabsContent>
      <TabsContent value="research">
        <AssetGeneratorTab client={client} assetType="research" icon={BarChart3} title="Research Engine" description="AI-powered market research, industry analysis, and opportunity identification." renderContent={(c) => <ResearchRenderer content={c} />} />
      </TabsContent>
      <TabsContent value="angles">
        <AssetGeneratorTab client={client} assetType="angles" icon={Target} title="Marketing Angles" description="Generate 6-10 marketing angles with hooks, emotional drivers, and use cases." renderContent={(c) => <AnglesRenderer content={c} />} />
      </TabsContent>
      <TabsContent value="emails">
        <AssetGeneratorTab client={client} assetType="emails" icon={Mail} title="Email Sequences" description="Generate nurture email sequences with subject lines, preview text, and CTAs." renderContent={(c) => <EmailsRenderer content={c} />} />
      </TabsContent>
      <TabsContent value="sms">
        <AssetGeneratorTab client={client} assetType="sms" icon={MessageSquare} title="SMS Sequences" description="Generate SMS follow-up, reminder, and re-engagement sequences." renderContent={(c) => <SMSRenderer content={c} />} />
      </TabsContent>
      <TabsContent value="adcopy">
        <AssetGeneratorTab client={client} assetType="adcopy" icon={Megaphone} title="Ad Copy" description="Generate ad copy variations per angle — primary text, headlines, and descriptions." renderContent={(c) => <AdCopyRenderer content={c} />} />
      </TabsContent>
      <TabsContent value="scripts">
        <AssetGeneratorTab client={client} assetType="scripts" icon={Video} title="Video Scripts" description="Generate avatar, B-roll, UGC, and VSL scripts with hooks and CTAs." renderContent={(c) => <ScriptsRenderer content={c} />} />
      </TabsContent>
      <TabsContent value="creatives">
        <AssetGeneratorTab client={client} assetType="creatives" icon={Image} title="Creative Concepts" description="Static and video ad concepts with visual direction and layout ideas." renderContent={(c) => <CreativesRenderer content={c} />} />
      </TabsContent>
      <TabsContent value="report">
        <AssetGeneratorTab client={client} assetType="report" icon={FileText} title="Special Report" description="Generate a lead magnet report — cover page, executive summary, market opportunity." renderContent={(c) => <ReportRenderer content={c} />} />
      </TabsContent>
      <TabsContent value="funnel">
        <AssetGeneratorTab client={client} assetType="funnel" icon={Globe} title="Funnel Copy" description="Landing page, thank you page, booking page, and investor portal copy." renderContent={(c) => <FunnelRenderer content={c} />} />
      </TabsContent>
    </Tabs>
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
    if (!confirm('Delete this client and all their assets? This cannot be undone.')) return;
    
    // Delete assets first, then the client
    await supabase.from('client_assets').delete().eq('client_id', clientId);
    await supabase.from('clients').delete().eq('id', clientId);
    toast({ title: 'Client deleted' });
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
                {clients.map((client) => (
                  <Card
                    key={client.id}
                    className="border-border hover:border-primary/30 transition-all cursor-pointer"
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
                        <Badge className={`text-[9px] ${statusColors[client.status] || statusColors.onboarding}`}>
                          {client.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>{client.contact_name} · {client.contact_email}</p>
                        {client.raise_amount && <p className="text-foreground font-medium">Raise: ${client.raise_amount}</p>}
                        <p>Added {new Date(client.created_at).toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
              <Badge className={`text-[10px] ${statusColors[selectedClient.status] || statusColors.onboarding}`}>
                {selectedClient.status.replace('_', ' ')}
              </Badge>
            </div>

            <ClientWorkspace client={selectedClient} />
          </div>
        )}
      </div>
    </div>
  );
}
