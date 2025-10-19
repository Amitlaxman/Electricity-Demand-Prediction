# **App Name**: IndiaForecaster

## Core Features:

- Interactive Map Selection: Display an interactive map of India with clickable states using Leaflet or Mapbox.
- Location Selection: Allow users to select a state by clicking on the map or dropping a pin at a specific latitude/longitude.
- Date/Time Input: Provide a UI component (date/time picker) for users to select a future date and time for prediction.
- Model Selection: Allow users to select a prediction model (ARIMA, Prophet, LSTM, XGBoost) via a toggle or dropdown.
- API Integration: Integrate with a backend API endpoint (/predict?state=<state>&lat=<lat>&lon=<lon>&model=<model>&days_ahead=<n>) to fetch prediction data.
- Usage Prediction Display: Display the predicted usage for the selected location and date in a clear, readable format.
- Time-Series Chart: Generate a time-series chart (using Chart.js or Plotly.js) showing historical usage data and forecasted future values based on selected models. The tool determines if the additional historical or model specific information meaningfully affect the usefulness of the prediction for the user, before incorporating it.

## Style Guidelines:

- Primary color: Desaturated teal (#468A8A), evoking a sense of trustworthiness and reliability.
- Background color: Very light gray (#F0F0F0), almost white, creating a clean and spacious backdrop.
- Accent color: Pale yellowish-green (#8FAF44), to draw attention to interactive elements, but not overwhelm the user with a high level of saturation.
- Body and headline font: 'PT Sans', sans-serif, for a modern, clean, and easily readable interface.
- Use simple, geometric icons to represent different data types and functions.
- Implement a responsive layout with a sidebar for filters, a main map area, and a graph area. Optimize for desktop, tablet, and mobile devices.
- Use subtle transitions and loading spinners to provide feedback and improve user experience.