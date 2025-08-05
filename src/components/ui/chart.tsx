import React from 'react'
import Chart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import { cn } from '@/lib/utils'

export interface ChartConfig {
  [key: string]: {
    label?: string
    color?: string
    icon?: React.ComponentType
  }
}

interface ChartProps {
  options: ApexOptions
  series: any[]
  type: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'treemap'
  height?: number | string
  width?: number | string
  className?: string
}

const defaultDarkTheme: Partial<ApexOptions> = {
  theme: {
    mode: 'dark',
  },
  chart: {
    background: 'transparent',
    foreColor: 'hsl(var(--foreground))',
    toolbar: {
      show: false,
    },
    animations: {
      enabled: true,
      speed: 800,
    },
  },
  grid: {
    borderColor: 'hsl(var(--border))',
    strokeDashArray: 3,
  },
  xaxis: {
    axisBorder: {
      color: 'hsl(var(--border))',
    },
    axisTicks: {
      color: 'hsl(var(--border))',
    },
    labels: {
      style: {
        colors: 'hsl(var(--muted-foreground))',
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: 'hsl(var(--muted-foreground))',
      },
    },
  },
  tooltip: {
    theme: 'dark',
    style: {
      fontSize: '12px',
    },
  },
  legend: {
    labels: {
      colors: 'hsl(var(--foreground))',
    },
  },
  dataLabels: {
    style: {
      colors: ['hsl(var(--foreground))'],
    },
  },
}

export const ChartContainer: React.FC<ChartProps> = ({
  options,
  series,
  type,
  height = 350,
  width = '100%',
  className,
}) => {
  const mergedOptions: ApexOptions = {
    ...defaultDarkTheme,
    ...options,
    chart: {
      ...defaultDarkTheme.chart,
      ...options.chart,
    },
  }

  return (
    <div className={cn('w-full', className)}>
      <Chart
        options={mergedOptions}
        series={series}
        type={type}
        height={height}
        width={width}
      />
    </div>
  )
}

// Color palette for charts
export const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
]

export default ChartContainer