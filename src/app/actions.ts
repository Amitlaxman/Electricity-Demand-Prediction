'use server';

import { z } from 'zod';
import { enhanceForecastWithSummary } from '@/ai/flows/enhance-forecast-with-summary';
import { smartModelSelection } from '@/ai/flows/smart-model-selection';
import type { ForecastResult } from '@/lib/definitions';
import { addDays, differenceInDays, format, subDays } from 'date-fns';

const FormSchema = z.object({
  state: z.string().min(1, 'Please select a state from the map.'),
  lat: z.coerce.number(),
  lon: z.coerce.number(),
  predictionDate: z.date({ required_error: 'Please select a prediction date.' }),
  model: z.string(),
});

export type State = {
  errors?: {
    state?: string[];
    lat?: string[];
    lon?: string[];
    predictionDate?: string[];
    model?: string[];
    server?: string[];
  };
  data?: ForecastResult;
};

// Mock function to generate time-series data
const generateTimeSeriesData = (days: number, daysAhead: number, state: string) => {
  const historicalData: { date: string; usage: number }[] = [];
  const forecastData: { date: string; usage: number }[] = [];
  const today = new Date();
  
  // A seed based on the state name to make the data consistent for a given state
  const stateSeed = state.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const baseUsage = 100 + (stateSeed % 50);
  const trend = 0.1;
  const seasonalityAmplitude = 20 + (stateSeed % 10);

  // Generate historical data
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dayOfYear = parseInt(format(date, 'D'));
    const seasonality = seasonalityAmplitude * Math.sin((dayOfYear / 365.25) * 2 * Math.PI);
    const noise = (Math.random() - 0.5) * 10;
    const usage = baseUsage + (days - i) * trend + seasonality + noise;
    historicalData.push({
      date: format(date, 'yyyy-MM-dd'),
      usage: Math.max(0, parseFloat(usage.toFixed(2))),
    });
  }

  // Generate forecast data
  for (let i = 1; i <= daysAhead; i++) {
    const date = addDays(today, i);
    const dayOfYear = parseInt(format(date, 'D'));
    const seasonality = seasonalityAmplitude * Math.sin((dayOfYear / 365.25) * 2 * Math.PI);
    const noise = (Math.random() - 0.5) * 5; // Less noise in forecast
    const usage = baseUsage + (days + i) * trend + seasonality + noise;
    forecastData.push({
      date: format(date, 'yyyy-MM-dd'),
      usage: Math.max(0, parseFloat(usage.toFixed(2))),
    });
  }

  return { historicalData, forecastData };
};


export async function getPrediction(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = FormSchema.safeParse({
    state: formData.get('state'),
    lat: formData.get('lat'),
    lon: formData.get('lon'),
    predictionDate: new Date(formData.get('predictionDate') as string),
    model: formData.get('model'),
  });
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { state, lat, lon, predictionDate, model: initialModel } = validatedFields.data;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysAhead = differenceInDays(predictionDate, today);

    if (daysAhead <= 0) {
      return {
        errors: {
          predictionDate: ['Prediction date must be in the future.'],
        },
      };
    }

    let selectedModel = initialModel;
    let modelReason = 'User selected model.';

    if (initialModel === 'Auto') {
      const modelSelection = await smartModelSelection({
        state,
        lat,
        lon,
        predictionDate: format(predictionDate, 'yyyy-MM-dd'),
      });
      selectedModel = modelSelection.model;
      modelReason = modelSelection.reason;
    }

    const { historicalData, forecastData } = generateTimeSeriesData(90, daysAhead, state);
    const predictedUsage = forecastData.find(d => d.date === format(predictionDate, 'yyyy-MM-dd'))?.usage;
    
    if (predictedUsage === undefined) {
      throw new Error('Could not generate prediction for the selected date.');
    }

    const { summary } = await enhanceForecastWithSummary({
      forecast: forecastData,
      location: state,
      model: selectedModel,
      historicalData: historicalData,
    });
    
    return {
      data: {
        state: state,
        lat: lat,
        lon: lon,
        predictionDate: format(predictionDate, 'yyyy-MM-dd'),
        predictedUsage: predictedUsage,
        model: selectedModel,
        modelReason: modelReason,
        summary,
        chartData: [...historicalData, ...forecastData.map(d => ({...d, forecastUsage: d.usage}))],
      }
    };

  } catch (error) {
    console.error('Prediction failed:', error);
    return {
      errors: {
        server: ['An unexpected error occurred. Please try again.'],
      },
    };
  }
}
