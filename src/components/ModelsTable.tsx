import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/custom/Badge";
import { Package } from "lucide-react";

interface ModelsTableProps {
  filters: {
    brand?: string;
    model?: string;
    submodel?: string;
  };
  statusFilter?: 'active' | 'inactive';
}

interface ModelData {
  model: string;
  brand: string;
  name: string;
  estado: string | null;
  units: number;
  revenue: number;
  precio_total: number | null;
  precio_lista: number | null;
  precio_sin_bono: number | null;
}

export function ModelsTable({ filters, statusFilter = 'active' }: ModelsTableProps) {
  const { formatPrice } = useCurrency();

  const { data: modelsData, isLoading } = useQuery({
    queryKey: ['models-table', filters, statusFilter],
    queryFn: async () => {
      // Get latest prices with product details
      const { data: priceData, error } = await supabase
        .from('price_data')
        .select(`
          product_id,
          price,
          precio_texto,
          precio_lista_num,
          bono_num,
          date,
          products!inner(
            id,
            name,
            brand,
            model,
            estado
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      // Group by product and get latest entry
      const productMap = new Map<string, any>();
      
      priceData?.forEach((item: any) => {
        const productId = item.product_id;
        const product = item.products;
        
        // Apply filters
        if (filters.brand && product.brand !== filters.brand) return;
        if (filters.model && product.model !== filters.model) return;
        
        // Apply status filter
        const estado = product.estado?.toLowerCase() || 'activo';
        if (statusFilter === 'active' && estado === 'inactivo') return;
        if (statusFilter === 'inactive' && estado !== 'inactivo') return;

        if (!productMap.has(productId) || new Date(item.date) > new Date(productMap.get(productId).date)) {
          productMap.set(productId, {
            ...item,
            product
          });
        }
      });

      // Aggregate by model
      const modelMap = new Map<string, ModelData>();
      
      Array.from(productMap.values()).forEach((item) => {
        const product = item.product;
        const modelKey = `${product.brand}-${product.model}`;
        
        if (!modelMap.has(modelKey)) {
          modelMap.set(modelKey, {
            model: product.model,
            brand: product.brand,
            name: product.name,
            estado: product.estado,
            units: 0,
            revenue: 0,
            precio_total: null,
            precio_lista: null,
            precio_sin_bono: null,
          });
        }

        const modelData = modelMap.get(modelKey)!;
        modelData.units += 1;
        modelData.revenue += item.price || 0;
        
        // Calculate average prices
        const currentCount = modelData.units;
        const precioTotal = parseFloat(item.precio_texto?.replace(/[^0-9.-]/g, '') || '0');
        
        modelData.precio_total = ((modelData.precio_total || 0) * (currentCount - 1) + (precioTotal || item.price)) / currentCount;
        modelData.precio_lista = ((modelData.precio_lista || 0) * (currentCount - 1) + (item.precio_lista_num || item.price)) / currentCount;
        modelData.precio_sin_bono = ((modelData.precio_sin_bono || 0) * (currentCount - 1) + ((item.precio_lista_num || 0) - (item.bono_num || 0))) / currentCount;
      });

      return Array.from(modelMap.values()).sort((a, b) => b.revenue - a.revenue);
    },
    staleTime: 30000,
  });

  const calculateVsList = (precioTotal: number | null, precioLista: number | null) => {
    if (!precioTotal || !precioLista || precioLista === 0) return 0;
    return ((precioTotal - precioLista) / precioLista) * 100;
  };

  const formatRevenue = (revenue: number) => {
    if (revenue >= 1000000) {
      return `$${(revenue / 1000000).toFixed(1)}M`;
    }
    return formatPrice(revenue);
  };

  if (isLoading) {
    return (
      <Card className="border-border/50 shadow-md">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          {statusFilter === 'active' ? 'Modelos Activos' : 'Modelos Inactivos'}
        </CardTitle>
        <CardDescription>
          Desglose detallado de precios por modelo
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Modelo</TableHead>
                <TableHead className="text-right">Unidades</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Precio Total</TableHead>
                <TableHead className="text-right">Precio Lista</TableHead>
                <TableHead className="text-right">Sin Bono</TableHead>
                <TableHead className="text-right">vs. Lista</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modelsData?.map((model, index) => {
                const vsList = calculateVsList(model.precio_total, model.precio_lista);
                const isNuevo = model.estado?.toLowerCase() === 'nuevo';
                
                return (
                  <TableRow key={`${model.brand}-${model.model}-${index}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{model.model}</span>
                        {isNuevo && statusFilter === 'active' && (
                          <Badge variant="success">Nuevo</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{model.brand}</div>
                    </TableCell>
                    <TableCell className="text-right">{model.units.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">{formatRevenue(model.revenue)}</TableCell>
                    <TableCell className="text-right">{formatPrice(model.precio_total || 0)}</TableCell>
                    <TableCell className="text-right">{formatPrice(model.precio_lista || 0)}</TableCell>
                    <TableCell className="text-right">{formatPrice(model.precio_sin_bono || 0)}</TableCell>
                    <TableCell className="text-right">
                      <span className={vsList < 0 ? 'text-red-500' : vsList > 0 ? 'text-green-500' : ''}>
                        {vsList.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!modelsData || modelsData.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay modelos {statusFilter === 'inactive' ? 'inactivos' : 'activos'} para mostrar
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
