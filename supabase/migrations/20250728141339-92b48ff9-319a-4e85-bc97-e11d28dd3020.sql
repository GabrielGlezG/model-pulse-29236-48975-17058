-- Mejorar la función de insights automáticos para incluir más análisis comparativos
CREATE OR REPLACE FUNCTION public.generate_automatic_insights()
 RETURNS TABLE(insight_type text, title text, description text, data jsonb, priority integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    HAVING COUNT(*) > 2
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

  -- Insight 2: Best value models (under median price)
  RETURN QUERY
  WITH price_stats AS (
    SELECT 
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pd.price) as median_price
    FROM public.price_data pd
    JOIN public.products p ON p.id = pd.product_id
    WHERE pd.date >= CURRENT_DATE - interval '6 months'
  ),
  best_value AS (
    SELECT DISTINCT ON (p.id)
      p.brand,
      p.model,
      p.name,
      p.category,
      pd.price,
      ps.median_price
    FROM public.products p
    JOIN public.price_data pd ON p.id = pd.product_id
    CROSS JOIN price_stats ps
    WHERE pd.date >= CURRENT_DATE - interval '6 months'
      AND pd.price <= ps.median_price
    ORDER BY p.id, pd.date DESC
  )
  SELECT 
    'best_value'::text,
    'Mejores oportunidades de compra'::text,
    ('Los modelos con mejor relación calidad-precio están bajo la mediana del mercado ($' || 
     to_char((SELECT median_price FROM price_stats)::bigint, 'FM999,999,999') || ')')::text,
    jsonb_agg(jsonb_build_object(
      'brand', bv.brand,
      'model', bv.model,
      'name', bv.name,
      'category', bv.category,
      'price', bv.price,
      'savings_vs_median', ROUND(((bv.median_price - bv.price) / bv.median_price * 100)::numeric, 1)
    )),
    2::integer
  FROM (
    SELECT *
    FROM best_value
    ORDER BY price ASC
    LIMIT 5
  ) bv;

  -- Insight 3: Most expensive model currently
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
    3::integer
  FROM latest_prices lp
  ORDER BY lp.price DESC
  LIMIT 1;

  -- Insight 4: Price stability analysis
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
    HAVING COUNT(pd.price) >= 2
  )
  SELECT 
    'price_stability'::text,
    'Modelos más estables en precio'::text,
    ('Los modelos con menor variación de precio ofrecen mayor predictibilidad para compradores')::text,
    jsonb_agg(jsonb_build_object(
      'brand', ps.brand,
      'model', ps.model,
      'name', ps.name,
      'stability_score', ROUND((ps.price_stddev / ps.avg_price * 100)::numeric, 2),
      'avg_price', ROUND(ps.avg_price::numeric, 0)
    )),
    4::integer
  FROM (
    SELECT *
    FROM price_stability
    ORDER BY (price_stddev / avg_price) ASC
    LIMIT 3
  ) ps;

  -- Insight 5: Category comparison insights
  RETURN QUERY
  WITH category_analysis AS (
    SELECT 
      p.category,
      COUNT(DISTINCT p.id) as model_count,
      AVG(pd.price) as avg_price,
      MIN(pd.price) as min_price,
      MAX(pd.price) as max_price
    FROM public.products p
    JOIN public.price_data pd ON p.id = pd.product_id
    WHERE pd.date >= CURRENT_DATE - interval '6 months'
    GROUP BY p.category
    HAVING COUNT(DISTINCT p.id) >= 1
  ),
  ranked_categories AS (
    SELECT *, ROW_NUMBER() OVER (ORDER BY avg_price DESC) as price_rank
    FROM category_analysis
  )
  SELECT 
    'category_comparison'::text,
    'Análisis por categorías de vehículos'::text,
    ('El segmento más caro es ' || ca_max.category || 
     ' con promedio de $' || to_char(ca_max.avg_price::bigint, 'FM999,999,999') ||
     ', mientras que ' || ca_min.category || ' es el más accesible')::text,
    jsonb_build_object(
      'most_expensive_category', jsonb_build_object(
        'category', ca_max.category,
        'avg_price', ca_max.avg_price,
        'model_count', ca_max.model_count,
        'price_range', ca_max.max_price - ca_max.min_price
      ),
      'most_affordable_category', jsonb_build_object(
        'category', ca_min.category,
        'avg_price', ca_min.avg_price,
        'model_count', ca_min.model_count,
        'price_range', ca_min.max_price - ca_min.min_price
      )
    ),
    5::integer
  FROM ranked_categories ca_max
  CROSS JOIN (SELECT * FROM ranked_categories ORDER BY avg_price ASC LIMIT 1) ca_min
  WHERE ca_max.price_rank = 1;

END;
$function$;