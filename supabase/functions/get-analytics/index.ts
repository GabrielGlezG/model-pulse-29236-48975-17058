import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const filters = {
      brand: url.searchParams.get('brand'),
      category: url.searchParams.get('category'),
      model: url.searchParams.get('model'),
      dateFrom: url.searchParams.get('dateFrom'),
      dateTo: url.searchParams.get('dateTo'),
    };

    console.log('Getting analytics with filters:', filters);

    // Base query for latest prices
    let latestPricesQuery = supabaseClient
      .from('price_data')
      .select(`
        *,
        products (
          id,
          brand,
          category,
          model,
          name
        )
      `)
      .order('date', { ascending: false });

    // Apply filters
    if (filters.dateFrom) {
      latestPricesQuery = latestPricesQuery.gte('date', filters.dateFrom);
    }
    if (filters.dateTo) {
      latestPricesQuery = latestPricesQuery.lte('date', filters.dateTo);
    }

    const { data: priceData, error: priceError } = await latestPricesQuery;

    if (priceError) {
      console.error('Error fetching price data:', priceError);
      throw priceError;
    }

    // Filter by product fields if needed
    let filteredData = priceData || [];
    if (filters.brand) {
      filteredData = filteredData.filter(item => 
        item.products?.brand?.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }
    if (filters.category) {
      filteredData = filteredData.filter(item => 
        item.products?.category?.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    if (filters.model) {
      filteredData = filteredData.filter(item => 
        item.products?.model?.toLowerCase().includes(filters.model.toLowerCase())
      );
    }

    // Calculate metrics
    const prices = filteredData.map(item => parseFloat(item.price));
    const brands = [...new Set(filteredData.map(item => item.products?.brand))].filter(Boolean);
    const categories = [...new Set(filteredData.map(item => item.products?.category))].filter(Boolean);
    
    const metrics = {
      total_models: filteredData.length,
      total_brands: brands.length,
      avg_price: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
      min_price: prices.length > 0 ? Math.min(...prices) : 0,
      max_price: prices.length > 0 ? Math.max(...prices) : 0,
      price_std_dev: prices.length > 1 ? Math.sqrt(
        prices.reduce((acc, price) => {
          const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
          return acc + Math.pow(price - avg, 2);
        }, 0) / (prices.length - 1)
      ) : 0,
    };

    // Group data for charts
    const pricesByBrand = brands.map(brand => {
      const brandPrices = filteredData
        .filter(item => item.products?.brand === brand)
        .map(item => parseFloat(item.price));
      return {
        brand,
        prices: brandPrices,
        avg_price: brandPrices.reduce((a, b) => a + b, 0) / brandPrices.length,
        count: brandPrices.length
      };
    });

    const modelsByCategory = categories.map(category => ({
      category,
      count: filteredData.filter(item => item.products?.category === category).length
    }));

    // Top 5 most expensive and cheapest
    const sortedByPrice = [...filteredData].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    const top5Expensive = sortedByPrice.slice(0, 5).map(item => ({
      brand: item.products?.brand,
      model: item.products?.name,
      price: parseFloat(item.price)
    }));
    const top5Cheapest = sortedByPrice.slice(-5).reverse().map(item => ({
      brand: item.products?.brand,
      model: item.products?.name,
      price: parseFloat(item.price)
    }));

    // Historical data for selected models
    const historicalData = [];
    if (filters.model) {
      const { data: historical, error: histError } = await supabaseClient
        .from('price_data')
        .select(`
          *,
          products (brand, model, name)
        `)
        .eq('products.model', filters.model)
        .order('date', { ascending: true });

      if (!histError && historical) {
        historicalData.push(...historical);
      }
    }

    console.log('Analytics generated successfully');

    return new Response(
      JSON.stringify({
        metrics,
        chart_data: {
          prices_by_brand: pricesByBrand,
          models_by_category: modelsByCategory,
          top_5_expensive: top5Expensive.map(item => ({
            brand: item.brand,
            name: item.model,
            price: item.price
          })),
          bottom_5_cheap: top5Cheapest.map(item => ({
            brand: item.brand,
            name: item.model,
            price: item.price
          }))
        },
        historical_data: historicalData.map(item => ({
          date: item.date,
          price: parseFloat(item.price)
        })),
        applied_filters: {
          brand: filters.brand,
          category: filters.category,
          model: filters.model,
          date_from: filters.dateFrom,
          date_to: filters.dateTo
        },
        generated_at: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});