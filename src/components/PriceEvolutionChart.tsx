import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { hslVar } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler,
} from "chart.js";
import { TrendingUp, Calendar, RefreshCw } from "lucide-react";
import { useState } from "react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  ChartLegend,
  Filler
);

interface PriceEvolutionProps {
  selectedBrand?: string;
  selectedCategory?: string;
  selectedModel?: string;
  selectedSubmodel?: string;
}

const CHART_COLORS = [
  hslVar('--chart-1'),
  hslVar('--chart-2'),
  hslVar('--chart-3'),
  hslVar('--chart-4'),
  hslVar('--chart-5'),
];

export function PriceEvolutionChart({
  selectedBrand,
  selectedCategory,
  selectedModel,
  selectedSubmodel,
}: PriceEvolutionProps) {
  const { formatPrice } = useCurrency();
  const [timeRange, setTimeRange] = useState("6months");
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("week");

  const {
    data: evolutionData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: [
      "price-evolution",
      selectedBrand,
      selectedCategory,
      selectedModel,
      selectedSubmodel,
      timeRange,
      groupBy,
    ],
    queryFn: async () => {
      let query = supabase
        .from("price_data")
        .select(
          `
          date,
          price,
          ctx_precio,
          products!inner (
            id,
            brand,
            category,
            model,
            name,
            submodel
          )
        `
        )
        .order("date", { ascending: true });

      const now = new Date();
      let startDate: Date;
      switch (timeRange) {
        case "1month":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
          );
          break;
        case "3months":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 3,
            now.getDate()
          );
          break;
        case "6months":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 6,
            now.getDate()
          );
          break;
        case "1year":
          startDate = new Date(
            now.getFullYear() - 1,
            now.getMonth(),
            now.getDate()
          );
          break;
        case "2years":
          startDate = new Date(
            now.getFullYear() - 2,
            now.getMonth(),
            now.getDate()
          );
          break;
        default:
          startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 6,
            now.getDate()
          );
      }

      query = query.gte("date", startDate.toISOString());

      if (selectedBrand) {
        query = query.eq("products.brand", selectedBrand);
      }
      if (selectedCategory) {
        query = query.eq("products.category", selectedCategory);
      }
      if (selectedModel) {
        query = query.eq("products.model", selectedModel);
      }
      if (selectedSubmodel) {
        query = query.eq("products.submodel", selectedSubmodel);
      }

      const { data, error } = await query;

      if (error) throw error;

      const groupedData = new Map<string, Map<string, number[]>>();

      data?.forEach((item) => {
        const date = new Date(item.date);
        let timeKey: string;

        switch (groupBy) {
          case "day":
            timeKey = date.toISOString().split("T")[0];
            break;
          case "week":
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            timeKey = weekStart.toISOString().split("T")[0];
            break;
          case "month":
            timeKey = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`;
            break;
          default:
            timeKey = date.toISOString().split("T")[0];
        }

        const modelKey = selectedSubmodel
          ? `${item.products.brand} ${item.products.name} (${item.products.submodel})`
          : `${item.products.brand} ${item.products.name}`;

        if (!groupedData.has(timeKey)) {
          groupedData.set(timeKey, new Map());
        }

        const timeGroup = groupedData.get(timeKey)!;
        if (!timeGroup.has(modelKey)) {
          timeGroup.set(modelKey, []);
        }

        timeGroup.get(modelKey)!.push(item.price);
      });

      const sortedTimeKeys = Array.from(groupedData.keys()).sort();
      const uniqueModels = new Set<string>();
      
      data?.forEach((item) => {
        const modelKey = selectedSubmodel
          ? `${item.products.brand} ${item.products.name} (${item.products.submodel})`
          : `${item.products.brand} ${item.products.name}`;
        uniqueModels.add(modelKey);
      });

      const models = Array.from(uniqueModels);
      const labels: string[] = [];
      const datasets: any[] = models.map((model, index) => ({
        label: model,
        data: [],
        borderColor: CHART_COLORS[index % CHART_COLORS.length],
        backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      }));

      sortedTimeKeys.forEach((timeKey) => {
        labels.push(formatDateForDisplay(timeKey, groupBy));
        const timeGroup = groupedData.get(timeKey)!;

        models.forEach((model, modelIndex) => {
          const prices = timeGroup.get(model) || [];
          const avgPrice = prices.length > 0
            ? Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length)
            : null;
          datasets[modelIndex].data.push(avgPrice);
        });
      });

      // Calculate statistics
      const statistics = models.map((model) => {
        const modelData = datasets.find(d => d.label === model)?.data.filter((p: number | null) => p !== null) || [];
        
        if (modelData.length === 0) return null;

        const minPrice = Math.min(...modelData);
        const maxPrice = Math.max(...modelData);
        const avgPrice = modelData.reduce((sum: number, price: number) => sum + price, 0) / modelData.length;
        const firstPrice = modelData[0];
        const lastPrice = modelData[modelData.length - 1];
        const totalChange = ((lastPrice - firstPrice) / firstPrice) * 100;

        return {
          model,
          minPrice,
          maxPrice,
          avgPrice,
          totalChange,
          dataPoints: modelData.length
        };
      }).filter(Boolean);

      return {
        labels,
        datasets,
        models,
        statistics,
        totalDataPoints: data?.length || 0,
      };
    },
    enabled: !!(selectedBrand || selectedCategory || selectedModel),
  });

  const formatDateForDisplay = (dateKey: string, groupBy: string) => {
    const date = new Date(dateKey);
    switch (groupBy) {
      case "day":
        return date.toLocaleDateString("es-MX", {
          month: "short",
          day: "numeric",
        });
      case "week":
        return `Sem ${date.toLocaleDateString("es-MX", {
          month: "short",
          day: "numeric",
        })}`;
      case "month":
        return date.toLocaleDateString("es-MX", {
          year: "numeric",
          month: "short",
        });
      default:
        return dateKey;
    }
  };

  const getLineColor = (index: number) => {
    return CHART_COLORS[index % CHART_COLORS.length];
  };

  if (!selectedBrand && !selectedCategory && !selectedModel) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Selecciona filtros para ver evolución
          </h3>
          <p className="text-muted-foreground text-center">
            Aplica filtros de marca, categoría o modelo para visualizar la
            evolución de precios a lo largo del tiempo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolución de Precios
            </CardTitle>
            <CardDescription>
              Histórico de precios para los filtros seleccionados
              {evolutionData && (
                <span className="ml-2">
                  • {evolutionData.totalDataPoints} puntos de datos
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">1 Mes</SelectItem>
                <SelectItem value="3months">3 Meses</SelectItem>
                <SelectItem value="6months">6 Meses</SelectItem>
                <SelectItem value="1year">1 Año</SelectItem>
                <SelectItem value="2years">2 Años</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={groupBy}
              onValueChange={(value: "day" | "week" | "month") =>
                setGroupBy(value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Por Día</SelectItem>
                <SelectItem value="week">Por Semana</SelectItem>
                <SelectItem value="month">Por Mes</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              {isRefetching ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : evolutionData && evolutionData.labels.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {evolutionData.models.map((model, index) => (
                <Badge key={model} variant="outline" className="text-xs">
                  <div
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: getLineColor(index) }}
                  />
                  {model}
                </Badge>
              ))}
            </div>

            <div className="h-[400px]">
              <Line
                data={{
                  labels: evolutionData.labels,
                  datasets: evolutionData.datasets,
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
                      padding: 12,
                      cornerRadius: 8,
                      callbacks: {
                        label: (context) => {
                          return `${context.dataset.label}: ${formatPrice(context.parsed.y)}`;
                        },
                        title: (items) => `Período: ${items[0].label}`
                      }
                    }
                  },
                  scales: {
                     x: {
                      grid: { color: hslVar('--border'), lineWidth: 0.5 },
                      ticks: { 
                        color: hslVar('--foreground'),
                        font: { size: 12 },
                        maxRotation: 45,
                        minRotation: 0
                      }
                    },
                     y: {
                      grid: { color: hslVar('--border'), lineWidth: 0.5 },
                      ticks: { 
                        color: hslVar('--foreground'),
                        font: { size: 12 },
                        callback: (value) => `$${((value as number) / 1000).toFixed(0)}k`
                      }
                    }
                  },
                  interaction: {
                    mode: 'index',
                    intersect: false,
                  }
                }}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {evolutionData.statistics?.map((stat, index) => {
                if (!stat) return null;

                return (
                  <div key={stat.model} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getLineColor(index) }}
                      />
                      <h4 className="font-medium text-sm">{stat.model}</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Promedio:</span>
                        <span className="font-medium">
                          {formatPrice(stat.avgPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rango:</span>
                        <span className="font-medium">
                          {formatPrice(stat.minPrice)} - {formatPrice(stat.maxPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Cambio Total:
                        </span>
                        <span
                          className={`font-medium ${
                            stat.totalChange > 0
                              ? "text-red-500"
                              : stat.totalChange < 0
                              ? "text-green-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {stat.totalChange > 0 ? "+" : ""}
                          {stat.totalChange.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Puntos:</span>
                        <span className="font-medium">{stat.dataPoints}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No hay datos históricos
            </h3>
            <p className="text-muted-foreground text-center">
              No se encontraron datos de precios para los filtros y período
              seleccionados. Intenta ajustar los filtros o el rango de tiempo.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
