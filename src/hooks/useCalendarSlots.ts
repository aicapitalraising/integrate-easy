import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface UseCalendarSlotsOptions {
  route: string;
  selectedDate?: Date;
  timezone?: string;
}

export function useCalendarSlots({ route, selectedDate, timezone = 'America/New_York' }: UseCalendarSlotsOptions) {
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingCalendarId, setLoadingCalendarId] = useState(true);

  // Fetch calendar ID from DB mapping for this route
  useEffect(() => {
    const fetchMapping = async () => {
      setLoadingCalendarId(true);
      const { data, error } = await supabase
        .from('calendar_mappings')
        .select('calendar_id')
        .eq('route', route)
        .maybeSingle();

      if (!error && data) {
        setCalendarId(data.calendar_id);
      } else {
        // Fallback default
        setCalendarId('35XuJAAvPdr0w5Tf9sPf');
      }
      setLoadingCalendarId(false);
    };
    fetchMapping();
  }, [route]);

  const fetchSlots = useCallback(async (date: Date) => {
    if (!calendarId) return;
    setLoadingSlots(true);
    setSlots([]);

    try {
      const startDate = format(date, 'yyyy-MM-dd');
      const endDate = startDate;

      const { data, error } = await supabase.functions.invoke('ghl-calendars', {
        body: { action: 'free-slots', calendarId, startDate, endDate, timezone },
      });

      if (error) throw error;
      const parsed = parseGHLSlots(data);
      setSlots(parsed);
    } catch (err) {
      console.error('Failed to fetch free slots:', err);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [calendarId, timezone]);

  useEffect(() => {
    if (selectedDate && calendarId) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, calendarId, fetchSlots]);

  return { calendarId, slots, loadingSlots, loadingCalendarId };
}

function parseGHLSlots(data: any): string[] {
  try {
    const dateKeys = Object.keys(data).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k));
    if (dateKeys.length > 0) {
      const dayData = data[dateKeys[0]];
      const rawSlots: string[] = Array.isArray(dayData?.slots)
        ? dayData.slots.map((s: any) => typeof s === 'string' ? s : s.slot || s)
        : Array.isArray(dayData) ? dayData : [];
      return rawSlots.map(formatSlotTime).filter(Boolean) as string[];
    }
    if (data.slots) {
      const slotsObj = data.slots;
      if (typeof slotsObj === 'object') {
        const firstKey = Object.keys(slotsObj)[0];
        if (firstKey) {
          const arr = slotsObj[firstKey];
          if (Array.isArray(arr)) return arr.map(formatSlotTime).filter(Boolean) as string[];
        }
      }
    }
    return [];
  } catch { return []; }
}

function formatSlotTime(isoOrTime: string): string | null {
  try {
    const d = new Date(isoOrTime);
    if (isNaN(d.getTime())) return null;
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  } catch { return null; }
}
