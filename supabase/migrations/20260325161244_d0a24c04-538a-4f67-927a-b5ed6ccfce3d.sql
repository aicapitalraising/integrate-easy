
CREATE TABLE public.calendar_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route text NOT NULL UNIQUE,
  label text NOT NULL,
  calendar_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.calendar_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of calendar_mappings"
  ON public.calendar_mappings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public upsert of calendar_mappings"
  ON public.calendar_mappings FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO public.calendar_mappings (route, label, calendar_id) VALUES
  ('/book', 'Booking Page', '35XuJAAvPdr0w5Tf9sPf'),
  ('/onboarding', 'Onboarding Kickoff', '35XuJAAvPdr0w5Tf9sPf')
ON CONFLICT (route) DO NOTHING;
