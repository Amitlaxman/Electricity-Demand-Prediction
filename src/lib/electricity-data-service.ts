/**
 * Electricity Data Service
 * Handles loading and processing of the electricity usage CSV data
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export interface ElectricityDataPoint {
  state: string;
  region: string;
  latitude: number;
  longitude: number;
  date: string;
  usage: number;
}

export interface StateHistoricalData {
  state: string;
  data: ElectricityDataPoint[];
  totalUsage: number;
  averageUsage: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export class ElectricityDataService {
  private static instance: ElectricityDataService;
  private data: ElectricityDataPoint[] = [];
  private dataLoaded = false;

  private constructor() {}

  public static getInstance(): ElectricityDataService {
    if (!ElectricityDataService.instance) {
      ElectricityDataService.instance = new ElectricityDataService();
    }
    return ElectricityDataService.instance;
  }

  /**
   * Load electricity data from CSV file
   */
  public async loadData(): Promise<ElectricityDataPoint[]> {
    if (this.dataLoaded) {
      return this.data;
    }

    try {
      const csvPath = path.join(process.cwd(), 'electricity.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      this.data = records.map((record: any) => ({
        state: record.States,
        region: record.Regions,
        latitude: parseFloat(record.latitude),
        longitude: parseFloat(record.longitude),
        date: this.parseDate(record.Dates),
        usage: parseFloat(record.Usage),
      }));

      this.dataLoaded = true;
      console.log(`Loaded ${this.data.length} electricity data points`);
      return this.data;
    } catch (error) {
      console.error('Failed to load electricity data:', error);
      return [];
    }
  }

  /**
   * Parse date string to ISO format
   */
  private parseDate(dateStr: string): string {
    try {
      // Handle format: "02/01/2019 00:00:00"
      const [datePart] = dateStr.split(' ');
      const [month, day, year] = datePart.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    } catch (error) {
      console.error('Failed to parse date:', dateStr, error);
      return dateStr;
    }
  }

  /**
   * Get historical data for a specific state
   */
  public async getStateHistoricalData(state: string): Promise<StateHistoricalData | null> {
    await this.loadData();
    
    const stateData = this.data.filter(point => 
      this.normalizeStateName(point.state) === this.normalizeStateName(state)
    );

    if (stateData.length === 0) {
      return null;
    }

    // Sort by date
    stateData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalUsage = stateData.reduce((sum, point) => sum + point.usage, 0);
    const averageUsage = totalUsage / stateData.length;

    return {
      state: state,
      data: stateData,
      totalUsage,
      averageUsage,
      dateRange: {
        start: stateData[0].date,
        end: stateData[stateData.length - 1].date,
      },
    };
  }

  /**
   * Get data points for a specific state and date range
   */
  public async getStateDataForDateRange(
    state: string, 
    startDate: string, 
    endDate: string
  ): Promise<ElectricityDataPoint[]> {
    await this.loadData();
    
    const stateData = this.data.filter(point => 
      this.normalizeStateName(point.state) === this.normalizeStateName(state) &&
      point.date >= startDate &&
      point.date <= endDate
    );

    return stateData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Get the latest data point for a state
   */
  public async getLatestStateData(state: string): Promise<ElectricityDataPoint | null> {
    await this.loadData();
    
    const stateData = this.data.filter(point => 
      this.normalizeStateName(point.state) === this.normalizeStateName(state)
    );

    if (stateData.length === 0) {
      return null;
    }

    // Sort by date and get the latest
    stateData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return stateData[0];
  }

  /**
   * Get aggregated daily usage for a state
   */
  public async getDailyUsageForState(state: string): Promise<{ date: string; usage: number }[]> {
    await this.loadData();
    
    const stateData = this.data.filter(point => 
      this.normalizeStateName(point.state) === this.normalizeStateName(state)
    );

    // Group by date and sum usage
    const dailyUsage = new Map<string, number>();
    
    stateData.forEach(point => {
      const currentUsage = dailyUsage.get(point.date) || 0;
      dailyUsage.set(point.date, currentUsage + point.usage);
    });

    // Convert to array and sort by date
    const result = Array.from(dailyUsage.entries())
      .map(([date, usage]) => ({ date, usage }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return result;
  }

  /**
   * Get all available states
   */
  public async getAvailableStates(): Promise<string[]> {
    await this.loadData();
    
    const states = new Set(this.data.map(point => point.state));
    return Array.from(states).sort();
  }

  /**
   * Get data statistics
   */
  public async getDataStatistics(): Promise<{
    totalRecords: number;
    dateRange: { start: string; end: string };
    states: number;
    regions: number;
  }> {
    await this.loadData();
    
    const dates = this.data.map(point => point.date).sort();
    const states = new Set(this.data.map(point => point.state));
    const regions = new Set(this.data.map(point => point.region));

    return {
      totalRecords: this.data.length,
      dateRange: {
        start: dates[0],
        end: dates[dates.length - 1],
      },
      states: states.size,
      regions: regions.size,
    };
  }

  /**
   * Normalize state names for comparison
   */
  private normalizeStateName(state: string): string {
    return state.toLowerCase().trim();
  }

  /**
   * Get data for chart display (last 90 days + forecast)
   */
  public async getChartDataForState(state: string, forecastData: { date: string; usage: number }[]): Promise<{
    historicalData: { date: string; usage: number }[];
    forecastData: { date: string; usage: number }[];
  }> {
    const dailyUsage = await this.getDailyUsageForState(state);
    
    // Get the last 90 days of historical data
    const last90Days = dailyUsage.slice(-90);
    
    return {
      historicalData: last90Days,
      forecastData: forecastData,
    };
  }
}
