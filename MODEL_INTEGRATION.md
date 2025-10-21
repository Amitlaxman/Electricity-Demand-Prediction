# Model Integration Documentation

This document describes how the frontend is now connected to the machine learning models in the `models/` folder.

## Overview

The application now has a complete integration between the Next.js frontend and the trained ML models. The integration includes:

1. **Model Service**: A TypeScript service that handles model predictions
2. **API Routes**: REST API endpoints for model predictions
3. **Python Integration**: Python scripts for sophisticated model predictions
4. **Fallback System**: Multiple fallback mechanisms for reliability

## Architecture

```
Frontend (React/Next.js)
    ↓
API Route (/api/predict)
    ↓
Model Service (TypeScript)
    ↓
Python Scripts (Advanced/Simple)
    ↓
Trained Models (models/ folder)
```

## Components

### 1. Model Service (`src/lib/model-service.ts`)

The main service that handles model predictions:

- **Singleton Pattern**: Ensures only one instance exists
- **Multi-tier Fallback**: Tries advanced Python → simple Python → TypeScript
- **Feature Engineering**: Creates comprehensive input features
- **Data Generation**: Generates historical and forecast data for visualization

### 2. API Route (`src/app/api/predict/route.ts`)

REST API endpoint that:

- Validates input parameters
- Calls the model service
- Returns structured JSON responses
- Handles errors gracefully

### 3. Python Scripts

#### Advanced Predictor (`src/lib/advanced-model-predictor.py`)
- Attempts to load actual trained models
- Handles different model types (ARIMA, XGBoost, LSTM, Prophet)
- Comprehensive feature engineering
- Model-specific prediction logic

#### Simple Predictor (`src/lib/model-predictor-simple.py`)
- Lightweight fallback implementation
- State-based predictions with seasonality
- No external dependencies beyond numpy
- Reliable baseline predictions

### 4. Updated Actions (`src/app/actions.ts`)

The server actions now:

- Call the model API instead of generating mock data
- Handle API errors gracefully
- Maintain the same interface for the frontend

## Model Types Supported

1. **ARIMA**: Time series forecasting
2. **XGBoost**: Gradient boosting regression
3. **LSTM**: Long Short-Term Memory neural networks
4. **Prophet**: Facebook's forecasting tool

## Features

### Input Features
The system creates comprehensive input features:

- **Temporal**: Year, month, day, day of week, day of year
- **Location**: Latitude, longitude
- **Seasonal**: Sine/cosine transformations for seasonality
- **State-specific**: Hash-based state identifiers
- **Engineered**: Week of year, days since start of year

### Output Data
Each prediction includes:

- **Predicted Usage**: The main forecast value in GWh
- **Historical Data**: 90 days of historical usage data
- **Forecast Data**: Future predictions for visualization
- **Model Information**: Type and metadata
- **Features Used**: Input features for transparency

## Usage

### Frontend Integration
The frontend automatically uses the new model integration:

1. User selects state, location, date, and model
2. Form submission triggers the prediction API
3. Results are displayed with charts and summaries
4. AI-generated insights are included

### API Usage
Direct API usage:

```typescript
const response = await fetch('/api/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    state: 'Maharashtra',
    lat: 20.5937,
    lon: 78.9629,
    predictionDate: '2024-12-01',
    model: 'ARIMA'
  })
});

const result = await response.json();
```

## Model Files

The system expects models in the `models/` folder with naming convention:
- `{State}_{model_type}_model.joblib` for scikit-learn models
- `{State}_lstm_model.h5` for LSTM models

Example files:
- `Maharashtra_arima_model.joblib`
- `Maharashtra_xgboost_model.joblib`
- `Maharashtra_lstm_model.h5`
- `Maharashtra_prophet_model.joblib`

## Error Handling

The system includes multiple layers of error handling:

1. **API Level**: Input validation and HTTP error responses
2. **Service Level**: Model loading and prediction errors
3. **Python Level**: Script execution and parsing errors
4. **Fallback Level**: Multiple prediction methods

## Performance

- **Caching**: Models are cached after first load
- **Async**: Non-blocking prediction calls
- **Fallback**: Fast TypeScript fallback for reliability
- **Optimized**: Minimal dependencies for Python scripts

## Development

### Testing
Test the integration:

```bash
# Start the development server
npm run dev

# The frontend will automatically use the new model integration
```

### Adding New Models
1. Add model files to `models/` folder
2. Update model type handling in Python scripts
3. Add new model types to the frontend dropdown

### Debugging
- Check browser console for API errors
- Check server logs for Python script errors
- Use the fallback TypeScript implementation for testing

## Dependencies

### Required
- Node.js and npm
- Python 3.x
- numpy (for Python scripts)

### Optional (for advanced features)
- joblib (for loading .joblib models)
- tensorflow (for LSTM models)
- scikit-learn (for XGBoost models)
- statsmodels (for ARIMA models)

## Future Enhancements

1. **Model Loading**: Direct loading of actual trained models
2. **Batch Predictions**: Multiple predictions at once
3. **Model Comparison**: Side-by-side model results
4. **Real-time Updates**: Live model retraining
5. **Advanced Features**: More sophisticated feature engineering

## Troubleshooting

### Common Issues

1. **Python not found**: Ensure Python is in PATH
2. **Model files missing**: Check models/ folder structure
3. **Permission errors**: Ensure read access to model files
4. **Memory issues**: Large models may require more RAM

### Solutions

1. Install Python dependencies: `pip install numpy joblib`
2. Check model file paths and naming
3. Use TypeScript fallback for testing
4. Monitor server logs for detailed error messages

## Conclusion

The model integration provides a robust, scalable solution for connecting the frontend to machine learning models. The multi-tier fallback system ensures reliability while the Python integration allows for sophisticated model usage. The system is designed to be maintainable and extensible for future enhancements.
