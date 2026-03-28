import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import logo from '@/assets/logo-aicra.png';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import {
  Building2, Target, Calendar, Globe, FileText, CheckCircle2, Loader2,
  Mail, MessageSquare, Video, Image, Megaphone, Clock, DollarSign,
  Edit3, Save, X, RefreshCw, Bot, BarChart3, Sparkles, AlertTriangle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';
import {
  ResearchRenderer, AnglesRenderer, EmailsRenderer, SMSRenderer,
  AdCopyRenderer, ScriptsRenderer, CreativesRenderer, ReportRenderer, FunnelRenderer, SetterRenderer,
} from '@/components/fulfillment/renderers';

interface Client {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  fund_type: string | null;
  raise_amount: string | null;
  timeline: string | null;
  status: string;
  kickoff_date: string | null;
  kickoff_time: string | null;
  created_at: string;
  speaker_name: string | null;
  fund_name: string | null;
  industry_focus: string | null;
  targeted_returns: string | null;
  hold_period: string | null;
  distribution_schedule: string | null;
  investment_range: string | null;
  tax_advantages: string | null;
  credibility: string | null;
  fund_history: string | null;
  website: string | null;
  min_investment: string | null;
  target_investor: string | null;
  brand_notes: string | null;
  additional_notes: string | null;
}

interface Asset {
  id: string;
  asset_type: string;
  content: Json;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-amber-500/10 text-amber-600 border-amber-200',
  internal_review: 'bg-blue-500/10 text-blue-600 border-blue-200',
  client_review: 'bg-purple-500/10 text-purple-600 border-purple-200',
  approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  onboarding: 'bg-amber-500/10 text-amber-600 border-amber-200',
  researching: 'bg-blue-500/10 text-blue-600 border-blue-200',
  drafting: 'bg-purple-500/10 text-purple-600 border-purple-200',
  launch_ready: 'bg-primary/10 text-primary border-primary/20',
};

// Organized tab groups for clearer navigation
const TAB_GROUPS = [
  {
    label: 'Research',
    tabs: [
      { value: 'research', label: 'Research', icon: BarChart3, description: 'Market data & analysis' },
      { value: 'angles', label: 'Angles', icon: Target, description: 'Marketing angles & hooks' },
    ],
  },
  {
    label: 'Content',
    tabs: [
      { value: 'emails', label: 'Emails', icon: Mail, description: '10-email nurture sequence' },
      { value: 'sms', label: 'SMS', icon: MessageSquare, description: 'Text message sequence' },
      { value: 'scripts', label: 'Scripts', icon: Video, description: 'Video ad scripts' },
    ],
  },
  {
    label: 'Ads & Creative',
    tabs: [
      { value: 'adcopy', label: 'Ad Copy', icon: Megaphone, description: 'Social ad copy' },
      { value: 'creatives', label: 'Creatives', icon: Image, description: 'Static & video concepts' },
    ],
  },
  {
    label: 'Conversion',
    tabs: [
      { value: 'report', label: 'Report', icon: FileText, description: 'Lead magnet report' },
      { value: 'funnel', label: 'Funnel', icon: Globe, description: 'Landing pages & booking' },
      { value: 'setter', label: 'AI Setter', icon: Bot, description: 'Automated outreach' },
    ],
  },
];

const ALL_TABS = TAB_GROUPS.flatMap(g => g.tabs);

const RENDERERS: Record<string, (props: { content: any; editMode: boolean; onEdit: (c: any) => void }) => React.ReactNode> = {
  research: (p) => <ResearchRenderer {...p} />,
  angles: (p) => <AnglesRenderer {...p} />,
  emails: (p) => <EmailsRenderer {...p} />,
  sms: (p) => <SMSRenderer {...p} />,
  adcopy: (p) => <AdCopyRenderer {...p} />,
  scripts: (p) => <ScriptsRenderer {...p} />,
  creatives: (p) => <CreativesRenderer {...p} />,
  report: (p) => <ReportRenderer {...p} />,
  funnel: (p) => <FunnelRenderer {...p} />,
  setter: (p) => <SetterRenderer {...p} />,
};

// Dependencies: what must be generated before each asset
const PREREQUISITES: Record<string, string[]> = {
  angles: ['research'],
  emails: ['research', 'angles'],
  sms: ['research', 'angles'],
  adcopy: ['research', 'angles'],
  scripts: ['research', 'angles'],
  creatives: ['research', 'angles'],
  report: ['research'],
  funnel: ['research'],
  setter: ['research', 'angles'],
};

function PortalAssetTab({ client, assetType, icon: Icon, label, description, assetStatuses }: {
  client: Client; assetType: string; icon: any; label: string; description: string;
  assetStatuses: Record<string, string>;
}) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [hasBeenEdited, setHasBeenEdited] = useState(false);

  useEffect(() => { loadAsset(); }, [client.id, assetType]);

  const loadAsset = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('client_assets')
      .select('*')
      .eq('client_id', client.id)
      .eq('asset_type', assetType)
      .order('created_at', { ascending: false })
      .limit(1);
    const a = (data?.[0] as Asset) || null;
    setAsset(a);
    if (a) {
      setHasBeenEdited(a.updated_at !== a.created_at);
    }
    setLoading(false);
  };

  const startEditing = () => {
    if (asset) {
      setEditedContent(JSON.parse(JSON.stringify(asset.content)));
      setEditMode(true);
    }
  };

  const cancelEditing = () => { setEditMode(false); setEditedContent(null); };

  const saveEdits = async () => {
    if (!editedContent || !asset) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('client_assets')
        .update({ content: editedContent as unknown as Json })
        .eq('id', asset.id);
      if (error) throw error;
      toast({ title: 'Changes saved!', description: 'Your edits have been saved successfully.' });
      setEditMode(false);
      setEditedContent(null);
      setHasBeenEdited(true);
      await loadAsset();
    } catch (e: any) {
      toast({ title: 'Save failed', description: 'Please try again. If the issue persists, refresh the page.', variant: 'destructive' });
    }
    setSaving(false);
  };

  const regenerate = async () => {
    // Warn if content has been manually edited
    if (hasBeenEdited && asset) {
      if (!confirm('This will replace your manually edited content with a fresh AI generation. Continue?')) return;
    }

    setRegenerating(true);
    try {
      let existing_research = null;
      let existing_angles = null;

      if (['angles', 'emails', 'sms', 'adcopy', 'scripts', 'creatives', 'report', 'funnel', 'setter'].includes(assetType)) {
        const { data } = await supabase.from('client_assets').select('content').eq('client_id', client.id).eq('asset_type', 'research').order('created_at', { ascending: false }).limit(1);
        if (data?.[0]) existing_research = data[0].content;
      }
      if (['emails', 'sms', 'adcopy', 'scripts', 'creatives', 'setter'].includes(assetType)) {
        const { data } = await supabase.from('client_assets').select('content').eq('client_id', client.id).eq('asset_type', 'angles').order('created_at', { ascending: false }).limit(1);
        if (data?.[0]) existing_angles = data[0].content;
      }

      const { error } = await supabase.functions.invoke('generate-asset', {
        body: {
          client_id: client.id,
          asset_type: assetType,
          client_data: {
            company_name: client.company_name,
            fund_name: client.fund_name,
            fund_type: client.fund_type,
            raise_amount: client.raise_amount,
            min_investment: client.min_investment,
            timeline: client.timeline,
            target_investor: client.target_investor,
            website: client.website,
            brand_notes: client.brand_notes,
            additional_notes: client.additional_notes,
            contact_name: client.contact_name,
            speaker_name: client.speaker_name,
            industry_focus: client.industry_focus,
            targeted_returns: client.targeted_returns,
            hold_period: client.hold_period,
            distribution_schedule: client.distribution_schedule,
            investment_range: client.investment_range,
            tax_advantages: client.tax_advantages,
            credibility: client.credibility,
            fund_history: client.fund_history,
          },
          existing_research,
          existing_angles,
        },
      });
      if (error) throw error;
      toast({ title: `${label} regenerated!`, description: 'Fresh content is ready for your review.' });
      setHasBeenEdited(false);
      await loadAsset();
    } catch (e: any) {
      const msg = e.message || '';
      let description = 'Please try again in a moment.';
      if (msg.includes('429') || msg.toLowerCase().includes('rate')) {
        description = 'Too many requests. Please wait a minute and try again.';
      } else if (msg.includes('timeout') || msg.includes('TIMEOUT')) {
        description = 'Generation timed out. This can happen with complex content. Try again.';
      }
      toast({ title: 'Generation failed', description, variant: 'destructive' });
    }
    setRegenerating(false);
  };

  // Check prerequisites
  const prereqs = PREREQUISITES[assetType] || [];
  const missingPrereqs = prereqs.filter(p => !assetStatuses[p]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading {label.toLowerCase()}...
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
          <Icon className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="font-display text-base font-bold text-foreground mb-1">{label}</h3>
        <p className="text-sm text-muted-foreground mb-1">{description}</p>

        {missingPrereqs.length > 0 ? (
          <div className="mt-3 mb-4 bg-amber-500/10 border border-amber-200 rounded-lg px-4 py-2.5 max-w-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-medium text-amber-700">Generate these first for best results:</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {missingPrereqs.map(p => ALL_TABS.find(t => t.value === p)?.label || p).join(', ')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/70 mb-4">
            {assetType === 'research' ? 'This is the starting point — generates market data and statistics for all other assets.' :
             'Ready to generate! Research & angles data will be used automatically.'}
          </p>
        )}

        <Button onClick={regenerate} disabled={regenerating} size="sm" className="gap-2">
          {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {regenerating ? 'Generating... this may take 30-60s' : `Generate ${label}`}
        </Button>
      </div>
    );
  }

  const renderer = RENDERERS[assetType];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-bold text-foreground">{label}</h3>
            <Badge className={`text-[10px] ${STATUS_STYLES[asset.status] || STATUS_STYLES.draft}`}>
              {asset.status.replace('_', ' ')}
            </Badge>
            {hasBeenEdited && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">edited</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Generated {new Date(asset.created_at).toLocaleString()} · v{asset.version}
            {hasBeenEdited && ` · Last edited ${new Date(asset.updated_at).toLocaleString()}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button size="sm" variant="outline" onClick={cancelEditing} className="gap-1.5">
                <X className="w-3.5 h-3.5" /> Cancel
              </Button>
              <Button size="sm" onClick={saveEdits} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={startEditing} className="gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </Button>
              <Button size="sm" variant="outline" onClick={regenerate} disabled={regenerating} className="gap-1.5">
                {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                {regenerating ? 'Generating...' : 'Regenerate'}
              </Button>
            </>
          )}
        </div>
      </div>

      {renderer && renderer({
        content: editMode ? editedContent : asset.content,
        editMode,
        onEdit: (newContent: any) => setEditedContent(newContent),
      })}
    </div>
  );
}

export default function Portal() {
  const { token } = useParams<{ token: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [assetStatuses, setAssetStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }

    supabase
      .from('clients')
      .select('*')
      .eq('share_token', token)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else {
          setClient(data as Client);
          loadAssetStatuses(data.id);
        }
        setLoading(false);
      });
  }, [token]);

  const loadAssetStatuses = async (clientId: string) => {
    const { data } = await supabase
      .from('client_assets')
      .select('asset_type, status')
      .eq('client_id', clientId);
    const statuses: Record<string, string> = {};
    (data || []).forEach((a: any) => {
      if (!statuses[a.asset_type]) statuses[a.asset_type] = a.status;
    });
    setAssetStatuses(statuses);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <img src={logo} alt="AI Capital Raising" className="h-8 mx-auto mb-6" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Portal Not Found</h1>
          <p className="text-muted-foreground">This link may be invalid or expired. Please check with your account manager.</p>
        </div>
      </div>
    );
  }

  // Find first tab with content, default to research
  const firstAvailable = ALL_TABS.find(t => assetStatuses[t.value])?.value || 'research';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src={logo} alt="AI Capital Raising" className="h-8" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {Object.keys(assetStatuses).length}/10 assets
            </span>
            <Badge className={`text-[10px] ${STATUS_STYLES[client.status] || STATUS_STYLES.onboarding}`}>
              {client.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{client.company_name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome, {client.contact_name}. Review, edit, and approve your campaign assets below.
          </p>
        </div>

        {/* Summary */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <Target className="w-5 h-5 text-primary" />
              <div><p className="text-xs text-muted-foreground">Raise</p><p className="font-semibold text-sm">{client.raise_amount ? `$${client.raise_amount}` : '—'}</p></div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div><p className="text-xs text-muted-foreground">Timeline</p><p className="font-semibold text-sm">{client.timeline || '—'}</p></div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-primary" />
              <div><p className="text-xs text-muted-foreground">Fund Type</p><p className="font-semibold text-sm">{client.fund_type || '—'}</p></div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={firstAvailable} className="space-y-4">
          {/* Grouped tabs with status indicators */}
          <div className="space-y-2">
            {TAB_GROUPS.map((group) => (
              <div key={group.label} className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider w-16 shrink-0 hidden sm:block">
                  {group.label}
                </span>
                <TabsList className="h-auto gap-1 bg-muted/50 p-1">
                  {group.tabs.map((tab) => {
                    const status = assetStatuses[tab.value];
                    return (
                      <TabsTrigger key={tab.value} value={tab.value} className="text-xs gap-1.5 relative">
                        <tab.icon className="w-3 h-3" />
                        {tab.label}
                        {status && (
                          <span className={`w-1.5 h-1.5 rounded-full ${status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>
            ))}
          </div>

          {ALL_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <PortalAssetTab
                client={client}
                assetType={tab.value}
                icon={tab.icon}
                label={tab.label}
                description={tab.description}
                assetStatuses={assetStatuses}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
