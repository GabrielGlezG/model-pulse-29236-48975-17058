import { useQuery } from "@tanstack/react-query";
import { ProductsService } from "@/services/api";
import { PaginationParams } from "@/types/api";
import { ProductWithPricing } from "@/services/productsService";

export function useProducts(params: PaginationParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => ProductsService.getProducts(params),
    placeholderData: (previousData) => previousData
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: ProductsService.getBrands
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: ProductsService.getCategories
  });
}

export function useModels(brandFilter?: string, categoryFilter?: string) {
  return useQuery({
    queryKey: ['models', brandFilter, categoryFilter],
    queryFn: () => ProductsService.getModels(brandFilter, categoryFilter)
  });
}

export function useProductsForComparison() {
  return useQuery({
    queryKey: ['products-for-comparison'],
    queryFn: async (): Promise<ProductWithPricing[]> => {
      // For now, return empty array until we implement the proper service
      return [];
    }
  });
}