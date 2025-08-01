import { supabase } from "@/integrations/supabase/client";

export interface ProductWithPricing {
  id: string;
  brand: string;
  category: string;
  model: string;
  name: string;
  latest_price: number;
  min_price: number;
  max_price: number;
  avg_price: number;
  price_history: Array<{date: string, price: number}>;
}

export async function getProductsForComparison(): Promise<ProductWithPricing[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      price_data (price, date)
    `)
    .order('brand');
  
  if (error) throw error;
  
  return data?.map(product => {
    const prices = product.price_data?.map((p: any) => p.price) || [];
    const sortedHistory = product.price_data?.sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ) || [];
    
    return {
      ...product,
      latest_price: prices.length > 0 ? prices[prices.length - 1] : 0,
      min_price: prices.length > 0 ? Math.min(...prices) : 0,
      max_price: prices.length > 0 ? Math.max(...prices) : 0,
      avg_price: prices.length > 0 ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : 0,
      price_history: sortedHistory
    };
  }) || [];
}