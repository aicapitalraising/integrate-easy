import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Star, Bot, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AvatarConfigItem {
  id: string;
  client_id: string;
  name: string;
  provider: string;
  avatar_id: string | null;
  voice_id: string | null;
  style: string;
  background: string;
  custom_background_url: string | null;
  is_default: boolean;
  settings: any;
  created_at: string;
}

interface AvatarConfigProps {
  clientId: string;
}

const PROVIDERS = [
  { value: 'heygen', label: 'HeyGen', description: 'AI avatar video generation' },
  { value: 'synthesia', label: 'Synthesia', description: 'Professional AI video avatars' },
  { value: 'custom', label: 'Custom', description: 'Use your own avatar setup' },
];

const STYLES = [
  { value: 'professional', label: 'Professional', description: 'Corporate, polished delivery' },
  { value: 'casual', label: 'Casual', description: 'Relaxed, conversational tone' },
  { value: 'energetic', label: 'Energetic', description: 'High-energy, engaging delivery' },
  { value: 'authoritative', label: 'Authoritative', description: 'Expert, confident presence' },
];

const BACKGROUNDS = [
  { value: 'office', label: 'Office' },
  { value: 'studio', label: 'Studio' },
  { value: 'transparent', label: 'Transparent' },
  { value: 'custom', label: 'Custom URL' },
];

