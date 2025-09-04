-- Create media_resources table
CREATE TABLE public.media_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('video', 'website', 'document', 'image')),
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.media_resources ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view media resources" 
ON public.media_resources 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create media resources" 
ON public.media_resources 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update media resources" 
ON public.media_resources 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete media resources" 
ON public.media_resources 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_media_resources_updated_at
BEFORE UPDATE ON public.media_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();