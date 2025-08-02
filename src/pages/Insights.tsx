import { useInsights, useMarketStats, useRecentTrends } from "@/hooks/useAnalytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Lightbulb, TrendingUp, DollarSign, BarChart3, RefreshCw, AlertTriangle, Target, Award, Zap, Users, ShoppingCart, TrendingDown, Calendar } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { Insight } from "@/types/api"

export default function Insights() {
  const { data: insights, isLoading, refetch, isRefetching } = useInsights()
  const { data: marketStats } = useMarketStats()
  const { data: recentTrends } = useRecentTrends()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const getPriorityIcon = (priority: number) => {
    if (priority === 1) return <AlertTriangle className="h-5 w-5 text-red-500" />
    if (priority === 2) return <Target className="h-5 w-5 text-orange-500" />
    if (priority === 3) return <Award className="h-5 w-5 text-yellow-500" />
    if (priority === 4) return <TrendingUp className="h-5 w-5 text-blue-500" />
    return <Lightbulb className="h-5 w-5 text-green-500" />
  }

  const getPriorityBadge = (priority: number) => {
    if (priority === 1) return <Badge variant="destructive">Crítico</Badge>
    if (priority === 2) return <Badge className="bg-orange-100 text-orange-800">Alto</Badge>
    if (priority === 3) return <Badge className="bg-yellow-100 text-yellow-800">Medio</Badge>
    if (priority === 4) return <Badge className="bg-blue-100 text-blue-800">Bajo</Badge>
    return <Badge className="bg-green-100 text-green-800">Info</Badge>
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getInsightColor = (insightType: string) => {
    switch (insightType) {
      case 'price_trend': return 'border-blue-200 bg-blue-50'
      case 'best_value': return 'border-green-200 bg-green-50'
      case 'price_max': return 'border-red-200 bg-red-50'
      case 'price_stability': return 'border-purple-200 bg-purple-50'
      case 'category_comparison': return 'border-orange-200 bg-orange-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const renderInsightData = (insight: Insight) => {
    const data = insight.data

    switch (insight.insight_type) {
      case 'price_trend':
        return (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Marca:</span>
              <span>{data.brand}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Cambio:</span>
              <span className={data.change_percent > 0 ? 'text-red-600' : 'text-green-600'}>
                {data.change_percent > 0 ? '+' : ''}{data.change_percent}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Precio actual:</span>
              <span>{formatPrice(data.current_avg)}</span>
            </div>
          </div>
        )

      case 'best_value':
        if (Array.isArray(data) && data.length > 0) {
          return (
            <div className="space-y-3">
              {data.slice(0, 3).map((item, index) => (
                <div key={index} className="p-3 bg-white rounded border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.brand} {item.model}</p>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatPrice(item.price)}</p>
                      <p className="text-xs text-green-500">-{item.savings_vs_median}% vs mediana</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        }
        return <p className="text-muted-foreground">No hay datos disponibles</p>

      case 'price_max':
        return (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Modelo:</span>
              <span>{data.brand} {data.model}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Precio:</span>
              <span className="text-red-600 font-bold">{formatPrice(data.price)}</span>
            </div>
          </div>
        )

      case 'price_stability':
        if (Array.isArray(data) && data.length > 0) {
          return (
            <div className="space-y-2">
              {data.slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.brand} {item.model}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-600">{item.stability_score}% estable</div>
                    <div className="text-xs text-muted-foreground">{formatPrice(item.avg_price)}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        }
        return <p className="text-muted-foreground">No hay datos disponibles</p>

      case 'category_comparison':
        return (
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded border border-red-200">
              <h4 className="font-medium text-red-800">Más Caro</h4>
              <p>{data.most_expensive_category?.category}</p>
              <p className="text-sm">{formatPrice(data.most_expensive_category?.avg_price || 0)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <h4 className="font-medium text-green-800">Más Accesible</h4>
              <p>{data.most_affordable_category?.category}</p>
              <p className="text-sm">{formatPrice(data.most_affordable_category?.avg_price || 0)}</p>
            </div>
          </div>
        )

      default:
        return <p className="text-muted-foreground">Datos no disponibles para visualización</p>
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Insights Automáticos</h1>
              <p className="text-muted-foreground mt-2">
                Análisis inteligente basado en los datos de precios
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => refetch()} disabled={isRefetching} className="shadow-md">
                {isRefetching ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Actualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Resumen del mercado */}
        {marketStats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass border-chart-1/20 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Total Modelos</CardTitle>
                <Users className="h-4 w-4 text-chart-1" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketStats.metrics?.total_models || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {marketStats.metrics?.total_brands || 0} marcas disponibles
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-chart-2/20 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Precio Promedio</CardTitle>
                <DollarSign className="h-4 w-4 text-chart-2" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(marketStats.metrics?.avg_price || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Mediana: {formatPrice(marketStats.metrics?.median_price || 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-chart-3/20 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Rango Total</CardTitle>
                <BarChart3 className="h-4 w-4 text-chart-3" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(marketStats.metrics?.price_range || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Min: {formatPrice(marketStats.metrics?.min_price || 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-chart-4/20 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Variabilidad</CardTitle>
                <TrendingUp className="h-4 w-4 text-chart-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(marketStats.metrics?.variation_coefficient || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Coeficiente de variación
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Insights principales */}
        {insights && insights.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight, index) => (
              <Card key={index} className={`glass shadow-lg transition-all duration-300 hover:shadow-xl ${getInsightColor(insight.insight_type)}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getPriorityIcon(insight.priority)}
                      <div>
                        <CardTitle className="text-lg leading-tight">{insight.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {insight.description}
                        </CardDescription>
                      </div>
                    </div>
                    {getPriorityBadge(insight.priority)}
                  </div>
                </CardHeader>
                <CardContent>
                  {renderInsightData(insight)}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay insights disponibles</h3>
              <p className="text-muted-foreground text-center mb-4">
                Los insights se generan automáticamente cuando hay suficientes datos.<br />
                Asegúrate de haber cargado datos de precios primero.
              </p>
              <Button onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generar Insights
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tendencias recientes */}
        {recentTrends && recentTrends.length > 0 && (
          <Card className="glass shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tendencias Recientes (Últimos 30 días)
              </CardTitle>
              <CardDescription>
                Movimientos de precios más recientes en el mercado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recentTrends.slice(0, 50)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                      formatter={(value: any, name: any, props: any) => [
                        formatPrice(Number(value)), 
                        `${props.payload.brand} - ${props.payload.productName}`
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}