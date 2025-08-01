// API Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Domain Types
export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PriceData {
  id: string;
  product_id: string;
  price: number;
  store: string;
  url?: string;
  date: string;
  created_at: string;
}

export interface AnalyticsMetrics {
  total_models: number;
  total_brands: number;
  total_categories: number;
  avg_price: number;
  median_price: number;
  min_price: number;
  max_price: number;
  price_std_dev: number;
  price_range: number;
  variation_coefficient: number;
  lower_quartile: number;
  upper_quartile: number;
  current_scraping_date?: string;
  total_scraping_sessions?: number;
}

export interface ChartData {
  prices_by_brand: Array<{
    brand: string;
    avg_price: number;
    min_price: number;
    max_price: number;
    count: number;
    value_score: number;
    price_trend?: number;
  }>;
  prices_by_category: Array<{
    category: string;
    avg_price: number;
    min_price: number;
    max_price: number;
    count: number;
  }>;
  models_by_category: Array<{
    category: string;
    count: number;
  }>;
  price_distribution: Array<{
    range: string;
    count: number;
  }>;
  best_value_models: Array<{
    brand: string;
    name: string;
    category: string;
    price: number;
    value_rating: string;
  }>;
  top_5_expensive: Array<{
    name: string;
    brand: string;
    price: number;
  }>;
  bottom_5_cheap: Array<{
    name: string;
    brand: string;
    price: number;
  }>;
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  chart_data: ChartData;
  historical_data?: Array<{
    date: string;
    price: number;
  }>;
  applied_filters: {
    brand?: string;
    category?: string;
    model?: string;
    date_from?: string;
    date_to?: string;
  };
  generated_at: string;
}

export interface Insight {
  insight_type: string;
  title: string;
  description: string;
  data: any;
  priority: number;
}

export interface ScrapingJob {
  id: string;
  status: string;
  created_at: string;
  completed_at?: string;
  updated_at: string;
  total_products: number;
  completed_products: number;
  error_message?: string;
  results?: any;
}