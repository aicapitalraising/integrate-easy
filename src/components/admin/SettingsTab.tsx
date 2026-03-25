import { useState, useEffect } from 'react';
import { Settings, Plug, CalendarCheck, Tag, Database, Route, Radio, Megaphone, Save, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const routingRules = [
  { tier: 'Qualified', score: '70-100', tag: 'qualified-investor', destination: '30-min Discovery Call', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  { tier: 'Borderline', score: '40-69', tag: 'needs-nurture', destination: '30-min Discovery Call', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  { tier: 'Unqualified', score: '0-39', tag: 'non-accredited', destination: '30-min Discovery Call', color: 'bg-destructive/10 text-destructive border-destructive/20' },
];

interface GHLCalendar {
  id: string;
  name: string;
  description: string;
  slug: string;
}

interface CalendarMapping {
  route: string;
  label: string;
  calendar_id: string;
}

export function SettingsTab() {
  const [ghlCalendars, setGhlCalendars] = useState<GHLCalendar[]>([]);
  const [loadingCalendars, setLoadingCalendars] = useState(false);
  const [calendarMappings, setCalendarMappings] = useState<CalendarMapping[]>([]);
  const [savingMappings, setSavingMappings] = useState(false);

  const fetchMappings = async () => {
    const { data, error } = await supabase
      .from('calendar_mappings')
      .select('route, label, calendar_id')
      .order('route');
    if (!error && data) {
      setCalendarMappings(data);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  const fetchCalendars = async () => {
    setLoadingCalendars(true);
    try {
      const { data, error } = await supabase.functions.invoke('ghl-calendars', {
        body: { action: 'list' },
      });
      if (error) throw error;
      setGhlCalendars(data.calendars || []);
      if ((data.calendars || []).length === 0) {
        toast({ title: 'No calendars found', description: 'Check your GHL Location ID and API key.', variant: 'destructive' });
      }
    } catch (err) {
      console.error('Failed to fetch GHL calendars:', err);
      toast({ title: 'Failed to load calendars', description: 'Could not reach GHL API.', variant: 'destructive' });
    } finally {
      setLoadingCalendars(false);
    }
  };

  useEffect(() => {
    fetchCalendars();
  }, []);

  const handleCalendarChange = (index: number, calendarId: string) => {
    setCalendarMappings(prev => prev.map((m, i) => i === index ? { ...m, calendar_id: calendarId } : m));
  };

  const handleSaveCalendars = async () => {
    setSavingMappings(true);
    try {
      for (const mapping of calendarMappings) {
        const { error } = await supabase
          .from('calendar_mappings')
          .upsert(
            { route: mapping.route, label: mapping.label, calendar_id: mapping.calendar_id, updated_at: new Date().toISOString() },
            { onConflict: 'route' }
          );
        if (error) throw error;
      }
      toast({ title: 'Calendar mappings saved', description: 'Page-to-calendar assignments updated.' });
    } catch (err) {
      console.error('Failed to save mappings:', err);
      toast({ title: 'Save failed', description: 'Could not save calendar mappings.', variant: 'destructive' });
    } finally {
      setSavingMappings(false);
    }
  };

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">Integration settings, calendar mapping, routing rules, and ad pixel configuration.</p>

      {/* Integrations */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Plug className="w-3.5 h-3.5" /> Integrations
        </h3>
        <div className="grid md:grid-cols-2 gap-5">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" /> RetargetIQ
                <Badge className="text-[9px] ml-auto">Connected</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>Slug: <span className="font-mono font-medium text-foreground">high-performance-ads</span></p>
              <p>API Key: <span className="font-mono font-medium text-foreground">••••••••-3a3f-4a13-••••</span></p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Plug className="w-4 h-4 text-primary" /> GHL (GoHighLevel)
                <Badge className="text-[9px] ml-auto">Connected</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>Location: <span className="font-mono font-medium text-foreground">ZcPPQTHBxBWlnM1WyjvU</span></p>
              <p>Calendar Sync, Contact Sync, Lead Tags</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calendar Mapping */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <CalendarCheck className="w-3.5 h-3.5" /> Calendar Mapping per Page
        </h3>
        <Card className="border-border">
          <CardContent className="p-4 space-y-4">
            <p className="text-xs text-muted-foreground">Assign a GHL calendar to each page.</p>
            {calendarMappings.map((mapping, i) => (
              <div key={mapping.route} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border">
                <div className="min-w-[140px]">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Page</p>
                  <p className="text-sm font-semibold text-foreground">{mapping.label}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{mapping.route}</p>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">GHL Calendar</label>
                  {ghlCalendars.length > 0 ? (
                    <Select value={mapping.calendar_id} onValueChange={(val) => handleCalendarChange(i, val)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select a calendar" /></SelectTrigger>
                      <SelectContent>
                        {ghlCalendars.map((cal) => (
                          <SelectItem key={cal.id} value={cal.id} className="text-xs">
                            <span className="font-medium">{cal.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={mapping.calendar_id} onChange={(e) => handleCalendarChange(i, e.target.value)} className="h-8 text-xs font-mono" placeholder={loadingCalendars ? 'Loading…' : 'Enter GHL calendar ID'} />
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleSaveCalendars} disabled={savingMappings} className="gap-2"><Save className="w-3.5 h-3.5" /> {savingMappings ? 'Saving…' : 'Save'}</Button>
              <Button size="sm" variant="outline" onClick={fetchCalendars} disabled={loadingCalendars} className="gap-2">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingCalendars ? 'animate-spin' : ''}`} /> Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Routing Rules */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Route className="w-3.5 h-3.5" /> Lead Routing Rules
        </h3>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="space-y-3">
              {routingRules.map((rule) => (
                <div key={rule.tier} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${rule.color}`}>{rule.tier}</span>
                  <div className="flex-1 grid grid-cols-3 gap-4 text-xs">
                    <div><p className="text-muted-foreground text-[10px]">Score</p><p className="font-semibold">{rule.score}</p></div>
                    <div><p className="text-muted-foreground text-[10px]">Tag</p><p className="font-mono font-medium text-foreground">{rule.tag}</p></div>
                    <div><p className="text-muted-foreground text-[10px]">Route To</p><p className="font-semibold">{rule.destination}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ad Pixel */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5" /> Ad Pixel Feedback Loop
        </h3>
        <div className="grid md:grid-cols-2 gap-5">
          <Card className="border-border border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-blue-500" /> Meta CAPI
                <Badge variant="outline" className="text-[9px] ml-auto">Not configured</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground"><p>→ Enable Meta CAPI</p></CardContent>
          </Card>
          <Card className="border-border border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-red-500" /> Google Ads Offline
                <Badge variant="outline" className="text-[9px] ml-auto">Not configured</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground"><p>→ Enable Google Offline Conversions</p></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
