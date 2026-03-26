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
  Edit3, Save, X, RefreshCw, Bot, BarChart3, Sparkles,
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

const ASSET_TABS = [
  { value: 'research', label: 'Research', icon: BarChart3 },
  { value: 'angles', label: 'Angles', icon: Target },
  { value: 'emails', label: 'Emails', icon: Mail },
  { value: 'sms', label: 'SMS', icon: MessageSquare },
  { value: 'adcopy', label: 'Ad Copy', icon: Megaphone },
  { value: 'scripts', label: 'Scripts', icon: Video },
  { value: 'creatives', label: 'Creatives', icon: Image },
  { value: 'report', label: 'Report', icon: FileText },
  { value: 'funnel', label: 'Funnel', icon: Globe },
  { value: 'setter', label: 'AI Setter', icon: Bot },
];

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

function PortalAssetTab({ client, assetType, icon: Icon, label }: { client: Client; assetType: string; icon: any; label: string }) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

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
    setAsset((data?.[0] as Asset) || null);
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
      toast({ title: 'Changes saved!' });
      setEditMode(false);
      setEditedContent(null);
      await loadAsset();
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const regenerate = async () => {
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
      toast({ title: `${label} regenerated!` });
      await loadAsset();
    } catch (e: any) {
      toast({ title: 'Regeneration failed', description: e.message, variant: 'destructive' });
    }
    setRegenerating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading…
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
        <p className="text-sm text-muted-foreground mb-4">No content generated yet.</p>
        <Button onClick={regenerate} disabled={regenerating} size="sm" className="gap-2">
          {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {regenerating ? 'Generating…' : `Generate ${label}`}
        </Button>
      </div>
    );
  }

  const renderer = RENDERERS[assetType];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-foreground">{label}</h3>
          <p className="text-xs text-muted-foreground">
            Generated {new Date(asset.created_at).toLocaleString()} · v{asset.version}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-[10px] ${asset.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' : 'bg-amber-500/10 text-amber-600 border-amber-200'}`}>
            {asset.status.replace('_', ' ')}
          </Badge>
          {editMode ? (
            <>
              <Button size="sm" variant="outline" onClick={cancelEditing} className="gap-1.5">
                <X className="w-3.5 h-3.5" /> Cancel
              </Button>
              <Button size="sm" onClick={saveEdits} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={startEditing} className="gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </Button>
              <Button size="sm" variant="outline" onClick={regenerate} disabled={regenerating} className="gap-1.5">
                {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Regenerate
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

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }

    supabase
      .from('clients')
      .select('*')
      .eq('share_token', token)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setClient(data as Client);
        setLoading(false);
      });
  }, [token]);

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
          <p className="text-muted-foreground">This link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src={logo} alt="AI Capital Raising" className="h-8" />
          <Badge className={`text-[10px] ${statusColors[client.status] || statusColors.onboarding}`}>
            {client.status.replace('_', ' ')}
          </Badge>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{client.company_name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome, {client.contact_name}. Review, edit, and regenerate your campaign assets below.
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

        <Tabs defaultValue="emails" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {ASSET_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs">{tab.label}</TabsTrigger>
            ))}
          </TabsList>

          {ASSET_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <PortalAssetTab client={client} assetType={tab.value} icon={tab.icon} label={tab.label} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
