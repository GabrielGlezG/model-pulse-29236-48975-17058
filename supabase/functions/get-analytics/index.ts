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

    // Parse request body to get filters
    const requestBody = await req.json().catch(() => ({}));
    const params = new URLSearchParams(requestBody.params || '');
    
    const filters = {
      brand: params.get('brand'),
      category: params.get('category'),
      model: params.get('model'),
      dateFrom: params.get('date_from'),
      dateTo: params.get('date_to'),
    };

    console.log('Getting analytics with filters:', filters);

    // Get all price data with products
    const { data: allPriceData, error: priceError } = await supabaseClient
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

    if (priceError) {
      console.error('Error fetching price data:', priceError);
      throw priceError;
    }

    console.log('Total price records fetched:', allPriceData?.length || 0);

    // Group by product and get latest price for each
    const latestPricesByProduct = new Map();
    allPriceData?.forEach(item => {
      const productId = item.products?.id;
      if (productId && (!latestPricesByProduct.has(productId) || 
          new Date(item.date) > new Date(latestPricesByProduct.get(productId).date))) {
        latestPricesByProduct.set(productId, {
          ...item,
          products: item.products
        });
      }
    });

    let filteredData = Array.from(latestPricesByProduct.values());
    console.log('Latest prices by product:', filteredData.length);
    
    // Apply filters manually
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
    if (filters.dateFrom) {
      filteredData = filteredData.filter(item => 
        new Date(item.date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filteredData = filteredData.filter(item => 
        new Date(item.date) <= new Date(filters.dateTo)
      );
    }

    console.log('Filtered data count:', filteredData.length);

    // Calculate comprehensive metrics
    const prices = filteredData.map(item => parseFloat(item.price));
    const brands = [...new Set(filteredData.map(item => item.products?.brand))].filter(Boolean);
    const categories = [...new Set(filteredData.map(item => item.products?.category))].filter(Boolean);
    
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    
    // Calculate median price
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const medianPrice = prices.length > 0 ? (() => {
      const mid = Math.floor(sortedPrices.length / 2);
      return sortedPrices.length % 2 !== 0 ? sortedPrices[mid] : (sortedPrices[mid - 1] + sortedPrices[mid]) / 2;
    })() : 0;
    
    // Calculate price standard deviation and variation coefficient
    const variance = prices.length > 1 ? 
      prices.reduce((acc, price) => acc + Math.pow(price - avgPrice, 2), 0) / (prices.length - 1) : 0;
    const stdDev = Math.sqrt(variance);
    const variationCoeff = avgPrice > 0 ? (stdDev / avgPrice) * 100 : 0;
    
    // Calculate price ranges for comparison
    const priceRange = maxPrice - minPrice;
    const lowerQuartile = prices.length > 0 ? sortedPrices[Math.floor(sortedPrices.length * 0.25)] : 0;
    const upperQuartile = prices.length > 0 ? sortedPrices[Math.floor(sortedPrices.length * 0.75)] : 0;
    
    // Calculate metrics based on current scraping date
    const metrics = {
      total_models: filteredData.length,
      total_brands: brands.length,
      total_categories: categories.length,
      avg_price: avgPrice,
      median_price: medianPrice,
      min_price: minPrice,
      max_price: maxPrice,
      price_std_dev: stdDev,
      price_range: priceRange,
      variation_coefficient: variationCoeff,
      lower_quartile: lowerQuartile,
      upper_quartile: upperQuartile,
      current_scraping_date: filteredData.length > 0 ? filteredData[0].date : null,
      total_scraping_sessions: 0 // Will be updated below
    };

    // Get total scraping sessions count (distinct dates)
    const { data: scrapingSessions, error: sessionsError } = await supabaseClient
      .rpc('get_distinct_scraping_dates');
    
    if (!sessionsError && scrapingSessions) {
      metrics.total_scraping_sessions = scrapingSessions.length;
    } else {
      // Fallback: count distinct dates manually
      const { data: allDates } = await supabaseClient
        .from('price_data')
        .select('date');
      
      const uniqueDates = [...new Set(allDates?.map(d => d.date.split('T')[0]))];
      metrics.total_scraping_sessions = uniqueDates.length;
    }

    // Group data for comprehensive charts WITH TEMPORAL ANALYSIS
    const pricesByBrand = await Promise.all(brands.map(async (brand) => {
      const brandPrices = filteredData
        .filter(item => item.products?.brand === brand)
        .map(item => parseFloat(item.price));
      const brandAvg = brandPrices.reduce((a, b) => a + b, 0) / brandPrices.length;
      
      // Get historical trend for this brand (last 2 scraping dates)
      const { data: brandHistory } = await supabaseClient
        .from('price_data')
        .select(`
          date, price,
          products!inner (brand)
        `)
        .eq('products.brand', brand)
        .order('date', { ascending: false })
        .limit(100);
      
      // Calculate trend
      const recentPrices = brandHistory?.map(h => parseFloat(h.price)) || [];
      const trend = recentPrices.length > 1 ? 
        ((recentPrices[0] - recentPrices[recentPrices.length - 1]) / recentPrices[recentPrices.length - 1] * 100) : 0;
      
      return {
        brand,
        avg_price: brandAvg,
        min_price: Math.min(...brandPrices),
        max_price: Math.max(...brandPrices),
        count: brandPrices.length,
        value_score: avgPrice > 0 ? ((avgPrice - brandAvg) / avgPrice * 100) : 0,
        price_trend: trend // Percentage change from first to last scraping
      };
    }));

    const pricesByCategory = categories.map(category => {
      const categoryPrices = filteredData
        .filter(item => item.products?.category === category)
        .map(item => parseFloat(item.price));
      return {
        category,
        avg_price: categoryPrices.reduce((a, b) => a + b, 0) / categoryPrices.length,
        min_price: Math.min(...categoryPrices),
        max_price: Math.max(...categoryPrices),
        count: categoryPrices.length
      };
    });

    const modelsByCategory = categories.map(category => ({
      category,
      count: filteredData.filter(item => item.products?.category === category).length
    }));

    // Price distribution for comparison insights
    const priceDistribution = [
      { range: 'Bajo ($0-$300k)', count: prices.filter(p => p <= 300000).length },
      { range: 'Medio ($300k-$600k)', count: prices.filter(p => p > 300000 && p <= 600000).length },
      { range: 'Alto ($600k-$1M)', count: prices.filter(p => p > 600000 && p <= 1000000).length },
      { range: 'Premium ($1M+)', count: prices.filter(p => p > 1000000).length }
    ];

    // Best value models (under median price but high features implied by category)
    const bestValueModels = filteredData
      .filter(item => parseFloat(item.price) <= medianPrice)
      .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
      .slice(0, 5)
      .map(item => ({
        brand: item.products?.brand,
        name: item.products?.name,
        category: item.products?.category,
        price: parseFloat(item.price),
        value_rating: ((medianPrice - parseFloat(item.price)) / medianPrice * 100).toFixed(1)
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
          date,
          price,
          products!inner (brand, model, name)
        `)
        .eq('products.model', filters.model)
        .order('date', { ascending: true });

      if (!histError && historical) {
        historicalData.push(...historical.map(item => ({
          date: item.date,
          price: parseFloat(item.price)
        })));
      }
    }

    console.log('Analytics generated successfully');

    return new Response(
      JSON.stringify({
        metrics,
        chart_data: {
          prices_by_brand: pricesByBrand,
          prices_by_category: pricesByCategory,
          models_by_category: modelsByCategory,
          price_distribution: priceDistribution,
          best_value_models: bestValueModels,
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
        historical_data: historicalData,
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