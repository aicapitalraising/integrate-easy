import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { EnrichedLead, QualificationTier, RoutingDestination } from '@/components/admin/mockLeads';

// Leads table doesn't exist in current Cloud project.
// Return mock data for now until leads table is recreated.
export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async (): Promise<EnrichedLead[]> => {
      // TODO: Re-create leads table in Cloud and query it
      return [];
    },
    refetchInterval: 30000,
  });
}
