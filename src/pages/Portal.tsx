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
} from 'lucide-react';

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

function PortalPlaceholder({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="font-display text-base font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">Assets will appear here once generated.</p>
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
            Welcome, {client.contact_name}. Review and approve your campaign assets below.
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
            <TabsTrigger value="emails" className="text-xs">Emails</TabsTrigger>
            <TabsTrigger value="sms" className="text-xs">SMS</TabsTrigger>
            <TabsTrigger value="adcopy" className="text-xs">Ad Copy</TabsTrigger>
            <TabsTrigger value="scripts" className="text-xs">Scripts</TabsTrigger>
            <TabsTrigger value="creatives" className="text-xs">Creatives</TabsTrigger>
            <TabsTrigger value="report" className="text-xs">Report</TabsTrigger>
          </TabsList>

          <TabsContent value="emails"><PortalPlaceholder icon={Mail} title="Email Sequences" /></TabsContent>
          <TabsContent value="sms"><PortalPlaceholder icon={MessageSquare} title="SMS Sequences" /></TabsContent>
          <TabsContent value="adcopy"><PortalPlaceholder icon={Megaphone} title="Ad Copy" /></TabsContent>
          <TabsContent value="scripts"><PortalPlaceholder icon={Video} title="Video Scripts" /></TabsContent>
          <TabsContent value="creatives"><PortalPlaceholder icon={Image} title="Creative Concepts" /></TabsContent>
          <TabsContent value="report"><PortalPlaceholder icon={FileText} title="Special Report" /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
