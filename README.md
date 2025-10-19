# IndiaForecaster

This is a Next.js application that provides energy usage forecasts for different states in India.

## Features

- **Interactive Map Selection**: View an interactive map of India and select a state by clicking on it.
- **Location Input**: Drop a pin on the map or enter latitude and longitude manually.
- **Forecasting**: Choose a future date and a prediction model to get usage forecasts.
- **AI-Powered Insights**: Get an AI-generated summary explaining the forecast.
- **Data Visualization**: View historical and forecasted usage on a time-series chart.
- **Responsive Design**: Works on desktop, tablet, and mobile devices.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd IndiaForecaster
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a file named `.env.local` in the root of the project and add your Google Maps API key. You can get a key from the [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/overview).

    Make sure you have enabled the **Maps JavaScript API** and **Places API** for your key.

    ```
    # .env.local
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY_HERE"
    ```

### Running the Development Server

To start the development server, run:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Backend API

The frontend is designed to integrate with a backend API that provides forecast data. The server action in this project (`src/app/actions.ts`) simulates this backend.

The expected API endpoint is:
`/predict?state=<state>&lat=<lat>&lon=<lon>&model=<model>&days_ahead=<n>`

This endpoint should return a JSON object with historical and forecasted usage data.
