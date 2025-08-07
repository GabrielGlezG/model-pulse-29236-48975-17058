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
      {/* Header Heroico */}
      <div className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-12 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    Dashboard Ejecutivo
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Inteligencia de mercado automotriz en tiempo real
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2 bg-primary/20 rounded-xl text-sm text-primary border border-primary/30 shadow-sm hover-scale">
                <span className="font-bold">{analytics?.metrics.total_models || 0}</span> modelos
              </div>
              <div className="px-4 py-2 bg-accent/20 rounded-xl text-sm text-accent border border-accent/30 shadow-sm hover-scale">
                <span className="font-bold">{analytics?.metrics.total_brands || 0}</span> marcas
              </div>
              <div className="px-4 py-2 bg-card rounded-xl text-sm border shadow-sm hover-scale">
                <span className="font-medium">{formatPrice(analytics?.metrics.avg_price || 0)}</span>
                <span className="text-muted-foreground ml-1">promedio</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Panel de Control Inteligente */}
        <Card className="glass shadow-xl border-primary/20 hover:shadow-2xl transition-all duration-300 animate-fade-in">
          <CardHeader className="pb-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shadow-lg">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">Panel de Control</CardTitle>
                  <CardDescription className="text-base">
                    Configura tus filtros para obtener insights precisos
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="animate-pulse">
                  {isRefetching ? "Actualizando..." : "En línea"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Marca</label>
                <Select value={filters.brand || "all"} onValueChange={(value) => setFilters(f => ({ ...f, brand: value === "all" ? "" : value }))}>
                  <SelectTrigger className="h-12 hover-scale transition-all duration-200">
                    <SelectValue placeholder="Todas las marcas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las marcas</SelectItem>
                    {brands?.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Categoría</label>
                <Select value={filters.category || "all"} onValueChange={(value) => setFilters(f => ({ ...f, category: value === "all" ? "" : value }))}>
                  <SelectTrigger className="h-12 hover-scale transition-all duration-200">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories?.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Modelo</label>
                <Select value={filters.model || "all"} onValueChange={(value) => setFilters(f => ({ ...f, model: value === "all" ? "" : value }))}>
                  <SelectTrigger className="h-12 hover-scale transition-all duration-200">
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
              </div>

              <div className="flex flex-col justify-end">
                <Button 
                  onClick={() => refetch()} 
                  disabled={isRefetching}
                  size="lg"
                  className="h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 hover-scale"
                >
                  {isRefetching ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Actualizar Datos
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas Ejecutivas */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Métricas Clave</h2>
              <p className="text-muted-foreground">Resumen ejecutivo del mercado</p>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* Métricas principales */}
            <Card className="glass border-chart-1/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-fade-in group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Modelos</CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-chart-1/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Package className="h-5 w-5" style={{ color: 'hsl(var(--chart-1))' }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-foreground mb-2">{analytics.metrics.total_models}</div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {analytics.metrics.total_brands} marcas
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-chart-2/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-fade-in group" style={{ animationDelay: '100ms' }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Precio Promedio</CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-chart-2/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-5 w-5" style={{ color: 'hsl(var(--chart-2))' }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-foreground mb-2">{formatPrice(analytics.metrics.avg_price)}</div>
                <div className="flex items-center gap-2">
                  <Badge variant={analytics.metrics.variation_coefficient > 30 ? "destructive" : "default"} className="text-xs">
                    CV: {analytics.metrics.variation_coefficient.toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-chart-3/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-fade-in group" style={{ animationDelay: '200ms' }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Precio Mediano</CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-chart-3/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-5 w-5" style={{ color: 'hsl(var(--chart-3))' }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-foreground mb-2">{formatPrice(analytics.metrics.median_price)}</div>
                <p className="text-xs text-muted-foreground">Valor central del mercado</p>
              </CardContent>
            </Card>

            <Card className="glass border-chart-4/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-fade-in group" style={{ animationDelay: '300ms' }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Rango de Precios</CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-chart-4/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-5 w-5" style={{ color: 'hsl(var(--chart-4))' }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-foreground mb-2">{formatPrice(analytics.metrics.price_range)}</div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Min: {formatPrice(analytics.metrics.min_price)}</p>
                  <p className="text-xs text-muted-foreground">Max: {formatPrice(analytics.metrics.max_price)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Métricas adicionales */}
            <Card className="glass border-chart-5/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-fade-in group" style={{ animationDelay: '400ms' }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Última Actualización</CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-chart-5/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CalendarIcon className="h-5 w-5" style={{ color: 'hsl(var(--chart-5))' }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg font-bold text-foreground mb-2">
                  {analytics.metrics.current_scraping_date ? 
                    new Date(analytics.metrics.current_scraping_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'N/A'}
                </div>
                <Badge variant="outline" className="text-xs">
                  {analytics.metrics.total_scraping_sessions || 0} sesiones
                </Badge>
              </CardContent>
            </Card>

            <Card className="glass border-chart-6/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-fade-in group" style={{ animationDelay: '500ms' }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Datos Históricos</CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-chart-6/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-5 w-5" style={{ color: 'hsl(var(--chart-6))' }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-foreground mb-2">
                  {analytics.historical_data ? analytics.historical_data.length : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {filters.model ? `Puntos para ${filters.model}` : 'Selecciona modelo'}
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-chart-7/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-fade-in group" style={{ animationDelay: '600ms' }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Cuartiles</CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-chart-7/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-5 w-5" style={{ color: 'hsl(var(--chart-7))' }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  <div className="text-lg font-bold text-foreground">Q1: {formatPrice(analytics.metrics.lower_quartile)}</div>
                  <div className="text-sm text-muted-foreground">Q3: {formatPrice(analytics.metrics.upper_quartile)}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-chart-8/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-fade-in group" style={{ animationDelay: '700ms' }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Variabilidad</CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-chart-8/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {analytics.metrics.variation_coefficient > 50 ? (
                      <AlertTriangle className="h-5 w-5" style={{ color: 'hsl(var(--chart-8))' }} />
                    ) : (
                      <Award className="h-5 w-5" style={{ color: 'hsl(var(--chart-8))' }} />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-foreground mb-2">
                  {analytics.metrics.variation_coefficient > 50 ? 'Alta' : 
                   analytics.metrics.variation_coefficient > 25 ? 'Media' : 'Baja'}
                </div>
                <Badge 
                  variant={analytics.metrics.variation_coefficient > 50 ? "destructive" : 
                           analytics.metrics.variation_coefficient > 25 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {analytics.metrics.variation_coefficient.toFixed(1)}% CV
                </Badge>
              </CardContent>
            </Card>
          </div>
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
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
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
                    formatter={(value: number, name: string, props: any) => [
                      `${value} modelos`, 
                      `${props.payload.category} (${((value / (analytics.chart_data?.models_by_category?.reduce((sum, item) => sum + item.count, 0) || 1)) * 100).toFixed(1)}%)`
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
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
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
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
                    labelFormatter={(label) => `Categoría: ${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
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
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
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