'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Legend,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

interface UsageChartProps {
  data: {
    date: string;
    usage?: number;
    forecastUsage?: number;
  }[];
}

const chartConfig = {
  usage: {
    label: 'Historical Usage',
    color: 'hsl(var(--chart-1))',
  },
  forecastUsage: {
    label: 'Forecasted Usage',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function UsageChart({ data }: UsageChartProps) {
  // Sort data by date to ensure chronological order
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  // Separate historical and forecast data for better visualization
  const { historicalData, forecastData } = React.useMemo(() => {
    const historical = sortedData.filter(item => item.usage !== undefined);
    const forecast = sortedData.filter(item => item.forecastUsage !== undefined);
    return { historicalData: historical, forecastData: forecast };
  }, [sortedData]);

  // Find the transition point between historical and forecast data
  const transitionIndex = React.useMemo(() => {
    return sortedData.findIndex((item, index) => {
      const hasHistorical = item.usage !== undefined;
      const hasForecast = item.forecastUsage !== undefined;
      return hasForecast && !hasHistorical;
    });
  }, [sortedData]);

  // Prepare a small dataset to draw the connecting line between historical and forecast:
  // it contains a single numeric field "transitionValue" set only at the two points to connect.
  const transitionLineData = React.useMemo(() => {
    if (transitionIndex <= 0) return null;
    return sortedData.map((item, idx) => {
      if (idx === transitionIndex - 1) return { ...item, transitionValue: item.usage ?? null };
      if (idx === transitionIndex) return { ...item, transitionValue: item.forecastUsage ?? null };
      return { ...item, transitionValue: null };
    });
  }, [sortedData, transitionIndex]);

  // Compute Y domain with a 8% buffer to prevent lines from touching the top/bottom
  const yValues = sortedData.flatMap(d => [d.usage ?? null, d.forecastUsage ?? null]).filter(Boolean) as number[];
  const yMin = yValues.length ? Math.min(...yValues) : 0;
  const yMax = yValues.length ? Math.max(...yValues) : 100;
  const buffer = Math.max(5, (yMax - yMin) * 0.08);


  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <ResponsiveContainer>
        <AreaChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            fontSize={12}
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight={500}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            fontSize={12}
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight={500}
            domain={['dataMin - 20', 'dataMax + 20']}
            tickFormatter={(value) => `${value} GWh`}
          />
          <Tooltip 
            content={<ChartTooltipContent />}
            contentStyle={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
            }}
          />
          <Legend 
            wrapperStyle={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
            }}
          />
          
          {/* Historical data area */}
          <Area
            dataKey="usage"
            type="monotone"
            fill="url(#historicalGradient)"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            fillOpacity={0.3}
            connectNulls={false}
          />
          
          {/* Forecast data area */}
          <Area
            dataKey="forecastUsage"
            type="monotone"
            fill="url(#forecastGradient)"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            strokeDasharray="5 5"
            fillOpacity={0.3}
            connectNulls={false}
          />
          
          {/* Transition line to connect historical and forecast */}
          {transitionLineData && (
            <Line
              data={transitionLineData}
              dataKey="transitionValue"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
          )}
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
