'use server';

/**
 * @fileOverview Enhances a forecast with a summary explaining key influencing factors.
 *
 * - enhanceForecastWithSummary - A function that enhances a forecast with a summary.
 * - EnhanceForecastWithSummaryInput - The input type for the enhanceForecastWithSummary function.
 * - EnhanceForecastWithSummaryOutput - The return type for the enhanceForecastWithSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceForecastWithSummaryInputSchema = z.object({
  forecast: z.array(
    z.object({
      date: z.string().describe('The date of the forecast.'),
      usage: z.number().describe('The predicted usage for the date.'),
    })
  ).describe('The forecast data.'),
  location: z.string().describe('The location for which the forecast is made.'),
  model: z.string().describe('The model used to generate the forecast.'),
  historicalData: z.array(
    z.object({
      date: z.string().describe('The date of the historical data.'),
      usage: z.number().describe('The usage for the date.'),
    })
  ).optional().describe('Historical usage data for the location.'),
});
export type EnhanceForecastWithSummaryInput = z.infer<typeof EnhanceForecastWithSummaryInputSchema>;

const EnhanceForecastWithSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the key factors influencing the forecast.'),
  forecast: z.array(
    z.object({
      date: z.string().describe('The date of the forecast.'),
      usage: z.number().describe('The predicted usage for the date.'),
    })
  ).describe('The forecast data.'),
});
export type EnhanceForecastWithSummaryOutput = z.infer<typeof EnhanceForecastWithSummaryOutputSchema>;

export async function enhanceForecastWithSummary(input: EnhanceForecastWithSummaryInput): Promise<EnhanceForecastWithSummaryOutput> {
  return enhanceForecastWithSummaryFlow(input);
}

const enhanceForecastWithSummaryPrompt = ai.definePrompt({
  name: 'enhanceForecastWithSummaryPrompt',
  input: {schema: EnhanceForecastWithSummaryInputSchema},
  output: {schema: EnhanceForecastWithSummaryOutputSchema},
  prompt: `You are an expert at explaining forecasts.

  You will be given a forecast, the location of the forecast, the model used to generate the forecast, and optional historical data.  If historical data is present, use it to identify seasonal trends and recent events that may be influencing the forecast.  If historical data is not present, focus on the model and location in generating the forecast.

  Create a concise summary of the key factors influencing the forecast. 

  Forecast:
  {{#each forecast}}
  - Date: {{date}}, Usage: {{usage}}
  {{/each}}

  Location: {{location}}
  Model: {{model}}

  {{#if historicalData}}
  Historical Data:
  {{#each historicalData}}
  - Date: {{date}}, Usage: {{usage}}
  {{/each}}
  {{/if}}

  Summary:`,
});

const enhanceForecastWithSummaryFlow = ai.defineFlow(
  {
    name: 'enhanceForecastWithSummaryFlow',
    inputSchema: EnhanceForecastWithSummaryInputSchema,
    outputSchema: EnhanceForecastWithSummaryOutputSchema,
  },
  async input => {
    const {output} = await enhanceForecastWithSummaryPrompt(input);
    return {
      summary: output!.summary,
      forecast: input.forecast,
    };
  }
);
