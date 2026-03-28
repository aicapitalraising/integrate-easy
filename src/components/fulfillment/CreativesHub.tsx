import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Sparkles, RefreshCw, Edit3, Save, X, Image, Video, Calendar, Bot } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';
import CreativeAutomation from './CreativeAutomation';
import AvatarConfig from './AvatarConfig';

interface Client {
  id: string;
  company_name: string;
  fund_name: string | null;
  fund_type: string | null;
  raise_amount: string | null;
  min_investment: string | null;
  timeline: string | null;
  target_investor: string | null;
  website: string | null;
  brand_notes: string | null;
  additional_notes: string | null;
  contact_name?: string;
  speaker_name?: string | null;
  industry_focus?: string | null;
  targeted_returns?: string | null;
  hold_period?: string | null;
  distribution_schedule?: string | null;
  investment_range?: string | null;
  tax_advantages?: string | null;
  credibility?: string | null;
  fund_history?: string | null;
}

interface Asset {
  id: string;
  asset_type: string;
  content: Json;
  status: string;
  version: number;
  created_at: string;
}

interface CreativesHubProps {
  client: Client;
}

// Reusable EditField
function EditField({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={rows} className="w-full text-sm border rounded-md px-3 py-2 bg-background" />;
}

const statusBadge: Record<string, string> = {
  draft: 'bg-amber-500/10 text-amber-600 border-amber-200',
  internal_review: 'bg-blue-500/10 text-blue-600 border-blue-200',
  client_review: 'bg-purple-500/10 text-purple-600 border-purple-200',
  approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
};

export default function CreativesHub({ client }: CreativesHubProps) {
  const [staticAssets, setStaticAssets] = useState<Asset[]>([]);
  const [videoAssets, setVideoAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingStatic, setGeneratingStatic] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [editMode, setEditMode] = useState<'static' | 'video' | null>(null);
  const [editedContent, setEditedContent] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<any[]>([]);

  useEffect(() => { loadAll(); }, [client.id]);

  const loadAll = async () => {
    setLoading(true);
    const [assetsRes, historyRes] = await Promise.all([
      supabase
        .from('client_assets')
        .select('*')
        .eq('client_id', client.id)
        .in('asset_type', ['creatives', 'static_ads', 'video_ads'])
        .order('created_at', { ascending: false }),
      supabase
        .from('creative_generations')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    const allAssets = (assetsRes.data as Asset[]) || [];
    // Split by type - legacy 'creatives' assets have both static and video
    const statics: Asset[] = [];
    const videos: Asset[] = [];

    allAssets.forEach(a => {
      if (a.asset_type === 'static_ads') {
        statics.push(a);
      } else if (a.asset_type === 'video_ads') {
        videos.push(a);
      } else if (a.asset_type === 'creatives') {
        // Legacy format - split into both
        const content = a.content as any;
        if (content?.static_concepts?.length) statics.push(a);
        if (content?.video_concepts?.length) videos.push(a);
      }
    });

    setStaticAssets(statics);
    setVideoAssets(videos);
    setGenerationHistory(historyRes.data || []);
    setLoading(false);
  };

  const getExistingContext = async () => {
    let existing_research = null;
    let existing_angles = null;

    const { data: researchAssets } = await supabase
      .from('client_assets')
      .select('content')
      .eq('client_id', client.id)
      .eq('asset_type', 'research')
      .order('created_at', { ascending: false })
      .limit(1);
    if (researchAssets?.[0]) existing_research = researchAssets[0].content;

    const { data: angleAssets } = await supabase
      .from('client_assets')
      .select('content')
      .eq('client_id', client.id)
      .eq('asset_type', 'angles')
      .order('created_at', { ascending: false })
      .limit(1);
    if (angleAssets?.[0]) existing_angles = angleAssets[0].content;

    return { existing_research, existing_angles };
  };

  const generateCreatives = async (type: 'static' | 'video') => {
    const setGenerating = type === 'static' ? setGeneratingStatic : setGeneratingVideo;
    setGenerating(true);

    try {
      const { existing_research, existing_angles } = await getExistingContext();

      if (!existing_research) {
        toast({ title: 'Research required', description: 'Generate Research first for better creative output.', variant: 'destructive' });
        setGenerating(false);
        return;
      }

      // Log the generation
      await supabase.from('creative_generations').insert({
        client_id: client.id,
        generation_type: 'manual',
        creative_type: type,
        status: 'generating',
      });

      const { data, error } = await supabase.functions.invoke('generate-asset', {
        body: {
          client_id: client.id,
          asset_type: type === 'static' ? 'static_ads' : 'video_ads',
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
      toast({ title: `${type === 'static' ? 'Static ads' : 'Video ads'} generated!`, description: 'New creative concepts are ready for review.' });
      await loadAll();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Generation failed', description: e.message || 'Please try again.', variant: 'destructive' });
    }
    setGenerating(false);
  };

  const saveEdits = async (assetId: string) => {
    if (!editedContent) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('client_assets')
        .update({ content: editedContent as unknown as Json })
        .eq('id', assetId);
      if (error) throw error;
      toast({ title: 'Changes saved!' });
      setEditMode(null);
      setEditedContent(null);
      await loadAll();
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const updateStatus = async (assetId: string, status: string) => {
    if (status === 'approved' && !confirm('Mark these creatives as approved?')) return;
    if (status === 'client_review' && !confirm('Send these creatives to the client for review?')) return;
    await supabase.from('client_assets').update({ status }).eq('id', assetId);
    await loadAll();
    toast({ title: `Status: ${status.replace('_', ' ')}` });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading creatives...
      </div>
    );
  }

  const formatDimensions: Record<string, string> = {
    '1080x1080': '1:1 Square',
    '1080x1920': '9:16 Story',
    '1200x628': '1.91:1 Landscape',
  };

  const getStaticConcepts = (asset: Asset) => {
    const content = asset.content as any;
    return content?.static_concepts || [];
  };

  const getVideoConcepts = (asset: Asset) => {
    const content = asset.content as any;
    return content?.video_concepts || [];
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="static" className="space-y-4">
        <TabsList className="h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="static" className="text-xs gap-1.5">
            <Image className="w-3.5 h-3.5" /> Static Ads
          </TabsTrigger>
          <TabsTrigger value="video" className="text-xs gap-1.5">
            <Video className="w-3.5 h-3.5" /> Video Ads
          </TabsTrigger>
          <TabsTrigger value="automation" className="text-xs gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Automation
          </TabsTrigger>
          <TabsTrigger value="avatar" className="text-xs gap-1.5">
            <Bot className="w-3.5 h-3.5" /> Avatar
          </TabsTrigger>
        </TabsList>

        {/* STATIC ADS TAB */}
        <TabsContent value="static">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Static Ad Concepts</h3>
                <p className="text-xs text-muted-foreground">Generate and manage static ad creative concepts for social media campaigns.</p>
              </div>
              <div className="flex items-center gap-2">
                {staticAssets.length > 0 && editMode === 'static' ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => { setEditMode(null); setEditedContent(null); }} className="gap-1.5">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </Button>
                    <Button size="sm" onClick={() => saveEdits(staticAssets[0].id)} disabled={saving} className="gap-1.5">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                    </Button>
                  </>
                ) : (
                  <>
                    {staticAssets.length > 0 && (
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditedContent(JSON.parse(JSON.stringify(staticAssets[0].content)));
                        setEditMode('static');
                      }} className="gap-1.5">
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </Button>
                    )}
                    <Button size="sm" onClick={() => generateCreatives('static')} disabled={generatingStatic} className="gap-1.5">
                      {generatingStatic ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : staticAssets.length > 0 ? <RefreshCw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {generatingStatic ? 'Generating...' : staticAssets.length > 0 ? 'Regenerate' : 'Generate Static Ads'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {staticAssets.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <Badge className={`text-[10px] ${statusBadge[staticAssets[0].status] || statusBadge.draft}`}>
                  {staticAssets[0].status.replace('_', ' ')}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  v{staticAssets[0].version} · Generated {new Date(staticAssets[0].created_at).toLocaleString()}
                </p>
              </div>
            )}

            {staticAssets.length === 0 && !generatingStatic ? (
              <Card className="border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Image className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-1">No Static Ads Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mb-1">
                    Generate static ad concepts optimized for Facebook, Instagram, and LinkedIn.
                  </p>
                  <p className="text-xs text-muted-foreground/70 mb-4">Tip: Generate Research & Angles first for best results.</p>
                  <Button onClick={() => generateCreatives('static')} disabled={generatingStatic} className="gap-2">
                    <Sparkles className="w-4 h-4" /> Generate Static Ads
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {staticAssets.length > 0 && !editMode && (
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => updateStatus(staticAssets[0].id, 'internal_review')} className="gap-1.5 text-xs">
                      Send to Review
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(staticAssets[0].id, 'client_review')} className="gap-1.5 text-xs">
                      Send to Client
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(staticAssets[0].id, 'approved')} className="gap-1.5 text-xs text-emerald-600">
                      Approve
                    </Button>
                  </div>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getStaticConcepts(staticAssets[0]).map((c: any, i: number) => {
                    const isEditing = editMode === 'static';
                    const content = isEditing ? editedContent : staticAssets[0].content;
                    const concepts = (content as any)?.static_concepts || [];

                    return (
                      <Card key={i} className="border-border hover:border-primary/20 transition-colors">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-[9px]">Ad {i + 1}</Badge>
                            <span className="text-[10px] text-muted-foreground">{formatDimensions[c.format] || c.format}</span>
                          </div>
                          <div className="w-full aspect-[4/3] bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex flex-col items-center justify-center text-center p-3 border border-dashed border-primary/20">
                            <span className="text-[10px] text-muted-foreground/70 mb-1">{c.format}</span>
                            <span className="text-xs text-primary/60 font-medium">{c.visual_direction ? c.visual_direction.substring(0, 60) + '...' : 'Visual preview'}</span>
                          </div>
                          {isEditing ? (
                            <>
                              <EditField value={concepts[i]?.headline} onChange={(v) => { const ns = [...concepts]; ns[i] = { ...ns[i], headline: v }; setEditedContent({ ...content, static_concepts: ns }); }} rows={1} />
                              <EditField value={concepts[i]?.supporting_text} onChange={(v) => { const ns = [...concepts]; ns[i] = { ...ns[i], supporting_text: v }; setEditedContent({ ...content, static_concepts: ns }); }} rows={2} />
                              <EditField value={concepts[i]?.visual_direction} onChange={(v) => { const ns = [...concepts]; ns[i] = { ...ns[i], visual_direction: v }; setEditedContent({ ...content, static_concepts: ns }); }} rows={2} />
                            </>
                          ) : (
                            <>
                              <p className="font-semibold text-sm text-foreground">{c.headline}</p>
                              <p className="text-xs text-muted-foreground">{c.supporting_text}</p>
                              {c.data_callout && (
                                <div className="bg-primary/5 border border-primary/20 rounded px-2 py-1">
                                  <p className="text-[10px] font-medium text-primary">{c.data_callout}</p>
                                  {c.data_source && <p className="text-[9px] text-muted-foreground/60">Source: {c.data_source}</p>}
                                </div>
                              )}
                              <p className="text-[10px] text-muted-foreground/70">Visual: {c.visual_direction}</p>
                              <p className="text-[10px] text-muted-foreground/70">Layout: {c.layout_idea}</p>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* VIDEO ADS TAB */}
        <TabsContent value="video">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Video Ad Concepts</h3>
                <p className="text-xs text-muted-foreground">Generate video ad scripts and concepts with avatar-ready formatting.</p>
              </div>
              <div className="flex items-center gap-2">
                {videoAssets.length > 0 && editMode === 'video' ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => { setEditMode(null); setEditedContent(null); }} className="gap-1.5">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </Button>
                    <Button size="sm" onClick={() => saveEdits(videoAssets[0].id)} disabled={saving} className="gap-1.5">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                    </Button>
                  </>
                ) : (
                  <>
                    {videoAssets.length > 0 && (
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditedContent(JSON.parse(JSON.stringify(videoAssets[0].content)));
                        setEditMode('video');
                      }} className="gap-1.5">
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </Button>
                    )}
                    <Button size="sm" onClick={() => generateCreatives('video')} disabled={generatingVideo} className="gap-1.5">
                      {generatingVideo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : videoAssets.length > 0 ? <RefreshCw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {generatingVideo ? 'Generating...' : videoAssets.length > 0 ? 'Regenerate' : 'Generate Video Ads'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {videoAssets.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <Badge className={`text-[10px] ${statusBadge[videoAssets[0].status] || statusBadge.draft}`}>
                  {videoAssets[0].status.replace('_', ' ')}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  v{videoAssets[0].version} · Generated {new Date(videoAssets[0].created_at).toLocaleString()}
                </p>
              </div>
            )}

            {videoAssets.length === 0 && !generatingVideo ? (
              <Card className="border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Video className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-1">No Video Ads Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mb-1">
                    Generate video ad concepts with scene breakdowns, hooks, and avatar-ready scripts.
                  </p>
                  <p className="text-xs text-muted-foreground/70 mb-4">Tip: Configure your avatar in the Avatar tab for personalized video ads.</p>
                  <Button onClick={() => generateCreatives('video')} disabled={generatingVideo} className="gap-2">
                    <Sparkles className="w-4 h-4" /> Generate Video Ads
                  </Button>
                </CardContent>
              </Card>
            ) : videoAssets.length > 0 && (
              <>
                {!editMode && (
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => updateStatus(videoAssets[0].id, 'internal_review')} className="gap-1.5 text-xs">
                      Send to Review
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(videoAssets[0].id, 'client_review')} className="gap-1.5 text-xs">
                      Send to Client
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(videoAssets[0].id, 'approved')} className="gap-1.5 text-xs text-emerald-600">
                      Approve
                    </Button>
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  {getVideoConcepts(videoAssets[0]).map((v: any, i: number) => {
                    const isEditing = editMode === 'video';
                    const content = isEditing ? editedContent : videoAssets[0].content;
                    const concepts = (content as any)?.video_concepts || [];

                    return (
                      <Card key={i} className="border-border hover:border-primary/20 transition-colors">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[9px]">Video {i + 1}</Badge>
                              <CardTitle className="text-sm">
                                {isEditing ? (
                                  <EditField value={concepts[i]?.style} onChange={(val) => { const nv = [...concepts]; nv[i] = { ...nv[i], style: val }; setEditedContent({ ...content, video_concepts: nv }); }} rows={1} />
                                ) : v.style}
                              </CardTitle>
                            </div>
                            <Badge variant="outline" className="text-[9px]">{v.format}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {v.avatar_id && (
                            <div className="flex items-center gap-2 bg-muted/50 rounded px-2 py-1">
                              <Bot className="w-3 h-3 text-primary" />
                              <span className="text-[10px] text-muted-foreground">Avatar assigned</span>
                            </div>
                          )}
                          {isEditing ? (
                            <>
                              <div>
                                <p className="text-xs font-medium text-foreground/80 mb-1">Setting</p>
                                <EditField value={concepts[i]?.setting} onChange={(val) => { const nv = [...concepts]; nv[i] = { ...nv[i], setting: val }; setEditedContent({ ...content, video_concepts: nv }); }} rows={1} />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-foreground/80 mb-1">Hook</p>
                                <EditField value={concepts[i]?.hook_concept} onChange={(val) => { const nv = [...concepts]; nv[i] = { ...nv[i], hook_concept: val }; setEditedContent({ ...content, video_concepts: nv }); }} rows={2} />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-foreground/80 mb-1">Caption Direction</p>
                                <EditField value={concepts[i]?.caption_direction} onChange={(val) => { const nv = [...concepts]; nv[i] = { ...nv[i], caption_direction: val }; setEditedContent({ ...content, video_concepts: nv }); }} rows={2} />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-foreground/80 mb-1">Script</p>
                                <EditField value={concepts[i]?.script} onChange={(val) => { const nv = [...concepts]; nv[i] = { ...nv[i], script: val }; setEditedContent({ ...content, video_concepts: nv }); }} rows={4} />
                              </div>
                              {concepts[i]?.visual_scenes && (
                                <div>
                                  <p className="text-xs font-medium text-foreground/80 mb-1">Scenes</p>
                                  {concepts[i].visual_scenes.map((s: string, j: number) => (
                                    <div key={j} className="flex items-start gap-1 mb-1">
                                      <span className="text-[10px] text-muted-foreground mt-2">{j + 1}.</span>
                                      <EditField value={s} onChange={(val) => {
                                        const nv = [...concepts];
                                        const scenes = [...(nv[i].visual_scenes || [])];
                                        scenes[j] = val;
                                        nv[i] = { ...nv[i], visual_scenes: scenes };
                                        setEditedContent({ ...content, video_concepts: nv });
                                      }} rows={1} />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <p className="text-muted-foreground"><span className="font-medium text-foreground/80">Setting:</span> {v.setting}</p>
                              <div className="bg-primary/5 border border-primary/20 rounded px-2 py-1.5">
                                <p className="text-xs font-medium text-primary">Hook: {v.hook_concept}</p>
                              </div>
                              <p className="text-muted-foreground"><span className="font-medium text-foreground/80">Caption:</span> {v.caption_direction}</p>
                              {v.script && (
                                <div>
                                  <p className="font-medium text-foreground/80 text-xs mb-1">Script:</p>
                                  <p className="text-xs text-muted-foreground whitespace-pre-line bg-muted/50 p-2 rounded">{v.script}</p>
                                </div>
                              )}
                              {v.visual_scenes && (
                                <div>
                                  <p className="font-medium text-foreground/80 text-xs mb-1">Scenes:</p>
                                  {v.visual_scenes.map((s: string, j: number) => (
                                    <p key={j} className="text-xs text-muted-foreground">
                                      <span className="font-medium text-foreground/60">{j + 1}.</span> {s}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* AUTOMATION TAB */}
        <TabsContent value="automation">
          <CreativeAutomation client={client} onGenerated={loadAll} />
        </TabsContent>

        {/* AVATAR TAB */}
        <TabsContent value="avatar">
          <AvatarConfig clientId={client.id} />
        </TabsContent>
      </Tabs>

      {/* Generation History */}
      {generationHistory.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Generation History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {generationHistory.slice(0, 5).map((gen: any) => (
                <div key={gen.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">{gen.creative_type}</Badge>
                    <span className="text-muted-foreground">{gen.generation_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[9px] ${gen.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : gen.status === 'failed' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'}`}>
                      {gen.status}
                    </Badge>
                    <span className="text-muted-foreground">{new Date(gen.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
