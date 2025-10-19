export type ChartDataPoint = {
    date: string;
    usage?: number;
    forecastUsage?: number;
};
  
export type ForecastResult = {
    state: string;
    lat: number;
    lon: number;
    predictionDate: string;
    predictedUsage: number;
    model: string;
    modelReason: string;
    summary: string;
    chartData: ChartDataPoint[];
};
