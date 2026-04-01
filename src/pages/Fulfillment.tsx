import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import logo from '@/assets/logo-aicra.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import {
  Lock, Phone, Building2, Target, DollarSign, Globe, Calendar, Users,
  FileText, Palette, ExternalLink, Copy, CheckCircle2, Clock, Loader2,
  ClipboardList, Sparkles, Trash2, Plus, LayoutGrid, List, AlertCircle, Edit3, Save,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AllCopyView from '@/components/fulfillment/AllCopyView';
import { Progress } from '@/components/ui/progress';
import { Bot, RefreshCw } from 'lucide-react';

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
  speaker_name: string | null;
  industry_focus: string | null;
  targeted_returns: string | null;
  hold_period: string | null;
  distribution_schedule: string | null;
  investment_range: string | null;
  tax_advantages: string | null;
  fund_history: string | null;
  credibility: string | null;
  ein_number: string | null;
  card_number: string | null;
  card_exp: string | null;
  card_cvv: string | null;
}

const ONBOARDING_FIELDS: { key: keyof Client; label: string; step: string }[] = [
  { key: 'company_name', label: 'Company Name', step: 'Company' },
  { key: 'fund_name', label: 'Fund Name', step: 'Company' },
  { key: 'website', label: 'Website', step: 'Company' },
  { key: 'contact_name', label: 'Contact Name', step: 'Company' },
  { key: 'contact_email', label: 'Contact Email', step: 'Company' },
  { key: 'contact_phone', label: 'Phone', step: 'Company' },
  { key: 'fund_type', label: 'Fund Type', step: 'Goals' },
  { key: 'raise_amount', label: 'Raise Amount', step: 'Goals' },
  { key: 'timeline', label: 'Timeline', step: 'Goals' },
  { key: 'min_investment', label: 'Min Investment', step: 'Goals' },
  { key: 'target_investor', label: 'Target Investor', step: 'Goals' },
  { key: 'industry_focus', label: 'Industry Focus', step: 'Goals' },
  { key: 'targeted_returns', label: 'Targeted Returns', step: 'Goals' },
  { key: 'hold_period', label: 'Hold Period', step: 'Goals' },
  { key: 'distribution_schedule', label: 'Distribution Schedule', step: 'Goals' },
  { key: 'investment_range', label: 'Investment Range', step: 'Goals' },
  { key: 'tax_advantages', label: 'Tax Advantages', step: 'Goals' },
  { key: 'fund_history', label: 'Fund History', step: 'Goals' },
  { key: 'credibility', label: 'Credibility', step: 'Goals' },
  { key: 'pitch_deck_link', label: 'Pitch Deck Link', step: 'Assets' },
  { key: 'pitch_deck_path', label: 'Pitch Deck Upload', step: 'Assets' },
  { key: 'budget_amount', label: 'Ad Budget', step: 'Assets' },
  { key: 'brand_notes', label: 'Brand Notes', step: 'Assets' },
  { key: 'ein_number', label: 'EIN Number', step: 'Assets' },
  { key: 'speaker_name', label: 'Speaker Name', step: 'Assets' },
  { key: 'kickoff_date', label: 'Kickoff Date', step: 'Kickoff' },
  { key: 'kickoff_time', label: 'Kickoff Time', step: 'Kickoff' },
  { key: 'additional_notes', label: 'Additional Notes', step: 'Kickoff' },
];

function getMissingFields(client: Client) {
  return ONBOARDING_FIELDS.filter(f => {
    const val = client[f.key];
    return val === null || val === undefined || val === '';
  });
}

