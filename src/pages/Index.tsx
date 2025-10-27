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
} from "@/components/custom/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  RefreshCw,
  Target,
  Award,
  ShoppingCart,
  ArrowUpDown,
} from "lucide-react";
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js'
import { useEffect, useState, useMemo } from "react";
import { usePriceDistribution } from "@/hooks/usePriceDistribution";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend
)

ChartJS.defaults.color = "hsl(var(--foreground))";

interface Insight {
  insight_type: string;
  title: string;
  description: string;
  data: any;
  priority: number;
}

interface PriceVariation {
  product_id: string;
  brand: string;
  model: string;
  name: string;
  category: string;
  current_price: number;
  previous_price: number;
  variation_percent: number;
  date_range: string;
}

export default function Index() {
  const { formatPrice } = useCurrency();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ChartJS.defaults.color = hslVar('--foreground');
    setMounted(false);
    const isMobile = window.innerWidth < 768;
    const delay = isMobile ? 100 : 50;
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [theme]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const COLORS = useMemo(() => [
    hslVar('--chart-1'),
    hslVar('--chart-2'),
    hslVar('--chart-3'),
    hslVar('--chart-4'),
    hslVar('--chart-5'),
  ], [theme]);

  // Fetch insights
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

  // Fetch price variations
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

      // Group by product and calculate variations
      const productMap = new Map<string, any[]>();
      data.forEach((item: any) => {
        if (!productMap.has(item.product_id)) {
          productMap.set(item.product_id, []);
        }
        productMap.get(item.product_id)!.push(item);
      });

      const variations: PriceVariation[] = [];
      productMap.forEach((prices, productId) => {
        if (prices.length < 2 || !prices[0].products) return;
        
        const sortedPrices = prices.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const currentPrice = sortedPrices[0].price;
        const oldestPrice = sortedPrices[sortedPrices.length - 1].price;
        const variationPercent = ((currentPrice - oldestPrice) / oldestPrice) * 100;

        if (Math.abs(variationPercent) > 5) {
          variations.push({
            product_id: productId,
            brand: prices[0].products.brand,
            model: prices[0].products.model,
            name: prices[0].products.name,
            category: prices[0].products.category,
            current_price: currentPrice,
            previous_price: oldestPrice,
            variation_percent: variationPercent,
            date_range: "30 días",
          });
        }
      });

      return variations.sort((a, b) => 
        Math.abs(b.variation_percent) - Math.abs(a.variation_percent)
      ).slice(0, 10);
    },
  });

  // Market stats
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

  const isLoading = insightsLoading || variationsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "price_trend":
        return <TrendingUp className="h-5 w-5 text-primary" />;
      case "best_value":
        return <Award className="h-5 w-5 text-primary" />;
      case "historical_opportunity":
        return <Target className="h-5 w-5 text-green-500" />;
      case "price_stability":
        return <BarChart3 className="h-5 w-5 text-primary" />;
      case "category_comparison":
        return <ShoppingCart className="h-5 w-5 text-primary" />;
      default:
        return <Sparkles className="h-5 w-5 text-primary" />;
    }
  };

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return <Badge variant="destructive">Alta</Badge>;
      case 2:
        return <Badge variant="secondary">Media</Badge>;
      case 3:
        return <Badge variant="outline">Baja</Badge>;
      default:
        return null;
    }
  };

  const topInsights = insights?.slice(0, 3) || [];

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Destacados
          </h1>
          <p className="text-muted-foreground mt-1">
            Información clave del mercado y las mejores oportunidades
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isRefetching}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Market Overview Cards */}
      {marketStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Precio Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatPrice(marketStats.averagePrice)}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Modelos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: hslVar('--chart-2') }}>
                {marketStats.totalModels}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categorías
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: hslVar('--chart-3') }}>
                {marketStats.totalCategories}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Price Variations Section */}
      {priceVariations && priceVariations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-6 w-6 text-primary" />
              <CardTitle>Mayores Variaciones de Precio</CardTitle>
            </div>
            <CardDescription>
              Vehículos con cambios significativos en los últimos 30 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priceVariations.map((variation, index) => (
                <div
                  key={variation.product_id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                    variation.variation_percent > 0
                      ? 'bg-destructive/5 border-destructive/30'
                      : 'bg-primary/5 border-primary/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <p className="font-semibold text-lg truncate">
                          {variation.brand} {variation.model}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 truncate">
                        {variation.name}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {variation.category}
                      </Badge>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`flex items-center gap-1 justify-end mb-1 ${
                        variation.variation_percent > 0 ? 'text-destructive' : 'text-primary'
                      }`}>
                        {variation.variation_percent > 0 ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
                        )}
                        <span className="text-2xl font-bold">
                          {variation.variation_percent > 0 ? '+' : ''}
                          {variation.variation_percent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Actual: <span className="font-semibold">{formatPrice(variation.current_price)}</span></p>
                        <p>Anterior: <span className="font-semibold">{formatPrice(variation.previous_price)}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Distribution Chart */}
      {mounted && priceDistributionLocal && priceDistributionLocal.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Precios por Segmento</CardTitle>
            <CardDescription>
              Cantidad de vehículos en cada rango de precio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar
                key={theme}
                data={{
                  labels: priceDistributionLocal.map((d) => d.range),
                  datasets: [
                    {
                      label: 'Cantidad de Vehículos',
                      data: priceDistributionLocal.map((d) => d.count),
                      backgroundColor: COLORS.map(c => c + '80'),
                      borderColor: COLORS,
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.parsed.y} vehículos`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                        color: hslVar('--muted-foreground'),
                      },
                      grid: { color: hslVar('--border') },
                    },
                    x: {
                      ticks: { color: hslVar('--muted-foreground') },
                      grid: { color: hslVar('--border') },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Insights */}
      {topInsights.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Insights Destacados</h2>
          <div className="space-y-4">
            {topInsights.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {getInsightIcon(insight.insight_type)}
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {insight.description}
                        </CardDescription>
                      </div>
                    </div>
                    {getPriorityBadge(insight.priority)}
                  </div>
                </CardHeader>
                {insight.insight_type === "best_value" && Array.isArray(insight.data) && (
                  <CardContent>
                    <div className="space-y-3">
                      {insight.data.slice(0, 3).map((model: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold">
                                {model.brand} {model.model}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {model.name}
                              </p>
                              <Badge className="mt-2 text-xs bg-primary">
                                Ahorro {model.savings_vs_median}%
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-primary">
                                {formatPrice(model.price)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
