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
    color: 'hsl(var(--muted-foreground) / 0.5)',
  },
  forecastUsage: {
    label: 'Forecasted Usage',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function UsageChart({ data }: UsageChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
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
            tickMargin={8}
            domain={['dataMin - 20', 'dataMax + 20']}
            tickFormatter={(value) => `${value} GWh`}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="usage"
            type="natural"
            fill={chartConfig.usage.color}
            stroke={chartConfig.usage.color}
            stackId="a"
          />
          <Area
            dataKey="forecastUsage"
            type="natural"
            fill={chartConfig.forecastUsage.color}
            stroke={chartConfig.forecastUsage.color}
            stackId="a"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
