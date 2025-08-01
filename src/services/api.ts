import { supabase } from "@/integrations/supabase/client";
import { 
  Product, 
  PriceData, 
  AnalyticsData, 
  Insight, 
  ScrapingJob,
  PaginatedResponse,
  PaginationParams 
} from "@/types/api";

// Analytics Service
export class AnalyticsService {
  static async getAnalytics(filters?: Record<string, string>): Promise<AnalyticsData> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    const { data, error } = await supabase.functions.invoke('get-analytics', {
      body: { params: params.toString() }
    });
    
    if (error) throw error;
    return data as AnalyticsData;
  }

  static async getInsights(): Promise<Insight[]> {
    const { data, error } = await supabase.functions.invoke('get-insights');
    if (error) throw error;
    return data.insights as Insight[];
  }

  static async getMarketStats(): Promise<AnalyticsData> {
    const { data, error } = await supabase.functions.invoke('get-analytics');
    if (error) throw error;
    return data;
  }
}

// Products Service
export class ProductsService {
  static async getProducts(params: PaginationParams): Promise<PaginatedResponse<Product>> {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order(params.sort || 'created_at', { ascending: params.order === 'asc' })
      .range((params.page - 1) * params.limit, params.page * params.limit - 1);

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,brand.ilike.%${params.search}%,model.ilike.%${params.search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / params.limit);
    
    return {
      data: data || [],
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count || 0,
        totalPages,
        hasNext: params.page < totalPages,
        hasPrevious: params.page > 1
      }
    };
  }

  static async getBrands(): Promise<string[]> {
    const { data, error } = await supabase
      .from('products')
      .select('brand')
      .order('brand');
    
    if (error) throw error;
    return [...new Set(data.map(p => p.brand))];
  }

  static async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .order('category');
    
    if (error) throw error;
    return [...new Set(data.map(p => p.category))];
  }

  static async getModels(brandFilter?: string, categoryFilter?: string): Promise<Array<{model: string, name: string, brand: string}>> {
    let query = supabase
      .from('products')
      .select('model, name, brand')
      .order('model');
    
    if (brandFilter) {
      query = query.eq('brand', brandFilter);
    }
    if (categoryFilter) {
      query = query.eq('category', categoryFilter);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data.map(p => ({ model: p.model, name: p.name, brand: p.brand }));
  }

  static async getProductsForComparison(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('brand')
      .limit(100);
    
    if (error) throw error;
    return data || [];
  }
}

// Price Data Service
export class PriceDataService {
  static async getRecentTrends(): Promise<PriceData[]> {
    const { data, error } = await supabase
      .from('price_data')
      .select(`
        *,
        products!inner(name, brand, model)
      `)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data || [];
  }
}

// Scraping Jobs Service
export class ScrapingJobsService {
  static async getJobs(): Promise<ScrapingJob[]> {
    const { data, error } = await supabase
      .from('scraping_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data as ScrapingJob[];
  }

  static async uploadFile(file: File): Promise<void> {
    const text = await file.text();
    const { data, error } = await supabase.functions.invoke('upload-json', {
      body: { 
        content: text, 
        filename: file.name 
      }
    });
    
    if (error) throw error;
    return data;
  }
}