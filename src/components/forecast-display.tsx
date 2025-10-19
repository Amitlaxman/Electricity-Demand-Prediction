'use client';

import * as React from 'react';
import { Bot, LineChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsageChart } from '@/components/usage-chart';
import type { ForecastResult } from '@/lib/definitions';
import { format } from 'date-fns';

interface ForecastDisplayProps {
  result: ForecastResult;
}

export function ForecastDisplay({ result }: ForecastDisplayProps) {
  const formattedDate = format(new Date(result.predictionDate), 'MMMM do, yyyy');

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-primary">{result.predictedUsage.toFixed(2)} GWh</CardTitle>
          <CardDescription>
            Predicted usage for {result.state} on {formattedDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-3">
                <Bot className="h-5 w-5 flex-shrink-0 text-accent" />
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold text-accent-foreground/80">AI Summary</p>
                    <p className="text-sm text-muted-foreground">{result.summary}</p>
                </div>
            </div>
          <div className="text-xs text-muted-foreground">
            Model used: <span className="font-semibold text-foreground">{result.model}</span>. {result.modelReason}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
            <div className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Usage Forecast</CardTitle>
            </div>
          <CardDescription>Historical and forecasted energy usage.</CardDescription>
        </CardHeader>
        <CardContent>
          <UsageChart data={result.chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
