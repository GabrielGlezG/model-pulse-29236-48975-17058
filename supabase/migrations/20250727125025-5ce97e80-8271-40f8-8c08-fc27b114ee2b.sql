-- Cambiar el tipo de datos de price para manejar números más grandes
ALTER TABLE public.price_data 
ALTER COLUMN price TYPE bigint USING price::bigint;