export interface ProductWithPricing {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  latest_price: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  price_history?: Array<{
    date: string;
    price: number;
  }>;
}

export async function getProductsForComparison(): Promise<ProductWithPricing[]> {
  // For now, return empty array - this would normally fetch from API
  return [];
}