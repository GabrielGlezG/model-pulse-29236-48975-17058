-- Agregar clave foránea para price_data -> products
ALTER TABLE public.price_data 
ADD CONSTRAINT price_data_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_price_data_product_id ON public.price_data(product_id);
CREATE INDEX IF NOT EXISTS idx_price_data_date ON public.price_data(date DESC);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- Actualizar políticas RLS para permitir lectura sin autenticación en products
DROP POLICY IF EXISTS "Authenticated users can read products" ON public.products;
CREATE POLICY "Anyone can read products" 
ON public.products FOR SELECT 
USING (true);

-- Actualizar políticas RLS para permitir lectura sin autenticación en price_data
DROP POLICY IF EXISTS "Authenticated users can read price data" ON public.price_data;
CREATE POLICY "Anyone can read price data" 
ON public.price_data FOR SELECT 
USING (true);