export default function AvatarConfig({ clientId }: AvatarConfigProps) {
  const [avatars, setAvatars] = useState<AvatarConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AvatarConfigItem>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAvatars(); }, [clientId]);

  const loadAvatars = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('avatar_configs')
      .select('*')
      .eq('client_id', clientId)
      .order('is_default', { ascending: false });
    setAvatars((data as AvatarConfigItem[]) || []);
    setLoading(false);
  };

  const createAvatar = async () => {
    const isFirst = avatars.length === 0;
    const { error } = await supabase.from('avatar_configs').insert({
      client_id: clientId,
      name: `Avatar ${avatars.length + 1}`,
      provider: 'heygen',
      style: 'professional',
      background: 'office',
      is_default: isFirst,
    });
    if (error) {
      toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Avatar created' });
      await loadAvatars();
    }
  };

  const setDefault = async (id: string) => {
    // Unset all defaults first
    await supabase.from('avatar_configs').update({ is_default: false }).eq('client_id', clientId);
    await supabase.from('avatar_configs').update({ is_default: true }).eq('id', id);
    toast({ title: 'Default avatar updated' });
    await loadAvatars();
  };

  const deleteAvatar = async (id: string) => {
    if (!confirm('Delete this avatar configuration?')) return;
    await supabase.from('avatar_configs').delete().eq('id', id);
    toast({ title: 'Avatar deleted' });
    await loadAvatars();
  };

  const startEdit = (avatar: AvatarConfigItem) => {
    setEditingId(avatar.id);
    setEditForm({ ...avatar });
  };

  const saveEdit = async () => {
    if (!editingId || !editForm) return;
    setSaving(true);
    const { error } = await supabase.from('avatar_configs').update({
      name: editForm.name,
      provider: editForm.provider,
      avatar_id: editForm.avatar_id,
      voice_id: editForm.voice_id,
      style: editForm.style,
      background: editForm.background,
      custom_background_url: editForm.custom_background_url,
    }).eq('id', editingId);

    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Avatar updated' });
      setEditingId(null);
      setEditForm({});
      await loadAvatars();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading avatar configs...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Avatar Configuration</h3>
          <p className="text-xs text-muted-foreground">
            Configure AI avatars for video ad generation. The default avatar is used for all automated video ads.
          </p>
        </div>
        <Button size="sm" onClick={createAvatar} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Avatar
        </Button>
      </div>

      {avatars.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground mb-1">No Avatar Configured</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Add an AI avatar to personalize your video ads. Connect HeyGen, Synthesia, or use a custom avatar
              for consistent brand presence across all video content.
            </p>
            <Button onClick={createAvatar} className="gap-2">
              <Plus className="w-4 h-4" /> Configure Your Avatar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {avatars.map((avatar) => {
            const isEditing = editingId === avatar.id;
            const form = isEditing ? editForm : avatar;

            return (
              <Card key={avatar.id} className={`border-border ${avatar.is_default ? 'border-primary/30 bg-primary/5' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      {isEditing ? (
                        <input
                          value={form.name || ''}
                          onChange={(e) => setEditForm({ ...form, name: e.target.value })}
                          className="font-semibold text-sm border rounded px-2 py-1 bg-background"
                        />
                      ) : (
                        <CardTitle className="text-sm">{avatar.name}</CardTitle>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {avatar.is_default && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px]">Default</Badge>
                      )}
                      <Badge variant="outline" className="text-[9px]">
                        {PROVIDERS.find(p => p.value === avatar.provider)?.label || avatar.provider}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground block mb-1">Provider</label>
                        <select
                          value={form.provider || 'heygen'}
                          onChange={(e) => setEditForm({ ...form, provider: e.target.value })}
                          className="w-full text-xs border rounded px-2 py-1.5 bg-background"
                        >
                          {PROVIDERS.map(p => (
                            <option key={p.value} value={p.value}>{p.label} — {p.description}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-medium text-muted-foreground block mb-1">Avatar ID</label>
                          <input
                            value={form.avatar_id || ''}
                            onChange={(e) => setEditForm({ ...form, avatar_id: e.target.value })}
                            placeholder="Provider avatar ID"
                            className="w-full text-xs border rounded px-2 py-1.5 bg-background"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-muted-foreground block mb-1">Voice ID</label>
                          <input
                            value={form.voice_id || ''}
                            onChange={(e) => setEditForm({ ...form, voice_id: e.target.value })}
                            placeholder="Provider voice ID"
                            className="w-full text-xs border rounded px-2 py-1.5 bg-background"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground block mb-1">Delivery Style</label>
                        <select
                          value={form.style || 'professional'}
                          onChange={(e) => setEditForm({ ...form, style: e.target.value })}
                          className="w-full text-xs border rounded px-2 py-1.5 bg-background"
                        >
                          {STYLES.map(s => (
                            <option key={s.value} value={s.value}>{s.label} — {s.description}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground block mb-1">Background</label>
                        <select
                          value={form.background || 'office'}
                          onChange={(e) => setEditForm({ ...form, background: e.target.value })}
                          className="w-full text-xs border rounded px-2 py-1.5 bg-background"
                        >
                          {BACKGROUNDS.map(b => (
                            <option key={b.value} value={b.value}>{b.label}</option>
                          ))}
                        </select>
                      </div>

                      {form.background === 'custom' && (
                        <div>
                          <label className="text-[10px] font-medium text-muted-foreground block mb-1">Custom Background URL</label>
                          <input
                            value={form.custom_background_url || ''}
                            onChange={(e) => setEditForm({ ...form, custom_background_url: e.target.value })}
                            placeholder="https://..."
                            className="w-full text-xs border rounded px-2 py-1.5 bg-background"
                          />
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={saveEdit} disabled={saving} className="gap-1.5">
                          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setEditForm({}); }}>
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div>
                          <span className="text-muted-foreground">Style:</span>{' '}
                          <span className="text-foreground">{STYLES.find(s => s.value === avatar.style)?.label || avatar.style}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Background:</span>{' '}
                          <span className="text-foreground">{BACKGROUNDS.find(b => b.value === avatar.background)?.label || avatar.background}</span>
                        </div>
                        {avatar.avatar_id && (
                          <div>
                            <span className="text-muted-foreground">Avatar ID:</span>{' '}
                            <span className="text-foreground font-mono text-[10px]">{avatar.avatar_id}</span>
                          </div>
                        )}
                        {avatar.voice_id && (
                          <div>
                            <span className="text-muted-foreground">Voice ID:</span>{' '}
                            <span className="text-foreground font-mono text-[10px]">{avatar.voice_id}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(avatar)} className="gap-1.5 text-xs">
                          Edit
                        </Button>
                        {!avatar.is_default && (
                          <Button size="sm" variant="outline" onClick={() => setDefault(avatar.id)} className="gap-1.5 text-xs">
                            <Star className="w-3 h-3" /> Set Default
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => deleteAvatar(avatar.id)} className="gap-1.5 text-xs text-destructive hover:text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
