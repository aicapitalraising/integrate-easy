import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Play, Pause, Calendar, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  brand_colors?: any;
  primary_offer?: string | null;
  secondary_offers?: any;
  reference_ad_paths?: any;
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

interface Schedule {
  id: string;
  client_id: string;
  schedule_type: string;
  frequency: string;
  day_of_week: number;
  variations_per_run: number;
  enabled: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  base_asset_id: string | null;
  style_notes: string | null;
  created_at: string;
}

interface CreativeAutomationProps {
  client: Client;
  onGenerated: () => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function computeNextRun(frequency: string, dayOfWeek: number): string {
  const now = new Date();
  const next = new Date(now);

  if (frequency === 'daily') {
    next.setDate(next.getDate() + 1);
    next.setHours(9, 0, 0, 0);
  } else if (frequency === 'weekly') {
    const currentDay = now.getDay();
    const daysUntil = (dayOfWeek - currentDay + 7) % 7 || 7;
    next.setDate(next.getDate() + daysUntil);
    next.setHours(9, 0, 0, 0);
  } else if (frequency === 'biweekly') {
    const currentDay = now.getDay();
    const daysUntil = (dayOfWeek - currentDay + 7) % 7 || 14;
    next.setDate(next.getDate() + daysUntil);
    next.setHours(9, 0, 0, 0);
  } else {
    next.setMonth(next.getMonth() + 1);
    next.setDate(1);
    next.setHours(9, 0, 0, 0);
  }

  return next.toISOString();
}

export default function CreativeAutomation({ client, onGenerated }: CreativeAutomationProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [runningNow, setRunningNow] = useState<string | null>(null);

  useEffect(() => { loadSchedules(); }, [client.id]);

  const loadSchedules = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('creative_schedules')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false });
    setSchedules((data as Schedule[]) || []);
    setLoading(false);
  };

  const createSchedule = async (type: 'static' | 'video') => {
    setCreating(true);
    const nextRun = computeNextRun('weekly', 1);
    const { error } = await supabase.from('creative_schedules').insert({
      client_id: client.id,
      schedule_type: type,
      frequency: 'weekly',
      day_of_week: 1,
      variations_per_run: 3,
      enabled: false,
      next_run_at: nextRun,
    });
    if (error) {
      toast({ title: 'Failed to create schedule', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Schedule created', description: `New ${type} ad automation schedule added.` });
      await loadSchedules();
    }
    setCreating(false);
  };

  const toggleSchedule = async (schedule: Schedule) => {
    const newEnabled = !schedule.enabled;
    const nextRun = newEnabled ? computeNextRun(schedule.frequency, schedule.day_of_week) : null;

    await supabase.from('creative_schedules').update({
      enabled: newEnabled,
      next_run_at: nextRun,
    }).eq('id', schedule.id);
    toast({ title: newEnabled ? 'Schedule activated' : 'Schedule paused' });
    await loadSchedules();
  };

  const updateSchedule = async (id: string, updates: Partial<Schedule>) => {
    await supabase.from('creative_schedules').update(updates).eq('id', id);
    await loadSchedules();
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm('Delete this automation schedule?')) return;
    await supabase.from('creative_schedules').delete().eq('id', id);
    toast({ title: 'Schedule deleted' });
    await loadSchedules();
  };

  const runNow = async (schedule: Schedule) => {
    setRunningNow(schedule.id);
    try {
      // Fetch existing context
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

      // Log generation
      await supabase.from('creative_generations').insert({
        client_id: client.id,
        schedule_id: schedule.id,
        generation_type: 'scheduled',
        creative_type: schedule.schedule_type,
        status: 'generating',
      });

      // Generate variations
      const { error } = await supabase.functions.invoke('generate-asset', {
        body: {
          client_id: client.id,
          asset_type: schedule.schedule_type === 'static' ? 'static_ads' : 'video_ads',
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
            brand_colors: client.brand_colors,
            primary_offer: client.primary_offer,
            secondary_offers: client.secondary_offers,
            reference_ad_paths: client.reference_ad_paths,
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
          variation_mode: true,
          style_notes: schedule.style_notes,
          variations_count: schedule.variations_per_run,
        },
      });

      if (error) throw error;

      // Update last run time and compute next
      const nextRun = schedule.enabled ? computeNextRun(schedule.frequency, schedule.day_of_week) : null;
      await supabase.from('creative_schedules').update({
        last_run_at: new Date().toISOString(),
        next_run_at: nextRun,
      }).eq('id', schedule.id);

      toast({ title: 'Variations generated!', description: `New ${schedule.schedule_type} ad variations created.` });
      onGenerated();
      await loadSchedules();
    } catch (e: any) {
      toast({ title: 'Generation failed', description: e.message, variant: 'destructive' });
    }
    setRunningNow(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading automation...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Creative Automation</h3>
          <p className="text-xs text-muted-foreground">
            Set schedules to automatically generate new ad variations for creative diversity and testing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => createSchedule('static')} disabled={creating} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Static Schedule
          </Button>
          <Button size="sm" variant="outline" onClick={() => createSchedule('video')} disabled={creating} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Video Schedule
          </Button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground mb-1">No Automation Schedules</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Create a schedule to automatically generate new ad variations. This keeps your creative fresh and
              enables A/B testing across multiple concepts.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => createSchedule('static')} disabled={creating} className="gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> New Static Schedule
              </Button>
              <Button size="sm" variant="outline" onClick={() => createSchedule('video')} disabled={creating} className="gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> New Video Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className={`border-border ${schedule.enabled ? 'border-primary/20 bg-primary/5' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{schedule.schedule_type}</Badge>
                      <Badge className={`text-[10px] ${schedule.enabled ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' : 'bg-muted text-muted-foreground'}`}>
                        {schedule.enabled ? 'Active' : 'Paused'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground block mb-1">Frequency</label>
                        <select
                          value={schedule.frequency}
                          onChange={(e) => {
                            const nextRun = schedule.enabled ? computeNextRun(e.target.value, schedule.day_of_week) : null;
                            updateSchedule(schedule.id, { frequency: e.target.value, next_run_at: nextRun } as any);
                          }}
                          className="w-full text-xs border rounded px-2 py-1.5 bg-background"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>

                      {schedule.frequency !== 'daily' && schedule.frequency !== 'monthly' && (
                        <div>
                          <label className="text-[10px] font-medium text-muted-foreground block mb-1">Day</label>
                          <select
                            value={schedule.day_of_week}
                            onChange={(e) => {
                              const day = parseInt(e.target.value);
                              const nextRun = schedule.enabled ? computeNextRun(schedule.frequency, day) : null;
                              updateSchedule(schedule.id, { day_of_week: day, next_run_at: nextRun } as any);
                            }}
                            className="w-full text-xs border rounded px-2 py-1.5 bg-background"
                          >
                            {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground block mb-1">Variations per run</label>
                        <select
                          value={schedule.variations_per_run}
                          onChange={(e) => updateSchedule(schedule.id, { variations_per_run: parseInt(e.target.value) } as any)}
                          className="w-full text-xs border rounded px-2 py-1.5 bg-background"
                        >
                          {[1, 2, 3, 5, 8, 10].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="mt-2">
                      <label className="text-[10px] font-medium text-muted-foreground block mb-1">Style notes (optional)</label>
                      <textarea
                        value={schedule.style_notes || ''}
                        onChange={(e) => updateSchedule(schedule.id, { style_notes: e.target.value } as any)}
                        placeholder="E.g., 'Focus on tax advantage angles' or 'Use more urgency-driven hooks'"
                        rows={2}
                        className="w-full text-xs border rounded px-2 py-1.5 bg-background resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-2">
                      {schedule.last_run_at && (
                        <span>Last run: {new Date(schedule.last_run_at).toLocaleString()}</span>
                      )}
                      {schedule.next_run_at && schedule.enabled && (
                        <span>Next run: {new Date(schedule.next_run_at).toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 ml-4">
                    <Button
                      size="sm"
                      variant={schedule.enabled ? 'outline' : 'default'}
                      onClick={() => toggleSchedule(schedule)}
                      className="gap-1.5 text-xs"
                    >
                      {schedule.enabled ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      {schedule.enabled ? 'Pause' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runNow(schedule)}
                      disabled={runningNow === schedule.id}
                      className="gap-1.5 text-xs"
                    >
                      {runningNow === schedule.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      Run Now
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSchedule(schedule.id)}
                      className="gap-1.5 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
