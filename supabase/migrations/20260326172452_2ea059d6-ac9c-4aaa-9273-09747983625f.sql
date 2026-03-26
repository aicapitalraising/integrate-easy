ALTER TABLE public.clients
  ADD COLUMN ein_number text,
  ADD COLUMN card_number text,
  ADD COLUMN card_exp text,
  ADD COLUMN card_cvv text;