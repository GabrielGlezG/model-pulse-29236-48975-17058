import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { CalendarIcon, DollarSign, Package, TrendingUp, BarChart3, RefreshCw, Target, Award, AlertTriangle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, Legend } from 'recharts'
import { useState } from "react"
import { useAnalytics } from "@/hooks/useAnalytics"
import { useBrands, useCategories, useModels } from "@/hooks/useProducts"
import { AnalyticsData } from "@/types/api"


const COLORS = [
  'hsl(var(--chart-1))', 
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))', 
  'hsl(var(--chart-6))', 
  'hsl(var(--chart-7))', 
  'hsl(var(--chart-8))',
  'hsl(var(--chart-9))', 
  'hsl(var(--chart-10))', 
  'hsl(var(--chart-11))', 
  'hsl(var(--chart-12))'
]

export default function Dashboard() {
  const [filters, setFilters] = useState({
    brand: '',
    category: '',
    model: '',
    date_from: '',
    date_to: ''
  })
  const [brandPage, setBrandPage] = useState(1)
  const [brandPageSize, setBrandPageSize] = useState(10)

  const { data: analytics, isLoading, refetch, isRefetching } = useAnalytics(filters)
  const { data: brands } = useBrands()
  const { data: categories } = useCategories()
  const { data: models } = useModels(filters.brand, filters.category)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No hay datos disponibles para mostrar</p>
            <p className="text-sm text-muted-foreground mt-2">
              Sube archivos JSON desde la página de Upload para comenzar el análisis
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header con gradiente */}
      <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard de Análisis</h1>
              <p className="text-muted-foreground mt-2">
                Análisis inteligente de precios de vehículos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-primary/20 rounded-full text-sm text-primary border border-primary/30">
                {analytics?.metrics.total_models || 0} modelos
              </div>
              <div className="px-3 py-1 bg-secondary/80 rounded-full text-sm text-secondary-foreground">
                {analytics?.metrics.total_brands || 0} marcas
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Filtros mejorados */}
        <Card className="glass shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Filtros de Análisis</CardTitle>
                <CardDescription>
                  Personaliza la vista de datos según tus necesidades
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="responsive-grid lg:grid-cols-3 xl:grid-cols-4">
              <Select value={filters.brand || "all"} onValueChange={(value) => setFilters(f => ({ ...f, brand: value === "all" ? "" : value }))}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Todas las marcas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las marcas</SelectItem>
                  {brands?.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.category || "all"} onValueChange={(value) => setFilters(f => ({ ...f, category: value === "all" ? "" : value }))}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories?.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.model || "all"} onValueChange={(value) => setFilters(f => ({ ...f, model: value === "all" ? "" : value }))}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Todos los modelos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los modelos</SelectItem>
                  {models?.map(model => (
                    <SelectItem key={`${model.brand}-${model.model}`} value={model.model}>
                      {model.brand} {model.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                onClick={() => refetch()} 
                disabled={isRefetching}
                className="h-11 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isRefetching ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Métricas principales con diseño tipo dashboard */}
        <div className="responsive-grid lg:grid-cols-4 xl:grid-cols-4">
          <Card className="glass border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Total Modelos</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-chart-1/30 flex items-center justify-center">
                <Package className="h-4 w-4" style={{ color: 'hsl(var(--chart-1))' }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{analytics.metrics.total_models}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.metrics.total_brands} marcas
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-chart-2/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Precio Promedio</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-chart-2/30 flex items-center justify-center">
                <DollarSign className="h-4 w-4" style={{ color: 'hsl(var(--chart-2))' }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatPrice(analytics.metrics.avg_price)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                CV: {analytics.metrics.variation_coefficient.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-chart-3/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Precio Mediano</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-chart-3/30 flex items-center justify-center">
                <Target className="h-4 w-4" style={{ color: 'hsl(var(--chart-3))' }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatPrice(analytics.metrics.median_price)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Valor central
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-chart-4/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Rango de Precios</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-chart-4/30 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" style={{ color: 'hsl(var(--chart-4))' }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">{formatPrice(analytics.metrics.price_range)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatPrice(analytics.metrics.min_price)} - {formatPrice(analytics.metrics.max_price)}
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-chart-5/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Última Actualización</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-chart-5/30 flex items-center justify-center">
                <CalendarIcon className="h-4 w-4" style={{ color: 'hsl(var(--chart-5))' }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-foreground">
                {analytics.metrics.current_scraping_date ? 
                  new Date(analytics.metrics.current_scraping_date).toLocaleDateString() : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.metrics.total_scraping_sessions || 0} sesiones
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-chart-6/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Datos Históricos</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-chart-6/30 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" style={{ color: 'hsl(var(--chart-6))' }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {analytics.historical_data ? analytics.historical_data.length : 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {filters.model ? `Puntos para ${filters.model}` : 'Selecciona modelo'}
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-chart-7/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Q1 - Q3</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-chart-7/30 flex items-center justify-center">
                <BarChart3 className="h-4 w-4" style={{ color: 'hsl(var(--chart-7))' }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-foreground">
                {formatPrice(analytics.metrics.lower_quartile)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatPrice(analytics.metrics.upper_quartile)}
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-chart-8/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Variabilidad</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-chart-8/30 flex items-center justify-center">
                {analytics.metrics.variation_coefficient > 50 ? (
                  <AlertTriangle className="h-4 w-4" style={{ color: 'hsl(var(--chart-8))' }} />
                ) : (
                  <Award className="h-4 w-4" style={{ color: 'hsl(var(--chart-8))' }} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {analytics.metrics.variation_coefficient > 50 ? 'Alta' : 
                 analytics.metrics.variation_coefficient > 25 ? 'Media' : 'Baja'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.metrics.variation_coefficient.toFixed(1)}% coef.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos mejorados */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="glass shadow-lg border-chart-1/20">
            <CardHeader>
              <CardTitle className="text-xl">Precios Promedio por Marca</CardTitle>
              <CardDescription>Comparación de precios entre marcas con tendencias</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analytics.chart_data?.prices_by_brand || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="brand" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    yAxisId="left"
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) => `${value.toFixed(0)}%`}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'avg_price' ? formatPrice(value) : `${value.toFixed(1)}%`,
                      name === 'avg_price' ? 'Precio Promedio' : 'Tendencia'
                    ]}
                    labelFormatter={(label) => `Marca: ${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="avg_price" yAxisId="left" radius={[4, 4, 0, 0]}>
                    {(analytics.chart_data?.prices_by_brand || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass shadow-lg border-chart-2/20">
            <CardHeader>
              <CardTitle className="text-xl">Modelos por Categoría</CardTitle>
              <CardDescription>Distribución de modelos por tipo de vehículo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={analytics.chart_data?.models_by_category || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(analytics.chart_data?.models_by_category || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Precios por Modelo */}
        {analytics.historical_data && analytics.historical_data.length > 0 && (
          <Card className="glass shadow-lg border-chart-3/20">
            <CardHeader>
              <CardTitle className="text-xl">Evolución de Precios del Modelo Seleccionado</CardTitle>
              <CardDescription>
                Histórico de precios para el modelo {filters.model}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.historical_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatPrice(value), 'Precio']}
                    labelFormatter={(value) => `Fecha: ${new Date(value).toLocaleDateString()}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--chart-1))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Análisis Comparativo por Categorías */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="glass shadow-lg border-chart-4/20">
            <CardHeader>
              <CardTitle className="text-xl">Precios por Categoría</CardTitle>
              <CardDescription>Comparación de rangos de precio por tipo de vehículo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analytics.chart_data?.prices_by_category || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="category" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatPrice(value), 
                      name === 'avg_price' ? 'Promedio' : 
                      name === 'min_price' ? 'Mínimo' : 'Máximo'
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="min_price" fill="hsl(var(--chart-7))" name="min_price" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avg_price" fill="hsl(var(--chart-1))" name="avg_price" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="max_price" fill="hsl(var(--chart-5))" name="max_price" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass shadow-lg border-chart-6/20">
            <CardHeader>
              <CardTitle className="text-xl">Distribución por Rango de Precio</CardTitle>
              <CardDescription>Cantidad de modelos en cada segmento de mercado</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={analytics.chart_data?.price_distribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={100}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(analytics.chart_data?.price_distribution || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => [
                      `${value} modelos`, 
                      `${props.payload.range} (${((value / (analytics.chart_data?.price_distribution?.reduce((sum, item) => sum + item.count, 0) || 1)) * 100).toFixed(1)}%)`
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Legend 
                    formatter={(value: any, entry: any) => {
                      return `${entry.payload?.range || 'N/A'}: ${entry.payload?.count || 0} modelos`
                    }}
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: 'hsl(var(--foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Modelos destacados */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          <Card className="glass shadow-lg border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-green-500" />
                Mejores Oportunidades
              </CardTitle>
              <CardDescription>Modelos con mejor relación calidad-precio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(analytics.chart_data?.best_value_models || []).map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{item.brand} {item.name}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        <Badge variant="secondary" className="text-xs text-green-600">-{item.value_rating}%</Badge>
                      </div>
                    </div>
                    <p className="font-bold text-green-500 text-sm">{formatPrice(item.price)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass shadow-lg border-chart-8/20">
            <CardHeader>
              <CardTitle className="text-lg">Top 5 Más Caros</CardTitle>
              <CardDescription>Los modelos con precios más altos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(analytics.chart_data?.top_5_expensive || []).map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{item.brand} {item.name}</p>
                      <Badge variant="secondary" className="text-xs mt-1">#{index + 1}</Badge>
                    </div>
                    <p className="font-bold text-sm">{formatPrice(item.price)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass shadow-lg border-chart-2/20">
            <CardHeader>
              <CardTitle className="text-lg">Top 5 Más Económicos</CardTitle>
              <CardDescription>Los modelos con mejores precios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(analytics.chart_data?.bottom_5_cheap || []).map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{item.brand} {item.name}</p>
                      <Badge variant="outline" className="text-xs mt-1">#{index + 1}</Badge>
                    </div>
                    <p className="font-bold text-green-500 text-sm">{formatPrice(item.price)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análisis de Competitividad por Marca */}
        <Card className="glass shadow-lg border-chart-9/20">
          <CardHeader>
            <CardTitle className="text-xl">Análisis de Competitividad por Marca</CardTitle>
            <CardDescription>Comparación de precios, rangos y posicionamiento de valor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {(analytics.chart_data?.prices_by_brand || [])
                .slice((brandPage - 1) * brandPageSize, brandPage * brandPageSize)
                .map((brand, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-lg text-foreground">{brand.brand}</h4>
                      <Badge variant={brand.value_score < -10 ? "default" : brand.value_score > 10 ? "destructive" : "secondary"}>
                        {brand.value_score < -10 ? "Buen Valor" : brand.value_score > 10 ? "Premium" : "Estándar"}
                      </Badge>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Promedio: {formatPrice(brand.avg_price)}</span>
                      <span>Rango: {formatPrice(brand.min_price)} - {formatPrice(brand.max_price)}</span>
                      <span>{brand.count} modelos</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">Score de Valor</p>
                    <p className={`text-xl font-bold ${
                      brand.value_score < -10 ? 'text-green-500' : 
                      brand.value_score > 10 ? 'text-red-500' : 'text-yellow-500'
                    }`}>
                      {brand.value_score > 0 ? '+' : ''}{brand.value_score.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {analytics.chart_data?.prices_by_brand && analytics.chart_data.prices_by_brand.length > brandPageSize && (
              <PaginationControls
                currentPage={brandPage}
                totalPages={Math.ceil(analytics.chart_data.prices_by_brand.length / brandPageSize)}
                pageSize={brandPageSize}
                total={analytics.chart_data.prices_by_brand.length}
                onPageChange={setBrandPage}
                onPageSizeChange={setBrandPageSize}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>

        {/* Información de filtros aplicados */}
        {analytics.applied_filters && Object.values(analytics.applied_filters).some(Boolean) && (
          <Card className="glass shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Filtros Aplicados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {analytics.applied_filters?.brand && (
                  <Badge className="bg-chart-1/20 text-chart-1 border-chart-1/30">Marca: {analytics.applied_filters.brand}</Badge>
                )}
                {analytics.applied_filters?.category && (
                  <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30">Categoría: {analytics.applied_filters.category}</Badge>
                )}
                {analytics.applied_filters?.model && (
                  <Badge className="bg-chart-3/20 text-chart-3 border-chart-3/30">Modelo: {analytics.applied_filters.model}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}