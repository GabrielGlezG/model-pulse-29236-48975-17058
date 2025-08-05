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
    foreColor: '#e2e8f0',
    fontFamily: 'Inter, system-ui, sans-serif',
    toolbar: {
      show: false,
    },
    animations: {
      enabled: true,
      speed: 600,
      animateGradually: {
        enabled: true,
        delay: 100
      }
    },
  },
  grid: {
    borderColor: '#334155',
    strokeDashArray: 2,
  },
  stroke: {
    width: 2,
  },
  xaxis: {
    axisBorder: {
      color: '#475569',
      height: 1,
    },
    axisTicks: {
      color: '#475569',
      height: 6,
    },
    labels: {
      style: {
        colors: '#94a3b8',
        fontSize: '12px',
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: '#94a3b8',
        fontSize: '12px',
      },
    },
  },
  tooltip: {
    theme: 'dark',
    style: {
      fontSize: '12px',
    },
    fillSeriesColor: false,
  },
  legend: {
    labels: {
      colors: '#e2e8f0',
    },
    fontSize: '12px',
  },
  dataLabels: {
    enabled: false,
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

// Simplified color palette for charts
export const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald  
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
]

export default ChartContainer