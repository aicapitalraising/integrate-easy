-- Creative schedules for automated ad generation
CREATE TABLE public.creative_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  schedule_type TEXT NOT NULL DEFAULT 'static', -- 'static' or 'video'
  frequency TEXT NOT NULL DEFAULT 'weekly', -- 'daily', 'weekly', 'biweekly', 'monthly'
  day_of_week INTEGER DEFAULT 1, -- 0=Sun, 1=Mon, etc. (for weekly/biweekly)
  variations_per_run INTEGER NOT NULL DEFAULT 3,
  enabled BOOLEAN NOT NULL DEFAULT false,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  base_asset_id UUID REFERENCES public.client_assets(id) ON DELETE SET NULL,
  style_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.creative_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read creative schedules" ON public.creative_schedules FOR SELECT USING (true);
CREATE POLICY "Anyone can insert creative schedules" ON public.creative_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update creative schedules" ON public.creative_schedules FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete creative schedules" ON public.creative_schedules FOR DELETE USING (true);

CREATE TRIGGER update_creative_schedules_updated_at
  BEFORE UPDATE ON public.creative_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Avatar configurations for video ad generation
CREATE TABLE public.avatar_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'heygen', -- 'heygen', 'synthesia', 'custom'
  avatar_id TEXT, -- provider-specific avatar ID
  voice_id TEXT, -- provider-specific voice ID
  style TEXT DEFAULT 'professional', -- 'professional', 'casual', 'energetic'
  background TEXT DEFAULT 'office', -- 'office', 'studio', 'transparent', 'custom'
  custom_background_url TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.avatar_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read avatar configs" ON public.avatar_configs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert avatar configs" ON public.avatar_configs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update avatar configs" ON public.avatar_configs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete avatar configs" ON public.avatar_configs FOR DELETE USING (true);

CREATE TRIGGER update_avatar_configs_updated_at
  BEFORE UPDATE ON public.avatar_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Creative generation history for tracking variations
CREATE TABLE public.creative_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.client_assets(id) ON DELETE SET NULL,
  schedule_id UUID REFERENCES public.creative_schedules(id) ON DELETE SET NULL,
  generation_type TEXT NOT NULL, -- 'manual', 'scheduled', 'variation'
  creative_type TEXT NOT NULL, -- 'static', 'video'
  parent_generation_id UUID REFERENCES public.creative_generations(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'generating', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.creative_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read creative generations" ON public.creative_generations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert creative generations" ON public.creative_generations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update creative generations" ON public.creative_generations FOR UPDATE USING (true);
