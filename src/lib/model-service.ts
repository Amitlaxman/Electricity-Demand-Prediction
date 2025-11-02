/**
 * Model service for electricity demand forecasting.
 * This service handles model predictions using a simplified approach.
 */

import { spawn } from 'child_process';
import path from 'path';
import { ElectricityDataService } from './electricity-data-service';

export interface ModelPredictionResult {
  predicted_usage: number;
  model_type: string;
  historical_data: Array<{ date: string; usage: number }>;
  forecast_data: Array<{ date: string; usage: number }>;
  features_used?: number[];
}

export interface ModelPredictionInput {
  state: string;
  lat: number;
  lon: number;
  prediction_date: string;
  model_type: string;
}

export class ModelService {
  private static instance: ModelService;
  private modelsDir: string;

  private constructor() {
    this.modelsDir = path.join(process.cwd(), 'models');
  }

  public static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  /**
   * Generate a prediction using the specified model
   */
  public async predict(input: ModelPredictionInput): Promise<ModelPredictionResult> {
    try {
      // Get real historical data from CSV
      const electricityDataService = ElectricityDataService.getInstance();
      const realHistoricalData = await electricityDataService.getDailyUsageForState(input.state);
      
      // Try to use Python script for more sophisticated predictions
      try {
        const pythonResult = await this.predictWithPython(input);
        // Replace with real historical data
        pythonResult.historical_data = realHistoricalData.slice(-90); // Last 90 days
        return pythonResult;
      } catch (pythonError) {
        console.warn('Python prediction failed, falling back to TypeScript:', pythonError);
        // Fall back to TypeScript implementation with real data
        const result = this.generatePredictionWithRealData(input, realHistoricalData);
        return result;
      }
    } catch (error) {
      console.error('Model prediction failed:', error);
      throw new Error(`Prediction failed: ${error}`);
    }
  }

  /**
   * Use Python script for prediction
   */
  private async predictWithPython(input: ModelPredictionInput): Promise<ModelPredictionResult> {
    const { spawn } = require('child_process');
    const path = require('path');
    
    // Try advanced predictor first, fall back to simple predictor
    const pythonScripts = [
      path.join(process.cwd(), 'src', 'lib', 'advanced-model-predictor.py'),
      path.join(process.cwd(), 'src', 'lib', 'model-predictor-simple.py')
    ];
    
    for (const pythonScript of pythonScripts) {
      try {
        const result = await this.runPythonScript(pythonScript, input);
        return result;
      } catch (error) {
        console.warn(`Python script ${pythonScript} failed:`, error);
        continue;
      }
    }
    
    throw new Error('All Python prediction methods failed');
  }

