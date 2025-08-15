-- Allow public reading of news articles
CREATE POLICY "Anyone can view published news" 
ON public.news 
FOR SELECT 
USING (true);