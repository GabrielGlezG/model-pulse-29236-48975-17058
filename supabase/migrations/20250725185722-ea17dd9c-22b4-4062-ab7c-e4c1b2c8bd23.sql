-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix insights function security
CREATE OR REPLACE FUNCTION public.generate_automatic_insights()
RETURNS TABLE (
  insight_type text,
  title text,
  description text,
  data jsonb,
  priority integer
) AS $$
BEGIN
  -- Insight 1: Price changes by brand this quarter
  RETURN QUERY
  WITH quarterly_changes AS (
    SELECT 
      p.brand,
      AVG(CASE WHEN pd.date >= date_trunc('quarter', CURRENT_DATE) THEN pd.price END) as current_avg,
      AVG(CASE WHEN pd.date >= date_trunc('quarter', CURRENT_DATE) - interval '3 months' 
               AND pd.date < date_trunc('quarter', CURRENT_DATE) THEN pd.price END) as previous_avg
    FROM public.products p
    JOIN public.price_data pd ON p.id = pd.product_id
    WHERE pd.date >= date_trunc('quarter', CURRENT_DATE) - interval '3 months'
    GROUP BY p.brand
    HAVING COUNT(*) > 5
  )
  SELECT 
    'price_trend'::text,
    ('Cambios de precio por marca este trimestre')::text,
    (qc.brand || ' cambió ' || 
     CASE WHEN qc.current_avg > qc.previous_avg 
          THEN '+' || ROUND(((qc.current_avg - qc.previous_avg) / qc.previous_avg * 100)::numeric, 1) || '%'
          ELSE ROUND(((qc.current_avg - qc.previous_avg) / qc.previous_avg * 100)::numeric, 1) || '%'
     END || ' promedio este trimestre')::text,
    jsonb_build_object(
      'brand', qc.brand,
      'change_percent', ROUND(((qc.current_avg - qc.previous_avg) / qc.previous_avg * 100)::numeric, 2),
      'current_avg', ROUND(qc.current_avg::numeric, 0),
      'previous_avg', ROUND(qc.previous_avg::numeric, 0)
    ),
    1::integer
  FROM quarterly_changes qc
  WHERE qc.current_avg IS NOT NULL AND qc.previous_avg IS NOT NULL
  ORDER BY ABS((qc.current_avg - qc.previous_avg) / qc.previous_avg) DESC
  LIMIT 3;

  -- Insight 2: Most expensive model currently
  RETURN QUERY
  WITH latest_prices AS (
    SELECT DISTINCT ON (pd.product_id) 
      pd.product_id,
      pd.price,
      p.brand,
      p.model,
      p.name
    FROM public.price_data pd
    JOIN public.products p ON p.id = pd.product_id
    ORDER BY pd.product_id, pd.date DESC
  )
  SELECT 
    'price_max'::text,
    'Modelo más caro actual'::text,
    ('El modelo más caro actualmente es ' || lp.brand || ' ' || lp.model || ' con $' || 
     to_char(lp.price::bigint, 'FM999,999,999'))::text,
    jsonb_build_object(
      'brand', lp.brand,
      'model', lp.model,
      'name', lp.name,
      'price', lp.price
    ),
    2::integer
  FROM latest_prices lp
  ORDER BY lp.price DESC
  LIMIT 1;

  -- Insight 3: Most stable models (least price variation)
  RETURN QUERY
  WITH price_stability AS (
    SELECT 
      p.brand,
      p.model,
      p.name,
      COUNT(pd.price) as price_count,
      STDDEV(pd.price) as price_stddev,
      AVG(pd.price) as avg_price
    FROM public.products p
    JOIN public.price_data pd ON p.id = pd.product_id
    WHERE pd.date >= CURRENT_DATE - interval '3 months'
    GROUP BY p.id, p.brand, p.model, p.name
    HAVING COUNT(pd.price) >= 3
  )
  SELECT 
    'price_stability'::text,
    'Modelos más estables en precio'::text,
    ('Los modelos con menor variación de precio en los últimos 3 meses: ' || 
     string_agg(ps.brand || ' ' || ps.model, ', '))::text,
    jsonb_agg(jsonb_build_object(
      'brand', ps.brand,
      'model', ps.model,
      'name', ps.name,
      'stability_score', ROUND((ps.price_stddev / ps.avg_price * 100)::numeric, 2)
    )),
    3::integer
  FROM (
    SELECT *
    FROM price_stability
    ORDER BY (price_stddev / avg_price) ASC
    LIMIT 3
  ) ps;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;