function getAnsweredFields(client: Client) {
  return ONBOARDING_FIELDS.filter(f => {
    const val = client[f.key];
    return val !== null && val !== undefined && val !== '';
  });
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

function ClientOverview({ client, onClientUpdate }: { client: Client; onClientUpdate: (updated: Client) => void }) {
  const shareUrl = `${window.location.origin}/portal/${client.share_token}`;
  const [editingField, setEditingField] = useState<keyof Client | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [localClient, setLocalClient] = useState<Client>(client);

  useEffect(() => { setLocalClient(client); }, [client]);

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Link copied!', description: 'Shareable client portal link copied to clipboard.' });
  };

  const startEdit = (key: keyof Client) => {
    setEditingField(key);
    setEditValue(String(localClient[key] || ''));
  };

  const saveField = async () => {
    if (!editingField) return;
    setSaving(true);
    const { error } = await supabase
      .from('clients')
      .update({ [editingField]: editValue || null })
      .eq('id', localClient.id);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      const updated = { ...localClient, [editingField]: editValue || null } as Client;
      setLocalClient(updated);
      onClientUpdate(updated);
      toast({ title: 'Saved!' });
    }
    setEditingField(null);
    setEditValue('');
    setSaving(false);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveField(); }
    if (e.key === 'Escape') cancelEdit();
  };

  const missing = getMissingFields(localClient);
  const answered = getAnsweredFields(localClient);

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
                <p className="font-semibold text-foreground">{localClient.company_name}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-sm">
              <p className="text-muted-foreground">{localClient.contact_name} · {localClient.contact_email}</p>
              {localClient.contact_phone && <p className="text-muted-foreground">{localClient.contact_phone}</p>}
              {localClient.website && (
                <a href={localClient.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs">
                  <Globe className="w-3 h-3" /> {localClient.website}
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
                <p className="font-semibold text-foreground">{localClient.raise_amount ? `$${localClient.raise_amount}` : '—'}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>Fund: {localClient.fund_type || '—'}</p>
              <p>Timeline: {localClient.timeline || '—'}</p>
              <p>Min Investment: {localClient.min_investment ? `$${localClient.min_investment}` : '—'}</p>
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
                  {localClient.kickoff_date ? new Date(localClient.kickoff_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  {localClient.kickoff_time && ` at ${localClient.kickoff_time}`}
                </p>
              </div>
            </div>
            <Badge className={`text-[10px] ${statusColors[localClient.status] || statusColors.onboarding}`}>
              {localClient.status.replace('_', ' ')}
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

      {/* Unanswered Fields Section */}
      {missing.length > 0 && (
        <Card className="border-amber-200 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Unanswered Questions ({missing.length})
            </CardTitle>
            <p className="text-xs text-muted-foreground">Click any field to fill it in. Press Enter to save or Escape to cancel.</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {missing.map(({ key, label, step }) => (
                <div key={key} className="group">
                  {editingField === key ? (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">{label} <span className="text-muted-foreground">({step})</span></label>
                      {['brand_notes', 'additional_notes', 'credibility', 'fund_history', 'tax_advantages'].includes(key) ? (
                        <Textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={`Enter ${label.toLowerCase()}...`}
                          className="text-sm min-h-[60px]"
                          autoFocus
                        />
                      ) : (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={`Enter ${label.toLowerCase()}...`}
                          className="text-sm"
                          autoFocus
                        />
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveField} disabled={saving} className="gap-1 text-xs h-7">
                          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit} className="text-xs h-7">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => startEdit(key)}
                      className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-amber-300 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{label}</p>
                        <p className="text-[10px] text-muted-foreground">{step} · Click to add</p>
                      </div>
                      <Edit3 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Answered Fields */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Completed Fields ({answered.length}/{ONBOARDING_FIELDS.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {answered.map(({ key, label, step }) => (
              <div key={key} className="group">
                {editingField === key ? (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">{label} <span className="text-muted-foreground">({step})</span></label>
                    {['brand_notes', 'additional_notes', 'credibility', 'fund_history', 'tax_advantages'].includes(key) ? (
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                        className="text-sm min-h-[60px]"
                        autoFocus
                      />
                    ) : (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                        className="text-sm"
                        autoFocus
                      />
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveField} disabled={saving} className="gap-1 text-xs h-7">
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit} className="text-xs h-7">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => startEdit(key)}
                    className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground truncate">{String(localClient[key])}</p>
                    </div>
                    <Edit3 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClientWorkspace({ client, onClientUpdate }: { client: Client; onClientUpdate: (updated: Client) => void }) {
  const [generatingAll, setGeneratingAll] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStatus, setGenStatus] = useState('');
  const ASSET_TYPES = ['research', 'angles', 'emails', 'sms', 'adcopy', 'scripts', 'creatives', 'report', 'funnel', 'setter'];

  const generateAll = async () => {
    setGeneratingAll(true);
    setGenProgress(0);
    setGenStatus('Starting generation pipeline...');
    try {
      supabase.functions.invoke('auto-generate-assets', {
        body: { client_id: client.id },
      });

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
        setGenStatus(current ? `Generating ${current}...` : 'Complete!');
        if (count >= ASSET_TYPES.length) break;
      }
      toast({ title: 'All assets generated!', description: 'Review each tab to see the results.' });
    } catch (e: any) {
      toast({ title: 'Generation error', description: e.message, variant: 'destructive' });
    }
    setGeneratingAll(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button onClick={generateAll} disabled={generatingAll} className="gap-2">
          {generatingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generatingAll ? 'Generating All...' : 'Generate All Assets'}
        </Button>
        {generatingAll && (
          <div className="flex-1 max-w-xs space-y-1">
            <Progress value={genProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">{genStatus} ({genProgress}%)</p>
          </div>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="copy" className="text-xs">All Copy & Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><ClientOverview client={client} onClientUpdate={onClientUpdate} /></TabsContent>
        <TabsContent value="copy">
          <AllCopyView clientId={client.id} />
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="h-9 w-9 p-0"
              title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
            >
              {viewMode === 'grid' ? <List className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
            </Button>
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
            ) : viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map((client) => {
                  const isPartial = client.current_step < 5;
                  const displayStatus = isPartial ? 'partial' : client.status;
                  const missing = getMissingFields(client);
                  const answered = getAnsweredFields(client);
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
                        {/* Field completion indicator */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 text-xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span className="text-muted-foreground">{answered.length}/{ONBOARDING_FIELDS.length} fields</span>
                            </div>
                            {missing.length > 0 && (
                              <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {missing.length} unanswered
                              </p>
                            )}
                          </div>
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
            ) : (
              /* List View */
              <div className="space-y-3">
                {clients.map((client) => {
                  const isPartial = client.current_step < 5;
                  const displayStatus = isPartial ? 'partial' : client.status;
                  const missing = getMissingFields(client);
                  const answered = getAnsweredFields(client);
                  return (
                    <Card
                      key={client.id}
                      className={`border-border hover:border-primary/30 transition-all cursor-pointer ${isPartial ? 'border-dashed' : ''}`}
                      onClick={() => setSelectedClient(client)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{client.company_name}</p>
                              <p className="text-xs text-muted-foreground">{client.contact_name} · {client.contact_email} · Added {new Date(client.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right text-xs">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                {answered.length}/{ONBOARDING_FIELDS.length} fields
                              </div>
                              {missing.length > 0 && (
                                <p className="text-amber-600 flex items-center gap-1 justify-end mt-0.5">
                                  <AlertCircle className="w-3 h-3" /> {missing.length} unanswered
                                </p>
                              )}
                            </div>
                            <Badge className={`text-[9px] ${statusColors[displayStatus] || statusColors.onboarding}`}>
                              {isPartial ? `Step ${client.current_step + 1}/5` : displayStatus.replace('_', ' ')}
                            </Badge>
                            {isPartial && (
                              <a
                                href={`/onboarding?resume=${client.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-primary hover:underline font-medium whitespace-nowrap"
                              >
                                Resume →
                              </a>
                            )}
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={(e) => deleteClient(e, client.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        {/* All form fields in a grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 text-xs">
                          {ONBOARDING_FIELDS.map(({ key, label }) => {
                            const val = client[key];
                            const hasValue = val !== null && val !== undefined && val !== '';
                            return (
                              <div key={key} className="flex items-start gap-1.5">
                                {hasValue ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                                ) : (
                                  <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <span className={`font-medium ${hasValue ? 'text-foreground' : 'text-amber-600'}`}>{label}</span>
                                  {hasValue ? (
                                    <p className="text-muted-foreground truncate">{String(val)}</p>
                                  ) : (
                                    <p className="text-amber-500 italic">Not provided</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
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
