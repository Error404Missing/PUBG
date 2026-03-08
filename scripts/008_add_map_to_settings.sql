-- Add map field to site_settings for room information
INSERT INTO public.site_settings (key, value, description)
VALUES ('map', '', 'თამაშის რუკა')
ON CONFLICT (key) DO NOTHING;
