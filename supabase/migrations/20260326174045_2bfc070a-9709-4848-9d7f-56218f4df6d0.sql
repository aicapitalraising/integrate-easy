CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  title text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert team members" ON public.team_members FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read team members" ON public.team_members FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can update team members" ON public.team_members FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete team members" ON public.team_members FOR DELETE TO public USING (true);