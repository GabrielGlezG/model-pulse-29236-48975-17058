import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Lightbulb, TrendingUp, DollarSign, BarChart3, RefreshCw, AlertTriangle } from "lucide-react"

interface Insight {
  insight_type: string
  title: string
  description: string
  data: any
  priority: number
}

export default function Insights() {
  const { data: insights, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-insights')
      
      if (error) throw error
      return data.insights as Insight[]
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'price_trend':
        return <TrendingUp className="h-5 w-5" />
      case 'price_max':
        return <DollarSign className="h-5 w-5" />
      case 'price_stability':
        return <BarChart3 className="h-5 w-5" />
      default:
        return <Lightbulb className="h-5 w-5" />
    }
  }

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return <Badge className="bg-red-100 text-red-800">Alta Prioridad</Badge>
      case 2:
        return <Badge className="bg-yellow-100 text-yellow-800">Media Prioridad</Badge>
      case 3:
        return <Badge variant="secondary">Baja Prioridad</Badge>
      default:
        return <Badge variant="outline">Sin Prioridad</Badge>
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const renderInsightData = (insight: Insight) => {
    switch (insight.insight_type) {
      case 'price_trend':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Marca:</span>
              <span>{insight.data.brand}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Cambio:</span>
              <span className={`font-bold ${insight.data.change_percent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {insight.data.change_percent > 0 ? '+' : ''}{insight.data.change_percent}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Precio Actual:</span>
              <span>{formatPrice(insight.data.current_avg)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Precio Anterior:</span>
              <span>{formatPrice(insight.data.previous_avg)}</span>
            </div>
          </div>
        )

      case 'price_max':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Marca:</span>
              <span>{insight.data.brand}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Modelo:</span>
              <span>{insight.data.model}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Nombre:</span>
              <span>{insight.data.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Precio:</span>
              <span className="text-2xl font-bold text-red-600">
                {formatPrice(insight.data.price)}
              </span>
            </div>
          </div>
        )

      case 'price_stability':
        if (Array.isArray(insight.data)) {
          return (
            <div className="space-y-4">
              {insight.data.map((item: any, index: number) => (
                <div key={index} className="p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{item.brand} {item.model}</span>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estabilidad:</span>
                    <span className="text-sm font-medium">{item.stability_score}% variación</span>
                  </div>
                </div>
              ))}
            </div>
          )
        }
        return <div>Datos no disponibles</div>

      default:
        return <pre className="text-sm bg-muted p-2 rounded">{JSON.stringify(insight.data, null, 2)}</pre>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insights Automáticos</h1>
          <p className="text-muted-foreground">
            Análisis inteligente basado en los datos de precios
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isRefetching}>
          {isRefetching ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Actualizar
        </Button>
      </div>

      {insights && insights.length > 0 ? (
        <div className="space-y-4">
          {insights
            .sort((a, b) => a.priority - b.priority)
            .map((insight, index) => (
              <Card key={index} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
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
                <CardContent>
                  {renderInsightData(insight)}
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
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
    </div>
  )
}