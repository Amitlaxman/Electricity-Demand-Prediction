import { NextRequest, NextResponse } from 'next/server';
import { ModelService } from '@/lib/model-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { state, lat, lon, predictionDate, model } = body;

    // Validate required fields
    if (!state || !lat || !lon || !predictionDate || !model) {
      return NextResponse.json(
        { error: 'Missing required fields: state, lat, lon, predictionDate, model' },
        { status: 400 }
      );
    }

    // Get model service instance
    const modelService = ModelService.getInstance();

    // Make prediction
    const result = await modelService.predict({
      state,
      lat,
      lon,
      prediction_date: predictionDate,
      model_type: model
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
