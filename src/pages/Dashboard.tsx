import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, DollarSign, Package, TrendingUp, BarChart3, RefreshCw } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { useState } from "react"

interface AnalyticsData {
  metrics: {
    total_models: number
    total_brands: number
    avg_price: number
    min_price: number
    max_price: number
    price_std_dev: number
  }
  chart_data: {
    prices_by_brand: Array<{brand: string, avg_price: number, count: number}>
    models_by_category: Array<{category: string, count: number}>
    top_5_expensive: Array<{name: string, brand: string, price: number}>
    bottom_5_cheap: Array<{name: string, brand: string, price: number}>
  }
  historical_data?: Array<{date: string, price: number}>
  applied_filters: {
    brand?: string
    category?: string
    model?: string
    date_from?: string
    date_to?: string
  }
  generated_at: string
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))']

export default function Dashboard() {
  const [filters, setFilters] = useState({
    brand: '',
    category: '',
    model: '',
    date_from: '',
    date_to: ''
  })

  const { data: analytics, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['analytics', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      
      const { data, error } = await supabase.functions.invoke('get-analytics', {
        body: { params: params.toString() }
      })
      
      if (error) throw error
      return data as AnalyticsData
    }
  })

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('brand')
        .order('brand')
      
      if (error) throw error
      return [...new Set(data.map(p => p.brand))]
    }
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .order('category')
      
      if (error) throw error
      return [...new Set(data.map(p => p.category))]
    }
  })

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
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Filtros de Análisis
          </CardTitle>
          <CardDescription>
            Aplica filtros para personalizar el análisis de datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            <Select value={filters.brand} onValueChange={(value) => setFilters(f => ({ ...f, brand: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las marcas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las marcas</SelectItem>
                {brands?.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => setFilters(f => ({ ...f, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las categorías</SelectItem>
                {categories?.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={() => refetch()} 
              disabled={isRefetching}
              className="w-full"
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

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modelos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.metrics.total_models}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.metrics.total_brands} marcas diferentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(analytics.metrics.avg_price)}</div>
            <p className="text-xs text-muted-foreground">
              Desviación: ±{formatPrice(analytics.metrics.price_std_dev)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Mínimo</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(analytics.metrics.min_price)}</div>
            <p className="text-xs text-muted-foreground">
              Modelo más económico
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Máximo</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(analytics.metrics.max_price)}</div>
            <p className="text-xs text-muted-foreground">
              Modelo más caro
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Precios Promedio por Marca</CardTitle>
            <CardDescription>Comparación de precios entre marcas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.chart_data?.prices_by_brand || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="brand" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [formatPrice(value), 'Precio Promedio']} />
                <Bar dataKey="avg_price" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modelos por Categoría</CardTitle>
            <CardDescription>Distribución de modelos por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.chart_data?.models_by_category || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(analytics.chart_data?.models_by_category || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top modelos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Más Caros</CardTitle>
            <CardDescription>Los modelos con precios más altos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(analytics.chart_data?.top_5_expensive || []).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.brand} {item.name}</p>
                    <Badge variant="secondary">#{index + 1}</Badge>
                  </div>
                  <p className="font-bold">{formatPrice(item.price)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Más Económicos</CardTitle>
            <CardDescription>Los modelos con mejores precios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(analytics.chart_data?.bottom_5_cheap || []).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.brand} {item.name}</p>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                  <p className="font-bold text-green-600">{formatPrice(item.price)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información de filtros aplicados */}
      {analytics.applied_filters && Object.values(analytics.applied_filters).some(Boolean) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Filtros Aplicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {analytics.applied_filters?.brand && (
                <Badge>Marca: {analytics.applied_filters.brand}</Badge>
              )}
              {analytics.applied_filters?.category && (
                <Badge>Categoría: {analytics.applied_filters.category}</Badge>
              )}
              {analytics.applied_filters?.model && (
                <Badge>Modelo: {analytics.applied_filters.model}</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}