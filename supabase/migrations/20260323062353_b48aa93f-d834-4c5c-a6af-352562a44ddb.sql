ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS speaker_name text,
  ADD COLUMN IF NOT EXISTS industry_focus text,
  ADD COLUMN IF NOT EXISTS targeted_returns text,
  ADD COLUMN IF NOT EXISTS hold_period text,
  ADD COLUMN IF NOT EXISTS distribution_schedule text,
  ADD COLUMN IF NOT EXISTS investment_range text,
  ADD COLUMN IF NOT EXISTS tax_advantages text,
  ADD COLUMN IF NOT EXISTS fund_history text,
  ADD COLUMN IF NOT EXISTS credibility text;