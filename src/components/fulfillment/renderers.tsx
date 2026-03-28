import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface RenderProps {
  content: any;
  editMode?: boolean;
  onEdit?: (content: any) => void;
}

function EditField({ value, onChange, rows = 3, className = '' }: { value: string; onChange: (v: string) => void; rows?: number; className?: string }) {
  return <Textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={rows} className={`text-sm ${className}`} />;
}

export function ResearchRenderer({ content, editMode, onEdit }: RenderProps) {
  if (!content) return <p className="text-sm text-muted-foreground py-4">No research content generated yet.</p>;
  if (content.raw || content._parse_error) return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-200 rounded-lg px-3 py-2">
        <span className="text-amber-600 text-xs font-medium">Data Quality Warning</span>
        <span className="text-amber-600/70 text-[10px]">Research returned unstructured data. Statistics may not be source-verified. Please regenerate for better accuracy.</span>
      </div>
      <pre className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg max-h-96 overflow-auto">{content.raw || JSON.stringify(content, null, 2)}</pre>
    </div>
  );

  const updateField = (key: string, val: string) => {
    if (onEdit) onEdit({ ...content, [key]: val });
  };

  const sections = [
    { key: 'why_asset_class', label: '🎯 Why This Asset Class' },
    { key: 'why_company', label: '🏢 Why This Company' },
    { key: 'why_now', label: '⏰ Why Now' },
    { key: 'why_location', label: '📍 Why This Location / Market' },
    { key: 'industry_overview', label: 'Industry Overview' },
    { key: 'supply_demand', label: 'Supply & Demand' },
    { key: 'competitive_landscape', label: 'Competitive Landscape' },
    { key: 'timing_factors', label: 'Timing Factors' },
    { key: 'deal_specifics', label: 'Deal Specifics' },
  ];

  const stats = content.key_statistics || [];
  const news = content.recent_news || [];
  const sources = content._grounding_sources || [];

  return (
    <div className="space-y-6">
      {stats.length > 0 && (
        <div>
          <h4 className="font-display font-bold text-foreground mb-3 text-sm">Key Statistics</h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.map((s: any, i: number) => (
              <Card key={i} className="border-primary/20 bg-primary/5">
                <CardContent className="p-3">
                  {editMode ? (
                    <>
                      <EditField value={s.stat} onChange={(v) => { const ns = [...stats]; ns[i] = { ...ns[i], stat: v }; onEdit?.({ ...content, key_statistics: ns }); }} rows={1} />
                      <EditField value={s.context} onChange={(v) => { const ns = [...stats]; ns[i] = { ...ns[i], context: v }; onEdit?.({ ...content, key_statistics: ns }); }} rows={2} />
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-foreground text-lg">{s.stat}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.context}</p>
                      {s.source && <p className="text-[10px] text-muted-foreground/60 mt-1">Source: {s.source}</p>}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {sections.map(({ key, label }) => content[key] && (
          <Card key={key} className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <EditField value={content[key]} onChange={(v) => updateField(key, v)} rows={5} />
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{content[key]}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {news.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Recent News & Developments</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {news.map((item: any, i: number) => (
              <p key={i} className="text-sm text-muted-foreground">• {typeof item === 'string' ? item : item.headline || item.title || JSON.stringify(item)}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {sources.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Research Sources</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {sources.map((src: any, i: number) => (
              <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline block truncate">
                {src.title || src.uri}
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function AnglesRenderer({ content, editMode, onEdit }: RenderProps) {
  const angles = Array.isArray(content) ? content : [];
  const updateAngle = (i: number, key: string, val: string) => {
    if (!onEdit) return;
    const updated = [...angles];
    updated[i] = { ...updated[i], [key]: val };
    onEdit(updated);
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {angles.map((angle: any, i: number) => (
        <Card key={i} className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                {editMode ? <EditField value={angle.title} onChange={(v) => updateAngle(i, 'title', v)} rows={1} /> : angle.title}
              </CardTitle>
              <Badge variant="outline" className="text-[9px]">Angle {i + 1}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {editMode ? (
              <>
                <EditField value={angle.hook} onChange={(v) => updateAngle(i, 'hook', v)} rows={2} />
                <EditField value={angle.emotional_driver} onChange={(v) => updateAngle(i, 'emotional_driver', v)} rows={1} />
                <EditField value={angle.why_it_works} onChange={(v) => updateAngle(i, 'why_it_works', v)} rows={2} />
                <EditField value={angle.use_case} onChange={(v) => updateAngle(i, 'use_case', v)} rows={1} />
              </>
            ) : (
              <>
                <p className="font-medium text-foreground">"{angle.hook}"</p>
                <p className="text-muted-foreground"><span className="font-medium text-foreground/80">Emotion:</span> {angle.emotional_driver}</p>
                <p className="text-muted-foreground"><span className="font-medium text-foreground/80">Why it works:</span> {angle.why_it_works}</p>
                <p className="text-muted-foreground"><span className="font-medium text-foreground/80">Use case:</span> {angle.use_case}</p>
              </>
            )}
            {!editMode && angle.ad_hooks && (
              <div>
                <p className="font-medium text-foreground/80 text-xs mb-1">Ad Hooks:</p>
                {angle.ad_hooks.map((h: string, j: number) => (
                  <p key={j} className="text-xs text-muted-foreground">• {h}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function EmailsRenderer({ content, editMode, onEdit }: RenderProps) {
  const emails = Array.isArray(content) ? content : [];
  const updateEmail = (i: number, key: string, val: string) => {
    if (!onEdit) return;
    const updated = [...emails];
    updated[i] = { ...updated[i], [key]: val };
    onEdit(updated);
  };

  return (
    <div className="space-y-4">
      {emails.map((email: any, i: number) => (
        <Card key={i} className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                {editMode ? (
                  <EditField value={email.subject} onChange={(v) => updateEmail(i, 'subject', v)} rows={1} />
                ) : (
                  <>Email {email.sequence_step || i + 1}: {email.subject}</>
                )}
              </CardTitle>
              <Badge variant="outline" className="text-[9px]">{email.purpose}</Badge>
            </div>
            {!editMode && <p className="text-xs text-muted-foreground">{email.preview_text}</p>}
            {editMode && <EditField value={email.preview_text} onChange={(v) => updateEmail(i, 'preview_text', v)} rows={1} />}
          </CardHeader>
          <CardContent>
            {editMode ? (
              <EditField value={email.body} onChange={(v) => updateEmail(i, 'body', v)} rows={8} />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{email.body}</p>
            )}
            <div className="mt-3 pt-3 border-t border-border">
              {editMode ? (
                <EditField value={email.cta_text} onChange={(v) => updateEmail(i, 'cta_text', v)} rows={1} />
              ) : (
                <>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">{email.cta_text}</Badge>
                  {email.angle_used && <span className="ml-2 text-xs text-muted-foreground">Angle: {email.angle_used}</span>}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SMSRenderer({ content, editMode, onEdit }: RenderProps) {
  const messages = Array.isArray(content) ? content : [];
  const updateSMS = (i: number, key: string, val: string) => {
    if (!onEdit) return;
    const updated = [...messages];
    updated[i] = { ...updated[i], [key]: val };
    onEdit(updated);
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {messages.map((sms: any, i: number) => (
        <Card key={i} className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Step {sms.sequence_step || i + 1}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px]">{sms.purpose}</Badge>
                <span className="text-[10px] text-muted-foreground">{sms.character_count} chars</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {editMode ? (
              <EditField value={sms.message} onChange={(v) => updateSMS(i, 'message', v)} rows={3} />
            ) : (
              <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">{sms.message}</p>
            )}
            <p className="text-xs text-muted-foreground">Timing: {sms.timing}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdCopyRenderer({ content, editMode, onEdit }: RenderProps) {
  const ads = Array.isArray(content) ? content : [];
  const updateAd = (i: number, key: string, val: string) => {
    if (!onEdit) return;
    const updated = [...ads];
    updated[i] = { ...updated[i], [key]: val };
    onEdit(updated);
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {ads.map((ad: any, i: number) => (
        <Card key={i} className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                {editMode ? <EditField value={ad.headline} onChange={(v) => updateAd(i, 'headline', v)} rows={1} /> : ad.headline}
              </CardTitle>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-[9px]">{ad.platform}</Badge>
                <Badge variant="outline" className="text-[9px]">v{ad.variation}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {editMode ? (
              <>
                <EditField value={ad.primary_text} onChange={(v) => updateAd(i, 'primary_text', v)} rows={4} />
                <EditField value={ad.description} onChange={(v) => updateAd(i, 'description', v)} rows={2} />
              </>
            ) : (
              <>
                <p className="text-muted-foreground">{ad.primary_text}</p>
                <p className="text-xs text-muted-foreground">{ad.description}</p>
              </>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">{ad.cta}</Badge>
              <span className="text-[10px] text-muted-foreground">Angle: {ad.angle}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ScriptsRenderer({ content, editMode, onEdit }: RenderProps) {
  const scripts = Array.isArray(content) ? content : [];
  const updateScript = (i: number, key: string, val: string) => {
    if (!onEdit) return;
    const updated = [...scripts];
    updated[i] = { ...updated[i], [key]: val };
    onEdit(updated);
  };

  return (
    <div className="space-y-4">
      {scripts.map((script: any, i: number) => (
        <Card key={i} className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                {editMode ? <EditField value={script.title} onChange={(v) => updateScript(i, 'title', v)} rows={1} /> : script.title}
              </CardTitle>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-[9px]">{script.type}</Badge>
                <Badge variant="outline" className="text-[9px]">{script.format}</Badge>
                <Badge variant="outline" className="text-[9px]">~{script.duration_estimate}s</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium text-foreground/80 mb-1">Hook</p>
              {editMode ? (
                <EditField value={script.hook} onChange={(v) => updateScript(i, 'hook', v)} rows={2} />
              ) : (
                <p className="text-foreground font-medium bg-primary/5 p-2 rounded">{script.hook}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-foreground/80 mb-1">Body</p>
              {editMode ? (
                <EditField value={script.body} onChange={(v) => updateScript(i, 'body', v)} rows={6} />
              ) : (
                <p className="text-muted-foreground whitespace-pre-line">{script.body}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-foreground/80 mb-1">CTA</p>
              {editMode ? (
                <EditField value={script.cta} onChange={(v) => updateScript(i, 'cta', v)} rows={1} />
              ) : (
                <p className="text-primary font-medium">{script.cta}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CreativesRenderer({ content, editMode, onEdit }: RenderProps) {
  if (!content) return (
    <div className="text-center py-8 text-muted-foreground">
      <p className="text-sm">No creative concepts generated yet.</p>
      <p className="text-xs mt-1">Generate creatives to see static ad and video concepts here.</p>
    </div>
  );

  if (content.raw || content._parse_error) return (
    <div className="space-y-3 py-4">
      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-200 rounded-lg px-3 py-2">
        <span className="text-amber-600 text-xs font-medium">Data Quality Warning</span>
        <span className="text-amber-600/70 text-[10px]">Creative generation returned unstructured data. Please regenerate for properly formatted concepts.</span>
      </div>
      <pre className="text-xs text-muted-foreground whitespace-pre-wrap max-h-60 overflow-auto bg-muted p-3 rounded">{content.raw}</pre>
    </div>
  );

  const statics = content.static_concepts || [];
  const videos = content.video_concepts || [];

  return (
    <div className="space-y-6">
      <StaticAdsSection statics={statics} content={content} editMode={editMode} onEdit={onEdit} />
      <VideoAdsSection videos={videos} content={content} editMode={editMode} onEdit={onEdit} />
    </div>
  );
}

function StaticAdsSection({ statics, content, editMode, onEdit }: { statics: any[]; content: any; editMode?: boolean; onEdit?: (c: any) => void }) {
  const updateStatic = (i: number, key: string, val: string) => {
    const ns = [...statics];
    ns[i] = { ...ns[i], [key]: val };
    onEdit?.({ ...content, static_concepts: ns });
  };

  const formatDimensions: Record<string, string> = {
    '1080x1080': '1:1 Square',
    '1080x1920': '9:16 Story',
    '1200x628': '1.91:1 Landscape',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-display font-bold text-foreground">Static Ad Concepts</h4>
        <Badge variant="outline" className="text-[10px]">{statics.length} concepts</Badge>
      </div>
      {statics.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No static ad concepts generated.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statics.map((c: any, i: number) => (
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
                {editMode ? (
                  <>
                    <EditField value={c.headline} onChange={(v) => updateStatic(i, 'headline', v)} rows={1} />
                    <EditField value={c.supporting_text} onChange={(v) => updateStatic(i, 'supporting_text', v)} rows={2} />
                    <EditField value={c.visual_direction} onChange={(v) => updateStatic(i, 'visual_direction', v)} rows={2} />
                    <EditField value={c.layout_idea} onChange={(v) => updateStatic(i, 'layout_idea', v)} rows={1} />
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
                  </>
                )}
                {!editMode && (
                  <>
                    <p className="text-[10px] text-muted-foreground/70">Visual: {c.visual_direction}</p>
                    <p className="text-[10px] text-muted-foreground/70">Layout: {c.layout_idea}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoAdsSection({ videos, content, editMode, onEdit }: { videos: any[]; content: any; editMode?: boolean; onEdit?: (c: any) => void }) {
  const updateVideo = (i: number, key: string, val: string) => {
    const nv = [...videos];
    nv[i] = { ...nv[i], [key]: val };
    onEdit?.({ ...content, video_concepts: nv });
  };

  const updateScene = (videoIdx: number, sceneIdx: number, val: string) => {
    const nv = [...videos];
    const scenes = [...(nv[videoIdx].visual_scenes || [])];
    scenes[sceneIdx] = val;
    nv[videoIdx] = { ...nv[videoIdx], visual_scenes: scenes };
    onEdit?.({ ...content, video_concepts: nv });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-display font-bold text-foreground">Video Ad Concepts</h4>
        <Badge variant="outline" className="text-[10px]">{videos.length} concepts</Badge>
      </div>
      {videos.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No video ad concepts generated.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {videos.map((v: any, i: number) => (
            <Card key={i} className="border-border hover:border-primary/20 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">Video {i + 1}</Badge>
                    <CardTitle className="text-sm">
                      {editMode ? (
                        <EditField value={v.style} onChange={(val) => updateVideo(i, 'style', val)} rows={1} />
                      ) : v.style}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[9px]">{v.format}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {editMode ? (
                  <>
                    <div>
                      <p className="text-xs font-medium text-foreground/80 mb-1">Setting</p>
                      <EditField value={v.setting} onChange={(val) => updateVideo(i, 'setting', val)} rows={1} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground/80 mb-1">Hook</p>
                      <EditField value={v.hook_concept} onChange={(val) => updateVideo(i, 'hook_concept', val)} rows={2} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground/80 mb-1">Caption Direction</p>
                      <EditField value={v.caption_direction} onChange={(val) => updateVideo(i, 'caption_direction', val)} rows={2} />
                    </div>
                    {v.visual_scenes && (
                      <div>
                        <p className="text-xs font-medium text-foreground/80 mb-1">Scenes</p>
                        {v.visual_scenes.map((s: string, j: number) => (
                          <div key={j} className="flex items-start gap-1 mb-1">
                            <span className="text-[10px] text-muted-foreground mt-2">{j + 1}.</span>
                            <EditField value={s} onChange={(val) => updateScene(i, j, val)} rows={1} />
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
          ))}
        </div>
      )}
    </div>
  );
}

export function ReportRenderer({ content, editMode, onEdit }: RenderProps) {
  if (!content) return null;
  const updateField = (key: string, val: string) => {
    if (onEdit) onEdit({ ...content, [key]: val });
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 text-center">
          {editMode ? (
            <>
              <EditField value={content.title} onChange={(v) => updateField('title', v)} rows={1} />
              {content.subtitle && <EditField value={content.subtitle} onChange={(v) => updateField('subtitle', v)} rows={1} />}
            </>
          ) : (
            <>
              <h2 className="font-display text-xl font-bold text-foreground">{content.title}</h2>
              {content.subtitle && <p className="text-sm text-muted-foreground mt-1">{content.subtitle}</p>}
            </>
          )}
        </CardContent>
      </Card>

      {[
        { key: 'executive_summary', label: 'Executive Summary' },
        { key: 'market_opportunity', label: 'Market Opportunity' },
        { key: 'why_now', label: 'Why Now' },
        { key: 'strategy_overview', label: 'Strategy Overview' },
        { key: 'operator_advantage', label: 'Operator Advantage' },
      ].map(({ key, label }) => content[key] && (
        <Card key={key} className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
          <CardContent>
            {editMode ? (
              <EditField value={content[key]} onChange={(v) => updateField(key, v)} rows={5} />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{content[key]}</p>
            )}
          </CardContent>
        </Card>
      ))}

      {content.faqs && (
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">FAQs</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {content.faqs.map((faq: any, i: number) => (
              <div key={i}>
                {editMode ? (
                  <>
                    <EditField value={faq.question} onChange={(v) => { const nf = [...content.faqs]; nf[i] = { ...nf[i], question: v }; onEdit?.({ ...content, faqs: nf }); }} rows={1} />
                    <EditField value={faq.answer} onChange={(v) => { const nf = [...content.faqs]; nf[i] = { ...nf[i], answer: v }; onEdit?.({ ...content, faqs: nf }); }} rows={2} />
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">{faq.question}</p>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {content.cta_heading && !editMode && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center">
            <h3 className="font-display font-bold text-foreground">{content.cta_heading}</h3>
            <p className="text-sm text-muted-foreground mt-1">{content.cta_body}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function FunnelRenderer({ content, editMode, onEdit }: RenderProps) {
  if (!content) return null;
  const updateNested = (section: string, key: string, val: string) => {
    if (onEdit) onEdit({ ...content, [section]: { ...content[section], [key]: val } });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {content.landing_page && (
        <Card className="border-border">
          <CardHeader><CardTitle className="text-sm">Landing Page</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {editMode ? (
              <>
                <EditField value={content.landing_page.headline} onChange={(v) => updateNested('landing_page', 'headline', v)} rows={2} />
                <EditField value={content.landing_page.subheadline} onChange={(v) => updateNested('landing_page', 'subheadline', v)} rows={2} />
              </>
            ) : (
              <>
                <p className="font-bold text-lg text-foreground">{content.landing_page.headline}</p>
                <p className="text-muted-foreground">{content.landing_page.subheadline}</p>
              </>
            )}
            {content.landing_page.body_sections?.map((s: any, i: number) => (
              <div key={i}>
                <p className="font-medium text-foreground">{s.heading}</p>
                <p className="text-muted-foreground">{s.copy}</p>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Badge className="bg-primary/10 text-primary border-primary/20">{content.landing_page.cta_primary}</Badge>
              {content.landing_page.cta_secondary && <Badge variant="outline">{content.landing_page.cta_secondary}</Badge>}
            </div>
          </CardContent>
        </Card>
      )}

      {content.thank_you_page && (
        <Card className="border-border">
          <CardHeader><CardTitle className="text-sm">Thank You Page</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {editMode ? (
              <>
                <EditField value={content.thank_you_page.headline} onChange={(v) => updateNested('thank_you_page', 'headline', v)} rows={1} />
                <EditField value={content.thank_you_page.body} onChange={(v) => updateNested('thank_you_page', 'body', v)} rows={3} />
              </>
            ) : (
              <>
                <p className="font-bold text-foreground">{content.thank_you_page.headline}</p>
                <p className="text-muted-foreground">{content.thank_you_page.body}</p>
              </>
            )}
            {content.thank_you_page.next_steps?.map((s: string, i: number) => (
              <p key={i} className="text-muted-foreground">• {s}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {content.booking_page && (
        <Card className="border-border">
          <CardHeader><CardTitle className="text-sm">Booking Page</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {editMode ? (
              <>
                <EditField value={content.booking_page.headline} onChange={(v) => updateNested('booking_page', 'headline', v)} rows={1} />
                <EditField value={content.booking_page.subheadline} onChange={(v) => updateNested('booking_page', 'subheadline', v)} rows={2} />
              </>
            ) : (
              <>
                <p className="font-bold text-foreground">{content.booking_page.headline}</p>
                <p className="text-muted-foreground">{content.booking_page.subheadline}</p>
              </>
            )}
            {content.booking_page.bullet_points?.map((b: string, i: number) => (
              <p key={i} className="text-muted-foreground">✓ {b}</p>
            ))}
            {content.booking_page.urgency_note && (
              <p className="text-primary text-xs font-medium">{content.booking_page.urgency_note}</p>
            )}
          </CardContent>
        </Card>
      )}

      {content.investor_portal_intro && (
        <Card className="border-border">
          <CardHeader><CardTitle className="text-sm">Investor Portal</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-bold text-foreground">{content.investor_portal_intro.welcome_headline}</p>
            <p className="text-muted-foreground">{content.investor_portal_intro.welcome_body}</p>
          </CardContent>
        </Card>
      )}

      {content.faqs && (
        <Card className="border-border">
          <CardHeader><CardTitle className="text-sm">FAQs</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {content.faqs.map((faq: any, i: number) => (
              <div key={i}>
                <p className="text-sm font-medium text-foreground">{faq.question}</p>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function SetterRenderer({ content, editMode, onEdit }: RenderProps) {
  if (!content) return null;
  const updateField = (key: string, val: string) => {
    if (onEdit) onEdit({ ...content, [key]: val });
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Intro Message */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Intro Message</CardTitle></CardHeader>
        <CardContent>
          {editMode ? (
            <EditField value={content.intro_message} onChange={(v) => updateField('intro_message', v)} rows={3} />
          ) : (
            <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg whitespace-pre-line">{content.intro_message}</p>
          )}
        </CardContent>
      </Card>

      {/* Positive Response */}
      {content.positive_response && (
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Positive Response</CardTitle></CardHeader>
          <CardContent>
            {editMode ? (
              <EditField value={content.positive_response} onChange={(v) => updateField('positive_response', v)} rows={2} />
            ) : (
              <p className="text-sm text-muted-foreground">{content.positive_response}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Key Offer Details */}
      {content.key_offer_details && (
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Key Offer Details</CardTitle></CardHeader>
          <CardContent>
            {editMode ? (
              <EditField value={content.key_offer_details} onChange={(v) => updateField('key_offer_details', v)} rows={3} />
            ) : (
              <p className="text-sm text-muted-foreground">{content.key_offer_details}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rules */}
      {content.rules && (
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Setter Rules</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {content.rules.map((rule: string, i: number) => (
              <p key={i} className="text-sm text-muted-foreground">{i + 1}. {rule}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* FAQ */}
      {content.faq && (
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Setter FAQ</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {content.faq.map((item: any, i: number) => (
              <div key={i}>
                {editMode ? (
                  <>
                    <EditField value={item.question} onChange={(v) => { const nf = [...content.faq]; nf[i] = { ...nf[i], question: v }; onEdit?.({ ...content, faq: nf }); }} rows={1} />
                    <EditField value={item.answer} onChange={(v) => { const nf = [...content.faq]; nf[i] = { ...nf[i], answer: v }; onEdit?.({ ...content, faq: nf }); }} rows={2} />
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">Q: {item.question}</p>
                    <p className="text-sm text-muted-foreground">A: {item.answer}</p>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Follow-up Sequence */}
      {content.follow_up_sequence && (
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Follow-up Cadence</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {content.follow_up_sequence.map((step: any, i: number) => (
              <div key={i} className="border-l-2 border-primary/20 pl-3">
                <p className="text-sm font-medium text-foreground">{step.timing || `Step ${i + 1}`}</p>
                {step.bump_messages ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {step.bump_messages.map((msg: string, j: number) => (
                      <Badge key={j} variant="outline" className="text-[10px]">{msg}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{step.message || JSON.stringify(step)}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Fund Details Summary */}
      {content.fund_details_summary && (
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Fund Details for AI</CardTitle></CardHeader>
          <CardContent>
            {editMode ? (
              <EditField value={content.fund_details_summary} onChange={(v) => updateField('fund_details_summary', v)} rows={5} />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-line">{content.fund_details_summary}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
