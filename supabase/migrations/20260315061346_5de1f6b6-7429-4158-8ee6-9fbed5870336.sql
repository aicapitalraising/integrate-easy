CREATE TABLE public.calendar_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route text NOT NULL UNIQUE,
  label text NOT NULL,
  calendar_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.calendar_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to calendar_mappings" ON public.calendar_mappings FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert to calendar_mappings" ON public.calendar_mappings FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update to calendar_mappings" ON public.calendar_mappings FOR UPDATE TO public USING (true);

INSERT INTO public.calendar_mappings (route, label, calendar_id) VALUES
  ('/book', 'Booking Page', '35XuJAAvPdr0w5Tf9sPf'),
  ('/onboarding', 'Onboarding Kickoff', '35XuJAAvPdr0w5Tf9sPf'),
  ('/invest', 'Investor Page', '35XuJAAvPdr0w5Tf9sPf');

CREATE TRIGGER update_calendar_mappings_updated_at
  BEFORE UPDATE ON public.calendar_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();