import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { EnrichedLead, QualificationTier, RoutingDestination } from '@/components/admin/mockLeads';

function deriveStatus(tags: string[]): EnrichedLead['status'] {
  const t = tags.map(s => s.toLowerCase());
  if (t.includes('appt booked') || t.includes('booked call') || t.includes('capital raising booked')) return 'booked';
  if (t.includes('qualified-investor')) return 'qualified';
  if (t.includes('non-accredited') || t.includes('not interested')) return 'non-accredited';
  if (t.includes('cancelled') || t.includes('appt cancelled')) return 'abandoned';
  return 'new';
}

function deriveTier(tags: string[]): { tier: QualificationTier; score: number; routing: RoutingDestination } {
  const t = tags.map(s => s.toLowerCase());
  if (t.includes('qualified-investor') || t.includes('showed')) {
    return { tier: 'qualified', score: 80, routing: 'closer' };
  }
  if (t.includes('appt booked') || t.includes('booked call') || t.includes('capital raising booked')) {
    return { tier: 'borderline', score: 55, routing: 'setter' };
  }
  if (t.includes('fb leads') || t.includes('ai capital raising - lead')) {
    return { tier: 'borderline', score: 45, routing: 'setter' };
  }
  return { tier: 'unqualified', score: 15, routing: 'downsell' };
}

export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async (): Promise<EnrichedLead[]> => {
      const { data, error } = await supabase.functions.invoke('ghl-sync', {
        body: { action: 'get-contacts', days: 30, limit: 100 },
      });

      if (error) {
        console.error('Failed to fetch GHL contacts:', error);
        return [];
      }

      const contacts = data?.data?.contacts || [];

      return contacts
        .filter((c: any) => c.name || c.email || c.phone)
        .map((c: any): EnrichedLead => {
          const tags: string[] = c.tags || [];
          const status = deriveStatus(tags);
          const { tier, score, routing } = deriveTier(tags);
          const hasAppointment = tags.some(t =>
            ['appt booked', 'booked call', 'capital raising booked'].includes(t.toLowerCase())
          );
          const showed = tags.some(t => t.toLowerCase() === 'showed');

          return {
            id: c.id,
            leadName: c.name || 'Unknown',
            leadEmail: c.email || '',
            leadPhone: c.phone || '',
            source: c.source || 'Direct',
            createdAt: c.dateAdded ? new Date(c.dateAdded).toLocaleDateString() : '',
            status,
            accredited: tier === 'qualified',
            investmentRange: 'Pending',
            appointmentDate: hasAppointment ? c.dateAdded : null,
            qualificationTier: tier,
            qualificationScore: score,
            routingDestination: routing,
            showedUp: hasAppointment ? showed : null,
            enrichmentStatus: 'pending',
            enrichmentMethod: null,
            identity: null,
            address: null,
            financial: null,
            investments: null,
            home: null,
            household: null,
            education: null,
            interests: [],
            vehicles: [],
            companies: [],
            phones: [],
            emails: [],
            donations: [],
            reading: [],
          };
        });
    },
    refetchInterval: 30000,
  });
}
