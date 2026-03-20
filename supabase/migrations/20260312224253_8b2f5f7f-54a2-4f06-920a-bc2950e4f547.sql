
-- Create enums for lead qualification
CREATE TYPE public.qualification_tier AS ENUM ('qualified', 'borderline', 'unqualified');
CREATE TYPE public.routing_destination AS ENUM ('closer', 'setter', 'downsell');
CREATE TYPE public.lead_status AS ENUM ('new', 'booked', 'qualified', 'non-accredited', 'abandoned');
CREATE TYPE public.enrichment_status AS ENUM ('verified', 'spouse', 'no-match', 'pending');

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_name TEXT NOT NULL,
  lead_email TEXT,
  lead_phone TEXT,
  source TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  accredited BOOLEAN DEFAULT false,
  investment_range TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE,

  -- Qualification & Routing
  qualification_tier qualification_tier DEFAULT 'unqualified',
  qualification_score INTEGER DEFAULT 0,
  routing_destination routing_destination DEFAULT 'downsell',

  -- Show-up tracking
  showed_up BOOLEAN,

  -- Enrichment
  enrichment_status enrichment_status DEFAULT 'pending',
  enrichment_method TEXT,

  -- Enrichment data (JSONB for flexible schema)
  identity JSONB,
  address JSONB,
  financial JSONB,
  investments JSONB,
  home JSONB,
  household JSONB,
  education JSONB,
  interests TEXT[] DEFAULT '{}',
  vehicles JSONB DEFAULT '[]',
  companies JSONB DEFAULT '[]',
  phones JSONB DEFAULT '[]',
  emails JSONB DEFAULT '[]',
  donations TEXT[] DEFAULT '{}',
  reading TEXT[] DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Public read policy (admin dashboard is not behind auth yet)
CREATE POLICY "Allow public read access to leads" ON public.leads FOR SELECT USING (true);

-- Public insert for webhook intake
CREATE POLICY "Allow public insert to leads" ON public.leads FOR INSERT WITH CHECK (true);

-- Public update for enrichment
CREATE POLICY "Allow public update to leads" ON public.leads FOR UPDATE USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for common queries
CREATE INDEX idx_leads_status ON public.leads (status);
CREATE INDEX idx_leads_qualification_tier ON public.leads (qualification_tier);
CREATE INDEX idx_leads_enrichment_status ON public.leads (enrichment_status);
CREATE INDEX idx_leads_created_at ON public.leads (created_at DESC);
