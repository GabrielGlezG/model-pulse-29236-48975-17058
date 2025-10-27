import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTheme } from "next-themes";
import { hslVar } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Award,
  RefreshCw,
  Zap,
  ShoppingCart,
  AlertCircle,
  Target,
} from "lucide-react";
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler,
} from 'chart.js'
import { useEffect, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  ChartLegend,
  Filler
)

ChartJS.defaults.color = "hsl(var(--foreground))";

import { usePriceDistribution } from "@/hooks/usePriceDistribution";

interface Insight {
  insight_type: string;
  title: string;
  description: string;
  data: any;
  priority: number;
}

export default function Insights() {
  const { formatPrice } = useCurrency();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ChartJS.defaults.color = hslVar('--foreground');
    setMounted(true);
  }, [theme]);

  const {
    data: insights,
    isLoading: insightsLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-insights");
      if (error) throw error;
      return data.insights as Insight[];
    },
  });

  const { data: marketStats, isLoading: statsLoading } = useQuery({
    queryKey: ["market-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-analytics");
      if (error) throw error;
      return data;
    },
  });

  const { data: priceDistributionLocal } = usePriceDistribution();

  // Calcular las mayores variaciones de precio
  const { data: priceVariations, isLoading: variationsLoading } = useQuery({
    queryKey: ["price-variations"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from("price_data")
        .select(`
          product_id,
          price,
          date,
          products (brand, model, name, category)
        `)
        .gte("date", thirtyDaysAgo)
        .order("date", { ascending: false });

      if (error) throw error;

      // Calcular variaciones por producto
      const productMap = new Map();
      
      data.forEach((entry: any) => {
        if (!productMap.has(entry.product_id)) {
          productMap.set(entry.product_id, {
            product: entry.products,
            prices: []
          });
        }
        productMap.get(entry.product_id).prices.push({
          price: entry.price,
          date: entry.date
        });
      });

      const variations = [];
      productMap.forEach((value, productId) => {
        if (value.prices.length >= 2) {
          const sortedPrices = value.prices.sort((a: any, b: any) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          const oldestPrice = sortedPrices[0].price;
          const newestPrice = sortedPrices[sortedPrices.length - 1].price;
          const change = ((newestPrice - oldestPrice) / oldestPrice) * 100;
          
          if (Math.abs(change) > 5) {
            variations.push({
              product: value.product,
              oldPrice: oldestPrice,
              newPrice: newestPrice,
              change: change,
              trend: change > 0 ? 'up' : 'down'
            });
          }
        }
      });

      return variations
        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
        .slice(0, 10);
    },
  });

  const isLoading = insightsLoading || statsLoading || variationsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  // Obtener los mejores insights
  const bestValueInsight = insights?.find(i => i.insight_type === 'best_value');
  const priceStabilityInsight = insights?.find(i => i.insight_type === 'price_stability');
  const categoryInsight = insights?.find(i => i.insight_type === 'category_comparison');

  // Preparar datos para gráfico de tendencia por marca
  const brandTrendData = marketStats?.brands_history ? {
    labels: Object.keys(marketStats.brands_history[Object.keys(marketStats.brands_history)[0]] || {}),
    datasets: Object.keys(marketStats.brands_history).slice(0, 5).map((brand, index) => ({
      label: brand,
      data: Object.values(marketStats.brands_history[brand] || {}),
      borderColor: `hsl(var(--chart-${(index % 5) + 1}))`,
      backgroundColor: `hsl(var(--chart-${(index % 5) + 1}) / 0.1)`,
      tension: 0.4,
      fill: false,
    }))
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 8,
          font: { size: 10 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${formatPrice(context.parsed.y)}`
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value: any) => formatPrice(value),
          font: { size: 10 }
        },
        grid: {
          color: hslVar('--border')
        }
      },
      x: {
        ticks: {
          font: { size: 10 }
        },
        grid: {
          display: false
        }
      }
    }
  };

  const distributionChartData = priceDistributionLocal ? {
    labels: priceDistributionLocal.map((d: any) => d.range),
    datasets: [{
      label: 'Cantidad de Modelos',
      data: priceDistributionLocal.map((d: any) => d.count),
      backgroundColor: [
        `hsl(var(--chart-1))`,
        `hsl(var(--chart-2))`,
        `hsl(var(--chart-3))`,
        `hsl(var(--chart-4))`,
      ],
    }]
  } : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Destacados del Mercado
          </h1>
          <p className="text-muted-foreground">
            Resumen inteligente de las mejores oportunidades y tendencias
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isRefetching} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Market Stats Overview */}
      {marketStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Modelos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{marketStats.total_models || 0}</div>
              <p className="text-xs text-muted-foreground">{marketStats.total_brands || 0} marcas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(marketStats.average_price)}</div>
              <p className="text-xs text-muted-foreground">Mediana: {formatPrice(marketStats.median_price)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rango de Precios</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {formatPrice(marketStats.min_price)} - {formatPrice(marketStats.max_price)}
              </div>
              <p className="text-xs text-muted-foreground">Variación del mercado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volatilidad</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{marketStats.coefficient_variation?.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Coeficiente de variación</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mejores Oportunidades */}
        {bestValueInsight && Array.isArray(bestValueInsight.data) && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <CardTitle>Mejores Oportunidades</CardTitle>
              </div>
              <CardDescription>
                Modelos con el mejor precio vs. mediana del mercado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {bestValueInsight.data.slice(0, 5).map((model: any, index: number) => (
                <div
                  key={index}
                  className="p-3 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {model.brand} {model.model}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {model.name}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {model.category}
                      </Badge>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(model.price)}
                      </p>
                      <Badge className="text-xs bg-green-600">
                        -{model.savings_vs_median}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Mayores Variaciones */}
        {priceVariations && priceVariations.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>Mayores Variaciones</CardTitle>
              </div>
              <CardDescription>
                Modelos con cambios significativos en los últimos 30 días
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {priceVariations.slice(0, 5).map((item: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    item.trend === 'up' 
                      ? 'bg-destructive/5 border-destructive/20' 
                      : 'bg-green-500/5 border-green-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {item.product.brand} {item.product.model}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.product.name}
                      </p>
                      <div className="flex gap-2 mt-1 text-xs">
                        <span className="text-muted-foreground">
                          {formatPrice(item.oldPrice)} → {formatPrice(item.newPrice)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`flex items-center gap-1 font-bold ${
                        item.trend === 'up' ? 'text-destructive' : 'text-green-600'
                      }`}>
                        {item.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span>{item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tendencia de Precios por Marca */}
        {brandTrendData && mounted && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tendencia por Marca (Top 5)</CardTitle>
              <CardDescription>Evolución de precios promedio histórica</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line data={brandTrendData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Distribución de Precios */}
        {distributionChartData && mounted && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribución por Segmento</CardTitle>
              <CardDescription>Cantidad de modelos por rango de precio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar 
                  data={distributionChartData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: { display: false }
                    }
                  }} 
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Category Comparison */}
      {categoryInsight && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comparativa por Categoría</CardTitle>
            <CardDescription>Segmentos más caros vs más accesibles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-destructive" />
                  <h4 className="font-semibold">Segmento Premium</h4>
                </div>
                <p className="font-medium text-lg mb-2">
                  {categoryInsight.data.most_expensive_category.category}
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Promedio:</span>
                    <span className="font-medium">
                      {formatPrice(categoryInsight.data.most_expensive_category.avg_price)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modelos:</span>
                    <span className="font-medium">
                      {categoryInsight.data.most_expensive_category.model_count}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rango:</span>
                    <span className="font-medium">
                      {formatPrice(categoryInsight.data.most_expensive_category.price_range)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Segmento Accesible</h4>
                </div>
                <p className="font-medium text-lg mb-2">
                  {categoryInsight.data.most_affordable_category.category}
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Promedio:</span>
                    <span className="font-medium">
                      {formatPrice(categoryInsight.data.most_affordable_category.avg_price)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modelos:</span>
                    <span className="font-medium">
                      {categoryInsight.data.most_affordable_category.model_count}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rango:</span>
                    <span className="font-medium">
                      {formatPrice(categoryInsight.data.most_affordable_category.price_range)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Stability */}
      {priceStabilityInsight && Array.isArray(priceStabilityInsight.data) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Modelos con Precios Estables</CardTitle>
            <CardDescription>Vehículos con menor variación en los últimos meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {priceStabilityInsight.data.map((item: any, index: number) => (
                <div
                  key={index}
                  className="p-3 bg-muted/50 border border-border rounded-lg"
                >
                  <p className="font-medium text-sm mb-1">
                    {item.brand} {item.model}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatPrice(item.avg_price)}
                    </span>
                    <Badge
                      variant={item.stability_score < 5 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      ±{item.stability_score}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
