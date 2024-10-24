# Weather Dashboard with AI Assistant 🌤️

## Overview
A modern weather application featuring real-time weather data, forecasting, and an AI-powered assistant to answer your weather-related questions.

[Live Demo](Weather App)

## Features

- **Current Weather** 🌡️
  - Real-time temperature display
  - Current weather conditions
  - Humidity levels
  - Wind speed measurements
  - City-specific weather data

- **5-Day Forecast** 📊
  - Interactive weather trend visualization
  - Temperature trends (Bar Chart)
  - Weather condition distribution (Doughnut Chart)
  - Temperature progression (Line Chart)

- **Weather History** 📋
  - Tabular view of historical weather data
  - Comprehensive past weather information

- **AI Assistant** 🤖
  - Conversational weather information
  - Powered by Google Gemini API
  - Natural language interaction

- **Dark Mode UI** 🌙
  - Modern and sleek dark theme
  - Enhanced user experience
  - Eye-friendly interface

## Local Setup Instructions

### Prerequisites
1. OpenWeatherMap API key
2. Google Gemini API key
3. Web browser
4. Code editor

### Installation

1. **Clone the Repository**
   ```bash
   git clone [Github Repo Link]
   ```

2. **Navigate to Project Directory**
   ```bash
   cd weather-dashboard
   ```

3. **Configure API Keys**
   - Get your API keys:
     - [OpenWeatherMap API](https://openweathermap.org/api)
     - [Google Gemini API](https://developers.generativeai.google/)
   - Open `WeatherScript.js` and `WeatherTable.js`
   - Replace the placeholder API keys:
     ```javascript
     const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY'
     const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'
     ```

4. **Launch Application**
   - Open `index.html` in your web browser
   - The application should now be running locally

## Usage Guide

### Weather Search
1. Enter city name in the search bar
2. Press Enter or click the search button
3. View current weather data and forecasts

### AI Assistant
1. Navigate to the AI Assistant section
2. Type your weather-related questions
3. Receive natural language responses

### Navigation
- Use the sidebar menu to switch between:
  - Dashboard view
  - Weather tables
  - AI Assistant

## Dependencies

### External APIs
- **OpenWeatherMap API**
  - Weather data fetching
  - Real-time weather information
  
- **Google Gemini API**
  - AI-powered conversations
  - Natural language processing

### Libraries
- **Chart.js**
  - Interactive data visualization
  - Weather trend charts
