# How to Run and Test the Full Application

This guide will help you run and test the complete electricity demand prediction application with model integration.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Python 3.x (for model predictions)

### 2. Installation
```bash
# Navigate to the project directory
cd "D:\Energy dmnd india\Electricity-Demand-Prediction"

# Install dependencies
npm install

# Install Python dependencies (optional, for advanced features)
pip install numpy joblib
```

### 3. Start the Development Server
```bash
npm run dev
```

The application will start on `http://localhost:3000` (or port 9002 as configured).

## 🧪 Testing the Application

### 1. Basic Functionality Test

1. **Open the Application**
   - Navigate to `http://localhost:3000`
   - You should see the IndiaForecaster interface with a map and sidebar

2. **Select a Location**
   - Click on any state on the map
   - The coordinates should update in the sidebar
   - The state dropdown should show the selected state

3. **Set Prediction Date**
   - Click on the date picker
   - Select a future date (at least 1 day ahead)
   - The date should be properly formatted

4. **Choose a Model**
   - Select from: Auto, ARIMA, XGBoost, LSTM, or Prophet
   - "Auto" will use AI to select the best model

5. **Get Prediction**
   - Click "Get Forecast" button
   - You should see a loading state
   - Results should appear in the forecast panel

### 2. Expected Results

When you click "Get Forecast", you should see:

- **Predicted Usage**: A number in GWh (e.g., "98.73 GWh")
- **AI Summary**: An intelligent summary of the forecast
- **Model Information**: Which model was used and why
- **Chart**: Historical and forecast data visualization
- **Location Details**: State, coordinates, and prediction date

### 3. Testing Different Scenarios

#### Test Case 1: Maharashtra with ARIMA
- State: Maharashtra
- Coordinates: 20.5937, 78.9629
- Date: Any future date
- Model: ARIMA
- Expected: Should show prediction around 100-150 GWh

#### Test Case 2: Different States
- Try: Delhi, Karnataka, Tamil Nadu
- Each should show different predictions based on state characteristics

#### Test Case 3: Different Models
- Test each model type: ARIMA, XGBoost, LSTM, Prophet
- Each should show slightly different predictions

#### Test Case 4: Auto Model Selection
- Select "Auto" as the model
- The system should automatically choose the best model
- Should show reasoning for the selection

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "Expected string got null" Error
**Cause**: Form data not properly submitted
**Solution**: ✅ Fixed in the latest update - form now properly serializes React Hook Form data

#### 2. "Module not found" Errors
**Cause**: Missing dependencies
**Solution**: 
```bash
npm install
```

#### 3. Python Script Errors
**Cause**: Python dependencies missing
**Solution**: 
```bash
pip install numpy joblib
```

#### 4. Port Already in Use
**Cause**: Another process using port 3000
**Solution**: 
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use a different port
npm run dev -- -p 3001
```

#### 5. Model Files Not Found
**Cause**: Models directory structure issue
**Solution**: Ensure models are in the correct location:
```
models/
├── Maharashtra_arima_model.joblib
├── Maharashtra_lstm_model.h5
├── Maharashtra_xgboost_model.joblib
└── Maharashtra_prophet_model.joblib
```

## 📊 Understanding the Results

### Prediction Components

1. **Predicted Usage**: The main forecast value in GWh
2. **Historical Data**: 90 days of past usage data
3. **Forecast Data**: Future predictions for visualization
4. **Model Information**: Which model was used and why
5. **AI Summary**: Intelligent insights about the forecast

### Model Types Explained

- **ARIMA**: Time series forecasting, good for seasonal patterns
- **XGBoost**: Gradient boosting, good for complex patterns
- **LSTM**: Neural network, good for long-term dependencies
- **Prophet**: Facebook's tool, good for trend analysis
- **Auto**: AI selects the best model based on location and date

## 🎯 Advanced Testing

### 1. Performance Testing
- Test with different date ranges (1 day, 1 week, 1 month ahead)
- Test with different states (all 28 states + union territories)
- Monitor response times

### 2. Error Handling Testing
- Try submitting with invalid dates (past dates)
- Try submitting with missing fields
- Test network interruption scenarios

### 3. Model Integration Testing
- Verify that different models produce different results
- Check that the fallback system works (TypeScript when Python fails)
- Test the model selection logic

## 📈 Expected Performance

### Response Times
- **Fast**: TypeScript fallback (~100ms)
- **Medium**: Python simple predictor (~500ms)
- **Slow**: Python advanced predictor (~1-2s)

### Accuracy
- Predictions should be realistic (50-200 GWh range)
- Different states should show different patterns
- Seasonal variations should be visible

## 🐛 Debugging

### Enable Debug Logging
Add this to your browser console to see detailed logs:
```javascript
localStorage.setItem('debug', 'true');
```

### Check Server Logs
Look at the terminal where you ran `npm run dev` for:
- Form data being received
- Model predictions being made
- Any errors in the prediction pipeline

### Common Debug Commands
```bash
# Check if the server is running
curl http://localhost:3000/api/predict

# Test the model service directly
node -e "console.log('Testing...')"

# Check Python installation
python --version
```

## 🎉 Success Indicators

You'll know the application is working correctly when:

1. ✅ The map loads and is interactive
2. ✅ Form fields update when you click on the map
3. ✅ Date picker works and prevents past dates
4. ✅ Model selection dropdown works
5. ✅ "Get Forecast" button shows loading state
6. ✅ Results appear with realistic predictions
7. ✅ Charts show historical and forecast data
8. ✅ AI summary provides intelligent insights
9. ✅ Different models show different results
10. ✅ Auto model selection works with reasoning

## 🚀 Next Steps

Once the basic functionality is working:

1. **Test All States**: Try predictions for all Indian states
2. **Test All Models**: Verify each model type works
3. **Test Edge Cases**: Past dates, invalid coordinates, etc.
4. **Performance Testing**: Load testing with multiple requests
5. **Integration Testing**: End-to-end workflow testing

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Check the server terminal for logs
3. Verify all dependencies are installed
4. Ensure the models directory structure is correct
5. Test with the TypeScript fallback if Python fails

The application is designed to be robust with multiple fallback mechanisms, so it should work even if some components fail.
