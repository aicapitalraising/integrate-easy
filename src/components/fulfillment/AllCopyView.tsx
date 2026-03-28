import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Clock, Edit3, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';
import {
  ResearchRenderer, AnglesRenderer, EmailsRenderer, SMSRenderer,
  AdCopyRenderer, ScriptsRenderer, CreativesRenderer, ReportRenderer, FunnelRenderer, SetterRenderer,
} from '@/components/fulfillment/renderers';

interface Asset {
  id: string;
  asset_type: string;
  content: Json;
  status: string;
  version: number;
  created_at: string;
}

interface AllCopyViewProps {
  clientId: string;
}

const SECTION_CONFIG = [
  { type: 'research', label: 'Research', renderer: ResearchRenderer },
  { type: 'angles', label: 'Marketing Angles', renderer: AnglesRenderer },
  { type: 'emails', label: 'Email Sequences', renderer: EmailsRenderer },
  { type: 'sms', label: 'SMS Sequences', renderer: SMSRenderer },
  { type: 'adcopy', label: 'Ad Copy', renderer: AdCopyRenderer },
  { type: 'scripts', label: 'Video Scripts', renderer: ScriptsRenderer },
  { type: 'creatives', label: 'Creative Concepts', renderer: CreativesRenderer },
  { type: 'report', label: 'Special Report', renderer: ReportRenderer },
  { type: 'funnel', label: 'Funnel Copy', renderer: FunnelRenderer },
  { type: 'setter', label: 'AI Setter', renderer: SetterRenderer },
];

const statusBadge: Record<string, string> = {
  draft: 'bg-amber-500/10 text-amber-600 border-amber-200',
  internal_review: 'bg-blue-500/10 text-blue-600 border-blue-200',
  client_review: 'bg-purple-500/10 text-purple-600 border-purple-200',
  approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  revision: 'bg-red-500/10 text-red-600 border-red-200',
};

export default function AllCopyView({ clientId }: AllCopyViewProps) {
  const [assets, setAssets] = useState<Record<string, Asset>>({});
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAllAssets(); }, [clientId]);

  const loadAllAssets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('client_assets')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    const grouped: Record<string, Asset> = {};
    (data || []).forEach((a: any) => {
      if (!grouped[a.asset_type]) grouped[a.asset_type] = a as Asset;
    });
    setAssets(grouped);
    setLoading(false);
  };

  const updateStatus = async (assetId: string, status: string) => {
    const label = status.replace('_', ' ');
    if (status === 'approved' && !confirm(`Mark this asset as approved? This signals it's ready for launch.`)) return;
    if (status === 'client_review' && !confirm(`Send this asset to the client for review?`)) return;
    await supabase.from('client_assets').update({ status }).eq('id', assetId);
    await loadAllAssets();
    toast({ title: `Status: ${label}`, description: status === 'approved' ? 'Asset is approved and ready.' : `Asset moved to ${label}.` });
  };

  const startEdit = (type: string) => {
    const asset = assets[type];
    if (asset) {
      setEditedContent(JSON.parse(JSON.stringify(asset.content)));
      setEditingType(type);
    }
  };

  const cancelEdit = () => { setEditingType(null); setEditedContent(null); };

  const saveEdit = async () => {
    if (!editingType || !editedContent) return;
    setSaving(true);
    const asset = assets[editingType];
    if (asset) {
      const { error } = await supabase
        .from('client_assets')
        .update({ content: editedContent as unknown as Json })
        .eq('id', asset.id);
      if (error) {
        toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Changes saved!' });
        setEditingType(null);
        setEditedContent(null);
        await loadAllAssets();
      }
    }
    setSaving(false);
  };

  const toggleCollapse = (type: string) => {
    setCollapsed(prev => ({ ...prev, [type]: !prev[type] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading all copy…
      </div>
    );
  }

  const generatedTypes = SECTION_CONFIG.filter(s => assets[s.type]);
  const missingTypes = SECTION_CONFIG.filter(s => !assets[s.type]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-foreground">
          {generatedTypes.length}/{SECTION_CONFIG.length} assets
        </span>
        {Object.values(assets).filter(a => a.status === 'approved').length > 0 && (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-[10px]">
            {Object.values(assets).filter(a => a.status === 'approved').length} approved
          </Badge>
        )}
        {Object.values(assets).filter(a => a.status === 'draft').length > 0 && (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 text-[10px]">
            {Object.values(assets).filter(a => a.status === 'draft').length} drafts
          </Badge>
        )}
      </div>

      {missingTypes.length > 0 && (
        <div className="bg-muted/50 border border-border rounded-lg px-4 py-3">
          <p className="text-xs font-medium text-foreground mb-1">Not yet generated ({missingTypes.length})</p>
          <p className="text-xs text-muted-foreground">
            {missingTypes.map(m => m.label).join(' → ')}
          </p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">
            Use "Generate All Assets" above or generate individually from each asset tab.
            {!assets['research'] && ' Start with Research for best results.'}
          </p>
        </div>
      )}

      {SECTION_CONFIG.map(({ type, label, renderer: Renderer }) => {
        const asset = assets[type];
        if (!asset) return null;

        const isCollapsed = collapsed[type];
        const isEditing = editingType === type;

        return (
          <Card key={type} className={`border-border ${asset.status === 'approved' ? 'border-emerald-200 bg-emerald-500/5' : ''}`}>
            <CardHeader className="pb-3 cursor-pointer" onClick={() => !isEditing && toggleCollapse(type)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isCollapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                  <CardTitle className="text-base font-bold">{label}</CardTitle>
                  <Badge className={`text-[10px] ${statusBadge[asset.status] || statusBadge.draft}`}>
                    {asset.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  {isEditing ? (
                    <>
                      <Button size="sm" variant="outline" onClick={cancelEdit} className="gap-1.5 text-xs">
                        <X className="w-3 h-3" /> Cancel
                      </Button>
                      <Button size="sm" onClick={saveEdit} disabled={saving} className="gap-1.5 text-xs">
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => startEdit(type)} className="gap-1.5 text-xs">
                        <Edit3 className="w-3 h-3" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(asset.id, 'internal_review')} className="gap-1.5 text-xs">
                        <Clock className="w-3 h-3" /> Review
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(asset.id, 'approved')} className="gap-1.5 text-xs text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" /> Approve
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                v{asset.version} · {new Date(asset.created_at).toLocaleString()}
              </p>
            </CardHeader>
            {!isCollapsed && (
              <CardContent>
                <Renderer
                  content={isEditing ? editedContent : asset.content}
                  editMode={isEditing}
                  onEdit={(c: any) => setEditedContent(c)}
                />
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
