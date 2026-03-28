-- Add brand colors, offers, and reference ad fields to clients
ALTER TABLE public.clients ADD COLUMN brand_colors JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.clients ADD COLUMN primary_offer TEXT;
ALTER TABLE public.clients ADD COLUMN secondary_offers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.clients ADD COLUMN reference_ad_paths JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.clients ADD COLUMN logo_path TEXT;
