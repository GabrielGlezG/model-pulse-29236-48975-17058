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
  Lightbulb,
  TrendingUp,
  DollarSign,
  BarChart3,
  RefreshCw,
  Target,
  Award,
  TrendingDown,
  Calendar,
  Sparkles,
  Activity,
} from "lucide-react";
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js'
import { useEffect, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  ChartLegend
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
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, [theme]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: insights,
    isLoading,
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

  const { data: marketStats } = useQuery({
    queryKey: ["market-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-analytics");
      if (error) throw error;
      return data;
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: priceDistributionLocal } = usePriceDistribution();

  const { data: recentTrends } = useQuery({
    queryKey: ["recent-trends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("price_data")
        .select(
          `
          *,
          products (brand, category, model, name)
        `
        )
        .gte(
          "date",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        )
        .order("date", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  const bestValueInsight = insights?.find(i => i.insight_type === "best_value");
  const historicalOpportunity = insights?.find(i => i.insight_type === "historical_opportunity");
  const priceTrends = insights?.filter(i => i.insight_type === "price_trend") || [];
  const categoryComparison = insights?.find(i => i.insight_type === "category_comparison");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            Destacados
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Información clave y tendencias del mercado
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isRefetching} size="sm">
          {isRefetching ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {marketStats && (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Modelos Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {marketStats.metrics?.total_models || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {marketStats.metrics?.total_brands || 0} marcas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Precio Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {formatPrice(marketStats.metrics?.avg_price || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Mediana: {formatPrice(marketStats.metrics?.median_price || 0)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Volatilidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {marketStats.metrics?.variation_coefficient
                  ? `${marketStats.metrics.variation_coefficient.toFixed(1)}%`
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Coeficiente variación
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Actualizaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {recentTrends?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Últimos 30 días
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Distribución por Segmento
            </CardTitle>
            <CardDescription className="text-xs">
              Modelos en cada rango
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {mounted && priceDistributionLocal && (
                <Doughnut
                  data={{
                    labels: priceDistributionLocal.map((item: any) => {
                      const range = item.range;
                      const priceMatch = range.match(/\$[\d,.]+[MK]?/gi);
                      if (priceMatch && priceMatch.length >= 2) {
                        const parsePrice = (priceStr: string): number => {
                          const cleanStr = priceStr.replace("$", "").replace(/,/g, "");
                          if (cleanStr.toUpperCase().includes("M"))
                            return parseFloat(cleanStr.replace(/M/gi, "")) * 1_000_000;
                          if (cleanStr.toUpperCase().includes("K"))
                            return parseFloat(cleanStr.replace(/K/gi, "")) * 1_000;
                          return parseFloat(cleanStr);
                        };
                        const minPrice = parsePrice(priceMatch[0]);
                        const maxPrice = parsePrice(priceMatch[1]);
                        return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
                      }
                      return range.split(":")[0].trim();
                    }),
                    datasets: [
                      {
                        data: priceDistributionLocal.map((item: any) => item.count),
                        backgroundColor: [
                          hslVar('--chart-1'),
                          hslVar('--chart-2'),
                          hslVar('--chart-3'),
                          hslVar('--chart-4'),
                          hslVar('--chart-5'),
                          hslVar('--chart-6'),
                        ],
                        borderWidth: 2,
                        borderColor: hslVar('--card'),
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: hslVar('--card'),
                        borderColor: hslVar('--border'),
                        borderWidth: 1,
                        titleColor: hslVar('--foreground'),
                        bodyColor: hslVar('--foreground'),
                        padding: 8,
                        cornerRadius: 6,
                        callbacks: {
                          label: (context) => `${context.parsed} modelos`
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
            <div className="mt-3 space-y-1">
              {priceDistributionLocal?.slice(0, 3).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: [hslVar('--chart-1'), hslVar('--chart-2'), hslVar('--chart-3')][index] }}
                    />
                    <span className="text-muted-foreground truncate">{item.range.split(':')[0].slice(0, 20)}</span>
                  </div>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {categoryComparison && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Segmentos de Mercado
              </CardTitle>
              <CardDescription className="text-xs">
                Comparación entre categorías más y menos costosas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-red-500" />
                    <h4 className="font-semibold text-sm text-red-600">Más Caro</h4>
                  </div>
                  <p className="font-medium text-base mb-2">
                    {categoryComparison.data.most_expensive_category.category}
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Promedio:</span>
                      <span className="font-medium">
                        {formatPrice(categoryComparison.data.most_expensive_category.avg_price)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modelos:</span>
                      <span className="font-medium">
                        {categoryComparison.data.most_expensive_category.model_count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rango:</span>
                      <span className="font-medium">
                        {formatPrice(categoryComparison.data.most_expensive_category.price_range)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <h4 className="font-semibold text-sm text-green-600">Más Accesible</h4>
                  </div>
                  <p className="font-medium text-base mb-2">
                    {categoryComparison.data.most_affordable_category.category}
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Promedio:</span>
                      <span className="font-medium">
                        {formatPrice(categoryComparison.data.most_affordable_category.avg_price)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modelos:</span>
                      <span className="font-medium">
                        {categoryComparison.data.most_affordable_category.model_count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rango:</span>
                      <span className="font-medium">
                        {formatPrice(categoryComparison.data.most_affordable_category.price_range)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {bestValueInsight && Array.isArray(bestValueInsight.data) && bestValueInsight.data.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Mejores Oportunidades del Mercado
            </CardTitle>
            <CardDescription className="text-xs">
              Modelos con mejor relación calidad-precio vs mediana del mercado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {bestValueInsight.data.slice(0, 6).map((model: any, index: number) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {model.brand} {model.model}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{model.name}</p>
                    </div>
                    <Badge className="bg-primary text-xs ml-2 flex-shrink-0">
                      -{model.savings_vs_median}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {model.category}
                    </Badge>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(model.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {historicalOpportunity && Array.isArray(historicalOpportunity.data) && historicalOpportunity.data.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              Oportunidades Históricas
            </CardTitle>
            <CardDescription className="text-xs">
              Modelos cerca de su precio histórico mínimo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {historicalOpportunity.data.slice(0, 6).map((model: any, index: number) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border bg-gradient-to-r from-green-500/5 to-green-500/10 border-green-500/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {model.brand} {model.model}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{model.name}</p>
                    </div>
                    <Badge className="bg-green-600 text-xs ml-2 flex-shrink-0">
                      {model.range_percent}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    <div className="text-center p-1.5 bg-background/50 rounded">
                      <p className="text-[10px] text-muted-foreground">Actual</p>
                      <p className="text-xs font-bold text-primary">
                        {formatPrice(model.current_price)}
                      </p>
                    </div>
                    <div className="text-center p-1.5 bg-background/50 rounded">
                      <p className="text-[10px] text-muted-foreground">Mín</p>
                      <p className="text-xs font-bold text-green-600">
                        {formatPrice(model.historical_low)}
                      </p>
                    </div>
                    <div className="text-center p-1.5 bg-background/50 rounded">
                      <p className="text-[10px] text-muted-foreground">Máx</p>
                      <p className="text-xs font-bold text-red-600">
                        {formatPrice(model.historical_high)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {priceTrends.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Tendencias de Precios Recientes
            </CardTitle>
            <CardDescription className="text-xs">
              Marcas con mayor cambio de precio en el último período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {priceTrends.slice(0, 8).map((trend: Insight, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    trend.data.change_percent > 0
                      ? 'bg-red-500/10 border-red-500/20'
                      : 'bg-green-500/10 border-green-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">{trend.data.brand}</p>
                    <div className="flex items-center gap-1">
                      {trend.data.change_percent > 0 ? (
                        <TrendingUp className="h-3 w-3 text-red-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-green-500" />
                      )}
                      <span
                        className={`text-xs font-bold ${
                          trend.data.change_percent > 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {trend.data.change_percent > 0 ? '+' : ''}
                        {trend.data.change_percent}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actual:</span>
                      <span className="font-medium">{formatPrice(trend.data.current_avg)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Anterior:</span>
                      <span className="font-medium">{formatPrice(trend.data.previous_avg)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(!insights || insights.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No hay destacados disponibles
            </h3>
            <p className="text-muted-foreground text-center text-sm mb-4">
              Los insights se generan automáticamente cuando hay suficientes datos históricos.
            </p>
            <Button onClick={() => refetch()} disabled={isRefetching}>
              {isRefetching ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Generando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generar Destacados
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
