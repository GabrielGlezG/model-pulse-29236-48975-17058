-- Actualizar el constraint check para incluir 'processing'
ALTER TABLE public.scraping_jobs 
DROP CONSTRAINT scraping_jobs_status_check;

ALTER TABLE public.scraping_jobs 
ADD CONSTRAINT scraping_jobs_status_check 
CHECK (status IN ('pending', 'processing', 'running', 'completed', 'error', 'failed'));