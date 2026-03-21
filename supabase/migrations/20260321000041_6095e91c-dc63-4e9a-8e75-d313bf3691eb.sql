-- Create clients table to store onboarding submissions
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex') UNIQUE,
  company_name TEXT NOT NULL,
  fund_name TEXT,
  website TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  fund_type TEXT,
  raise_amount TEXT,
  timeline TEXT,
  min_investment TEXT,
  target_investor TEXT,
  pitch_deck_link TEXT,
  pitch_deck_path TEXT,
  budget_mode TEXT DEFAULT 'monthly',
  budget_amount TEXT,
  investor_list_path TEXT,
  brand_notes TEXT,
  additional_notes TEXT,
  kickoff_date TEXT,
  kickoff_time TEXT,
  status TEXT NOT NULL DEFAULT 'onboarding',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a client via onboarding" ON public.clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read clients" ON public.clients
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update clients" ON public.clients
  FOR UPDATE USING (true);

-- Client assets table
CREATE TABLE public.client_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  title TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  angle_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.client_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read client assets" ON public.client_assets FOR SELECT USING (true);
CREATE POLICY "Anyone can insert client assets" ON public.client_assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update client assets" ON public.client_assets FOR UPDATE USING (true);

-- Asset comments
CREATE TABLE public.asset_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.client_assets(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role TEXT DEFAULT 'team',
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.asset_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments" ON public.asset_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON public.asset_comments FOR INSERT WITH CHECK (true);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_assets_updated_at
  BEFORE UPDATE ON public.client_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for client uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('client-uploads', 'client-uploads', true);

CREATE POLICY "Anyone can upload client files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'client-uploads');

CREATE POLICY "Anyone can read client files" ON storage.objects
  FOR SELECT USING (bucket_id = 'client-uploads');