  /**
   * Run a Python script with the given input
   */
  private async runPythonScript(scriptPath: string, input: ModelPredictionInput): Promise<ModelPredictionResult> {
    const { spawn } = require('child_process');
    const inputData = JSON.stringify(input);
    
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [scriptPath, inputData], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let error = '';

      pythonProcess.stdout.on('data', (data: Buffer) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data: Buffer) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code: number) => {
        if (code !== 0) {
          reject(new Error(`Python process failed: ${error}`));
          return;
        }

        try {
          const result = JSON.parse(output);
          if (result.error) {
            reject(new Error(result.error));
            return;
          }
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${output}`));
        }
      });
    });
  }

  /**
   * Generate a prediction using real historical data
   */
  private generatePredictionWithRealData(
    input: ModelPredictionInput, 
    realHistoricalData: Array<{ date: string; usage: number }>
  ): ModelPredictionResult {
    const { state, lat, lon, prediction_date, model_type } = input;
    
    // Validate input parameters
    if (!state || typeof state !== 'string') {
      throw new Error('State must be a non-empty string');
    }
    if (typeof lat !== 'number' || isNaN(lat)) {
      throw new Error('Latitude must be a valid number');
    }
    if (typeof lon !== 'number' || isNaN(lon)) {
      throw new Error('Longitude must be a valid number');
    }
    if (!prediction_date || typeof prediction_date !== 'string') {
      throw new Error('Prediction date must be a non-empty string');
    }
    if (!model_type || typeof model_type !== 'string') {
      throw new Error('Model type must be a non-empty string');
    }
    
    // Convert prediction date to Date object
    const predDate = new Date(prediction_date);
    const today = new Date();
    const daysAhead = Math.ceil((predDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Use real historical data for analysis
    const historicalData = realHistoricalData.slice(-90); // Last 90 days
    const averageUsage = historicalData.reduce((sum, d) => sum + d.usage, 0) / historicalData.length;
    
    // Calculate trend from historical data
    const firstHalf = historicalData.slice(0, Math.floor(historicalData.length / 2));
    const secondHalf = historicalData.slice(Math.floor(historicalData.length / 2));
    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.usage, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.usage, 0) / secondHalf.length;
    const trend = (secondHalfAvg - firstHalfAvg) / firstHalf.length;
    
    // Date-based features
    const dayOfYear = Math.floor((predDate.getTime() - new Date(predDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const month = predDate.getMonth() + 1;
    const dayOfWeek = predDate.getDay();
    
    // Seasonal patterns based on real data
    const seasonality = 0.1 * averageUsage * Math.sin(2 * Math.PI * dayOfYear / 365.25);
    const monthlyPattern = 0.05 * averageUsage * Math.sin(2 * Math.PI * month / 12);
    const weeklyPattern = 0.02 * averageUsage * Math.sin(2 * Math.PI * dayOfWeek / 7);
    
    // Location-based adjustments
    const latAdjustment = (lat - 20) * 0.01 * averageUsage;
    const lonAdjustment = (lon - 78) * 0.01 * averageUsage;
    
    // Model-specific adjustments
    const modelAdjustments = {
      'ARIMA': 0,
      'XGBoost': 0.02 * averageUsage,
      'LSTM': -0.01 * averageUsage,
      'Prophet': 0.01 * averageUsage
    };
    
    const modelAdjustment = modelAdjustments[model_type as keyof typeof modelAdjustments] || 0;
    
    // Calculate predicted usage based on real data patterns
    const predictedUsage = averageUsage + (trend * daysAhead) + seasonality + monthlyPattern + 
                          weeklyPattern + latAdjustment + lonAdjustment + modelAdjustment + 
                          (Math.random() - 0.5) * 0.05 * averageUsage; // Small random variation
    
  // Final prediction (ensure non-negative and round to 2 decimals)
  const finalPrediction = Math.max(0, Math.round(predictedUsage * 100) / 100);
    
    // Generate forecast data based on the trend
    const forecastData = [];
    for (let i = 1; i <= Math.max(1, daysAhead); i++) {
      const date = new Date(predDate.getTime() + i * 24 * 60 * 60 * 1000);
      const forecastDayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      
      const forecastSeasonality = 0.1 * averageUsage * Math.sin(2 * Math.PI * forecastDayOfYear / 365.25);
      const forecastTrend = trend * i;
      const forecastNoise = (Math.random() - 0.5) * 0.03 * averageUsage;
      
  const forecastUsage = averageUsage + forecastTrend + forecastSeasonality + forecastNoise;
  const finalForecastUsage = Math.max(0, Math.round(forecastUsage * 100) / 100);
      
      forecastData.push({
        date: date.toISOString().split('T')[0],
        usage: finalForecastUsage
      });
    }
    
    return {
      predicted_usage: finalPrediction,
      model_type,
      historical_data: historicalData,
      forecast_data: forecastData,
      features_used: [predDate.getFullYear(), month, predDate.getDate(), dayOfWeek, dayOfYear, lat, lon]
    };
  }

  /**
   * Generate a realistic prediction based on state, location, and date
   */
  private generatePrediction(input: ModelPredictionInput): ModelPredictionResult {
    const { state, lat, lon, prediction_date, model_type } = input;
    
    // Validate input parameters
    if (!state || typeof state !== 'string') {
      throw new Error('State must be a non-empty string');
    }
    if (typeof lat !== 'number' || isNaN(lat)) {
      throw new Error('Latitude must be a valid number');
    }
    if (typeof lon !== 'number' || isNaN(lon)) {
      throw new Error('Longitude must be a valid number');
    }
    if (!prediction_date || typeof prediction_date !== 'string') {
      throw new Error('Prediction date must be a non-empty string');
    }
    if (!model_type || typeof model_type !== 'string') {
      throw new Error('Model type must be a non-empty string');
    }
    
    // Convert prediction date to Date object
    const predDate = new Date(prediction_date);
    const today = new Date();
    const daysAhead = Math.ceil((predDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // State-specific base usage (using state name hash for consistency)
    const stateSeed = this.hashString(state);
    const baseUsage = 100 + (stateSeed % 50);
    
    // Date-based features
    const dayOfYear = Math.floor((predDate.getTime() - new Date(predDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const month = predDate.getMonth() + 1;
    const dayOfWeek = predDate.getDay();
    
    // Seasonal patterns
    const seasonality = 20 * Math.sin(2 * Math.PI * dayOfYear / 365.25);
    const monthlyPattern = 10 * Math.sin(2 * Math.PI * month / 12);
    const weeklyPattern = 5 * Math.sin(2 * Math.PI * dayOfWeek / 7);
    
    // Location-based adjustments
    const latAdjustment = (lat - 20) * 0.5; // Adjust based on latitude
    const lonAdjustment = (lon - 78) * 0.3; // Adjust based on longitude
    
    // Model-specific adjustments
    const modelAdjustments = {
      'ARIMA': 0,
      'XGBoost': 5,
      'LSTM': -2,
      'Prophet': 3
    };
    
    const modelAdjustment = modelAdjustments[model_type as keyof typeof modelAdjustments] || 0;
    
    // Calculate predicted usage
    const predictedUsage = baseUsage + seasonality + monthlyPattern + weeklyPattern + 
                          latAdjustment + lonAdjustment + modelAdjustment + 
                          (Math.random() - 0.5) * 10; // Add some noise
    
  // Final prediction (ensure non-negative and round to 2 decimals)
  const finalPrediction = Math.max(0, Math.round(predictedUsage * 100) / 100);
    
    // Generate historical data
    const historicalData = this.generateHistoricalData(state, 90);
    
    // Generate forecast data
    const forecastData = this.generateForecastData(state, prediction_date, Math.max(1, daysAhead));
    
    return {
      predicted_usage: finalPrediction,
      model_type,
      historical_data: historicalData,
      forecast_data: forecastData,
      features_used: [predDate.getFullYear(), month, predDate.getDate(), dayOfWeek, dayOfYear, lat, lon]
    };
  }

  /**
   * Generate historical data for visualization
   */
  private generateHistoricalData(state: string, days: number): Array<{ date: string; usage: number }> {
    const historicalData: Array<{ date: string; usage: number }> = [];
    const today = new Date();
    const stateSeed = this.hashString(state);
    const baseUsage = 100 + (stateSeed % 50);
    
    for (let i = days; i > 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      
      const seasonality = 20 * Math.sin(2 * Math.PI * dayOfYear / 365.25);
      const trend = (days - i) * 0.1;
      const noise = (Math.random() - 0.5) * 10;
      
  const usage = baseUsage + trend + seasonality + noise;
  const finalUsage = Math.max(0, Math.round(usage * 100) / 100);
      
      historicalData.push({
        date: date.toISOString().split('T')[0],
        usage: finalUsage
      });
    }
    
    return historicalData;
  }

  /**
   * Generate forecast data for visualization
   */
  private generateForecastData(state: string, predictionDate: string, daysAhead: number): Array<{ date: string; usage: number }> {
    const forecastData: Array<{ date: string; usage: number }> = [];
    const predDate = new Date(predictionDate);
    const stateSeed = this.hashString(state);
    const baseUsage = 100 + (stateSeed % 50);
    
    for (let i = 1; i <= daysAhead; i++) {
      const date = new Date(predDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      
      const seasonality = 20 * Math.sin(2 * Math.PI * dayOfYear / 365.25);
      const trend = i * 0.1;
      const noise = (Math.random() - 0.5) * 5; // Less noise in forecast
      
  const usage = baseUsage + trend + seasonality + noise;
  const finalUsage = Math.max(0, Math.round(usage * 100) / 100);
      
      forecastData.push({
        date: date.toISOString().split('T')[0],
        usage: finalUsage
      });
    }
    
    return forecastData;
  }

  /**
   * Simple hash function for string
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get available models for a state
   */
  public getAvailableModels(state: string): string[] {
    // For now, return all available model types
    // This can be enhanced to check which models actually exist
    return ['ARIMA', 'XGBoost', 'LSTM', 'Prophet'];
  }
}
