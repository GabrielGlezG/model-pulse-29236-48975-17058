import { useState } from "react"
import { useAnalytics } from "@/hooks/useAnalytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, DollarSign, Package, TrendingUp, BarChart3, RefreshCw, Target, Award, AlertTriangle } from "lucide-react"
import { ChartContainer, CHART_COLORS } from '@/components/ui/chart'
import { ApexOptions } from 'apexcharts'

export default function Dashboard() {
  const [selectedFilters, setSelectedFilters] = useState({
    timeRange: "7d",
    category: "",
    priceRange: ""
  })

  const { data: analytics, isLoading, refetch, isRefetching } = useAnalytics(selectedFilters)

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Hero Header with Professional Gradient */}
        <div className="relative overflow-hidden rounded-2xl glass p-8 lg:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  MP
                </h1>
                <p className="text-sm text-muted-foreground font-medium">ModelPulse Analytics</p>
              </div>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Inteligencia de Mercado Automotriz
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
              Análisis avanzado de precios, tendencias y oportunidades de negocio en tiempo real
            </p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="glass animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <CardHeader className="space-y-3">
                <div className="h-6 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted/60 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getStatCards = () => [
    {
      title: "Inventario Total",
      value: analytics?.total_products?.toLocaleString() || "0",
      icon: Package,
      description: "Productos activos",
      trend: analytics?.product_growth || 0,
      color: "chart-1"
    },
    {
      title: "Valor Promedio",
      value: formatPrice(analytics?.average_price || 0),
      icon: DollarSign,
      description: "Precio medio del mercado",
      trend: analytics?.price_trend || 0,
      color: "chart-2"
    },
    {
      title: "Marcas Activas",
      value: analytics?.total_brands?.toString() || "0",
      icon: Award,
      description: "Marcas en el portafolio",
      trend: analytics?.brand_diversity || 0,
      color: "chart-3"
    },
    {
      title: "Oportunidades",
      value: analytics?.market_opportunities?.toString() || "10",
      icon: Target,
      description: "Señales de inversión",
      trend: 5.2,
      color: "chart-4"
    }
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Executive Hero Section */}
      <div className="relative overflow-hidden rounded-2xl glass p-8 lg:p-12 shadow-2xl border border-primary/10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/2 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgMzJMMzIgME04IDAgTDMyIDI0TTAgOEwyNCAyNCIgc3Ryb2tlPSIjRjBGMEYwIiBzdHJva2Utb3BhY2l0eT0iMC4wMiIvPgo8L3N2Zz4K')]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur">
              <BarChart3 className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent tracking-tight">
                MP
              </h1>
              <p className="text-sm text-muted-foreground font-semibold tracking-wide uppercase">ModelPulse Analytics</p>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Inteligencia de Mercado
                <span className="block text-primary">Automotriz</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Análisis avanzado de precios, tendencias y oportunidades de negocio 
                <span className="font-semibold text-foreground"> en tiempo real</span>
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics Avanzado
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-primary/20">
                <Target className="h-4 w-4 mr-2" />
                IA Predictiva
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-chart-3/20">
                <TrendingUp className="h-4 w-4 mr-2" />
                Tiempo Real
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Control Panel */}
      <Card className="glass shadow-lg border-primary/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Panel de Control Ejecutivo</CardTitle>
                <CardDescription>Configuración inteligente de análisis</CardDescription>
              </div>
            </div>
            <Button 
              onClick={() => refetch()} 
              disabled={isRefetching}
              className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover-scale shadow-lg"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Período de Análisis</label>
              <Select value={selectedFilters.timeRange} onValueChange={(value) => 
                setSelectedFilters(prev => ({ ...prev, timeRange: value }))
              }>
                <SelectTrigger className="bg-background/50 border-border/50 hover:border-primary/30 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                  <SelectItem value="90d">Últimos 3 meses</SelectItem>
                  <SelectItem value="1y">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Categoría</label>
              <Select value={selectedFilters.category} onValueChange={(value) => 
                setSelectedFilters(prev => ({ ...prev, category: value }))
              }>
                <SelectTrigger className="bg-background/50 border-border/50 hover:border-primary/30 transition-colors">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las categorías</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="Sedan">Sedán</SelectItem>
                  <SelectItem value="Hatchback">Hatchback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Rango de Precio</label>
              <Select value={selectedFilters.priceRange} onValueChange={(value) => 
                setSelectedFilters(prev => ({ ...prev, priceRange: value }))
              }>
                <SelectTrigger className="bg-background/50 border-border/50 hover:border-primary/30 transition-colors">
                  <SelectValue placeholder="Todos los precios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los precios</SelectItem>
                  <SelectItem value="0-20000000">Hasta $20M</SelectItem>
                  <SelectItem value="20000000-50000000">$20M - $50M</SelectItem>
                  <SelectItem value="50000000+">Más de $50M</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Executive Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {getStatCards().map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={stat.title} className="glass shadow-lg hover-scale transition-all duration-300 border-border/50 hover:border-primary/20 group animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-medium">{stat.title}</CardDescription>
                  <div className={`p-2 rounded-lg bg-${stat.color}/10 group-hover:bg-${stat.color}/20 transition-colors`}>
                    <IconComponent className="h-5 w-5" style={{ color: `hsl(var(--${stat.color}))` }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={stat.trend >= 0 ? "default" : "destructive"} 
                    className="text-xs font-medium"
                  >
                    {stat.trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                    {formatPercent(stat.trend)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Enhanced Charts Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Price Analysis by Brand */}
        <Card className="glass shadow-lg border-chart-1/20">
          <CardHeader>
            <CardTitle className="text-xl">Precios Promedio por Marca</CardTitle>
            <CardDescription>Comparación de precios entre marcas con tendencias</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              type="bar"
              series={[{
                name: 'Precio Promedio',
                data: (analytics.chart_data?.prices_by_brand || []).map(item => ({
                  x: item.brand,
                  y: item.avg_price
                }))
              }]}
              options={{
                colors: CHART_COLORS,
                plotOptions: {
                  bar: {
                    borderRadius: 4,
                    horizontal: false,
                  }
                },
                xaxis: {
                  categories: (analytics.chart_data?.prices_by_brand || []).map(item => item.brand),
                  labels: {
                    rotate: -45,
                  }
                },
                yaxis: {
                  title: {
                    text: 'Precio Promedio'
                  },
                  labels: {
                    formatter: function (val) {
                      return '$' + (val / 1000000).toFixed(1) + 'M'
                    }
                  }
                }
              } as ApexOptions}
            />
          </CardContent>
        </Card>

        {/* Price Distribution */}
        <Card className="glass shadow-lg border-chart-2/20">
          <CardHeader>
            <CardTitle className="text-xl">Distribución por Rango de Precio</CardTitle>
            <CardDescription>Segmentación del inventario por rangos de precio</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              type="donut"
              series={[10, 25, 35, 20, 10]}
              options={{
                colors: CHART_COLORS,
                labels: ['Hasta $20M', '$20M-$30M', '$30M-$50M', '$50M-$80M', 'Más de $80M'],
                plotOptions: {
                  pie: {
                    donut: {
                      size: '60%',
                      labels: {
                        show: true,
                        total: {
                          show: true,
                          label: 'Total'
                        }
                      }
                    }
                  }
                },
                legend: {
                  position: 'bottom'
                }
              } as ApexOptions}
            />
          </CardContent>
        </Card>

        {/* Historical Trends */}
        <Card className="glass shadow-lg border-chart-3/20 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Evolución Histórica de Precios</CardTitle>
            <CardDescription>Tendencias temporales del mercado automotriz</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              type="line"
              series={[{
                name: 'Precio Promedio',
                data: (analytics.historical_data || []).map(item => ({
                  x: item.date,
                  y: item.price
                }))
              }]}
              options={{
                colors: [CHART_COLORS[0]],
                stroke: {
                  width: 3,
                  curve: 'smooth'
                },
                markers: {
                  size: 4,
                  strokeWidth: 2,
                  hover: {
                    size: 6
                  }
                },
                xaxis: {
                  type: 'datetime',
                  title: {
                    text: 'Fecha'
                  }
                },
                yaxis: {
                  title: {
                    text: 'Precio Promedio'
                  },
                  labels: {
                    formatter: function (val) {
                      return '$' + (val / 1000000).toFixed(1) + 'M'
                    }
                  }
                }
              } as ApexOptions}
              height={400}
            />
          </CardContent>
        </Card>

        {/* Category Analysis */}
        <Card className="glass shadow-lg border-chart-4/20">
          <CardHeader>
            <CardTitle className="text-xl">Productos por Categoría</CardTitle>
            <CardDescription>Distribución del inventario por tipo de vehículo</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              type="bar"
              series={[{
                name: 'Cantidad de Productos',
                data: (analytics.chart_data?.prices_by_category || []).map(item => ({
                  x: item.category,
                  y: item.count
                }))
              }]}
              options={{
                colors: [CHART_COLORS[1]],
                plotOptions: {
                  bar: {
                    borderRadius: 4,
                    horizontal: false,
                  }
                },
                xaxis: {
                  categories: (analytics.chart_data?.prices_by_category || []).map(item => item.category),
                  labels: {
                    rotate: -45,
                  }
                },
                yaxis: {
                  title: {
                    text: 'Cantidad de Productos'
                  }
                }
              } as ApexOptions}
            />
          </CardContent>
        </Card>

        {/* Brand Portfolio */}
        <Card className="glass shadow-lg border-chart-5/20">
          <CardHeader>
            <CardTitle className="text-xl">Portafolio de Marcas</CardTitle>
            <CardDescription>Participación de mercado por marca</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              type="donut"
              series={(analytics.chart_data?.prices_by_brand || []).map(item => item.count)}
              options={{
                colors: CHART_COLORS,
                labels: (analytics.chart_data?.prices_by_brand || []).map(item => item.brand),
                plotOptions: {
                  pie: {
                    donut: {
                      size: '50%',
                      labels: {
                        show: true,
                        total: {
                          show: true,
                          label: 'Total Productos'
                        }
                      }
                    }
                  }
                },
                legend: {
                  position: 'bottom'
                }
              } as ApexOptions}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}