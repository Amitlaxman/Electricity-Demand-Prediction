'use server';

/**
 * @fileOverview Implements a smart model selection flow that automatically chooses the most suitable prediction model.
 *
 * - smartModelSelection - A function that selects the most suitable prediction model based on location, historical data, and date for prediction.
 * - SmartModelSelectionInput - The input type for the smartModelSelection function.
 * - SmartModelSelectionOutput - The return type for the smartModelSelection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartModelSelectionInputSchema = z.object({
  state: z.string().describe('The state for which to predict usage.'),
  lat: z.number().describe('The latitude of the location.'),
  lon: z.number().describe('The longitude of the location.'),
  predictionDate: z.string().describe('The date for which to predict usage (YYYY-MM-DD).'),
});
export type SmartModelSelectionInput = z.infer<typeof SmartModelSelectionInputSchema>;

const SmartModelSelectionOutputSchema = z.object({
  model: z.string().describe('The selected prediction model (ARIMA, Prophet, LSTM, or XGBoost).'),
  reason: z.string().describe('The reason for selecting the chosen model.'),
});
export type SmartModelSelectionOutput = z.infer<typeof SmartModelSelectionOutputSchema>;

export async function smartModelSelection(input: SmartModelSelectionInput): Promise<SmartModelSelectionOutput> {
  return smartModelSelectionFlow(input);
}

const smartModelSelectionPrompt = ai.definePrompt({
  name: 'smartModelSelectionPrompt',
  input: {schema: SmartModelSelectionInputSchema},
  output: {schema: SmartModelSelectionOutputSchema},
  prompt: `You are an expert in time-series forecasting. Based on the provided location, historical data availability, and prediction date, recommend the most suitable prediction model (ARIMA, Prophet, LSTM, or XGBoost). Explain your reasoning for choosing the selected model.

Location (State): {{{state}}}
Latitude: {{{lat}}}
Longitude: {{{lon}}}
Prediction Date: {{{predictionDate}}}

Consider the following factors when selecting the model:

*   ARIMA: Suitable for stationary time series data with clear autocorrelation patterns.
*   Prophet: Designed for time series data with strong seasonality and trend components.
*   LSTM: Effective for capturing complex, non-linear dependencies in the data.
*   XGBoost: Can handle non-linear relationships and interactions between variables.

Historical data is available from 2020-01-01 to the day before the prediction date. Model suitability depends on the nature of historical data and the forecasting date; for example, if there's a sharp local usage anomaly in the past, LSTM may be preferred, but if the usage is expected to be simply trending upward without any anomaly, ARIMA might work better.

Return your response in JSON format.

{{output schema=SmartModelSelectionOutputSchema}}`,
});

const smartModelSelectionFlow = ai.defineFlow(
  {
    name: 'smartModelSelectionFlow',
    inputSchema: SmartModelSelectionInputSchema,
    outputSchema: SmartModelSelectionOutputSchema,
  },
  async input => {
    const {output} = await smartModelSelectionPrompt(input);
    return output!;
  }
);

