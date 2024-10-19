const WEATHER_API_KEY = '937bd1026ed0dfc1fccb82b759b7b700';
const GEMINI_API_KEY = 'AIzaSyB6BM3pZfn_CdXKAmR_hLBdXAPT3JkVhmY';

let currentCity = 'Toba Tek Singh';
let charts = {
    barChart: null,
    doughnutChart: null,
    lineChart: null
};

document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    setupEventListeners();
    fetchWeatherData(currentCity);
});

function setupEventListeners() {
    const citySearch = document.getElementById('citySearch');
    citySearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentCity = citySearch.value;
            fetchWeatherData(currentCity);
        }
    });

    const chatInput = document.getElementById('chatInput');
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleChatInput(chatInput.value);
            chatInput.value = '';
        }
    });
}

async function fetchWeatherData(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
        );
        const data = await response.json();
        
        if (data.cod !== '200') {
            throw new Error(data.message || 'City not found');
        }
        
        if (!data.list || !data.list.length || !data.city) {
            throw new Error('Invalid data received from weather API');
        }

        updateDashboard(data);
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert(error.message || 'Error fetching weather data');
        return null;
    }
}

async function queryGeminiAPI(prompt) {

    const weatherKeywords = ['weather', 'temperature', 'humidity', 'wind', 'forecast', 'rain', 'sunny', 'cloudy', 'storm'];
    const isWeatherQuery = weatherKeywords.some(keyword => prompt.toLowerCase().includes(keyword));

    if (!isWeatherQuery) {
        addChatMessage('I can only assist with weather queries. Please ask something related to weather.', false);
        return;
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            }
        );

        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error querying Gemini API:', error);
        return 'I apologize, but I encountered an error processing your request.';
    }
}

function updateDashboard(data) {
    updateWeatherWidget(data);
    updateCharts(data);
}

function updateWeatherWidget(data) {
    if (!data || !data.list || !data.list[0]) {
        console.error('Invalid weather data');
        return;
    }

    const widget = document.getElementById('weatherWidget');
    const weatherData = document.getElementById('weatherData');
    const currentWeather = data.list[0];

    if (!currentWeather.weather || !currentWeather.weather[0] || !currentWeather.main) {
        console.error('Invalid weather data structure');
        return;
    }

    const weatherIcon = currentWeather.weather[0].icon;
    const weatherDescription = currentWeather.weather[0].description;
    const temperature = Math.round(currentWeather.main.temp);
    const humidity = currentWeather.main.humidity;
    const windSpeed = currentWeather.wind?.speed || 0;

    widget.className = 'weather-widget';

    weatherData.innerHTML = `
        <div class="weather-card">
            <div class="weather-header">
                <h3>${data.city.name}, ${data.city.country}</h3>
                <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="${weatherDescription}" />
            </div>
            <div class="weather-stats">
                <div class="stat-item">
                    <h4>Temperature</h4>
                    <p>${temperature}°C</p>
                </div>
                <div class="stat-item">
                    <h4>Condition</h4>
                    <p>${weatherDescription}</p>
                </div>
                <div class="stat-item">
                    <h4>Humidity</h4>
                    <p>${humidity}%</p>
                </div>
                <div class="stat-item">
                    <h4>Wind Speed</h4>
                    <p>${windSpeed} m/s</p>
                </div>
            </div>
        </div>
    `;
}

function initializeCharts() {
    const chartsConfig = {
        bar: {
            type: 'bar',
            options: {
                animation: {
                    delay: (context) => context.dataIndex * 100
                },
                plugins: {
                    title: {
                        display: true,
                        text: '5-Day Temperature Forecast'
                    }
                }
            }
        },
        doughnut: {
            type: 'doughnut',
            options: {
                animation: {
                    delay: (context) => context.dataIndex * 100
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Weather Conditions Distribution'
                    }
                }
            }
        },
        line: {
            type: 'line',
            options: {
                animation: {
                    y: {
                        duration: 2000,
                        from: -100
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Temperature Trend'
                    }
                }
            }
        }
    };

    const chartContexts = {
        bar: document.getElementById('tempBarChart').getContext('2d'),
        doughnut: document.getElementById('weatherDoughnutChart').getContext('2d'),
        line: document.getElementById('tempLineChart').getContext('2d')
    };

    charts.barChart = new Chart(chartContexts.bar, {
        ...chartsConfig.bar,
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        }
    });

    charts.doughnutChart = new Chart(chartContexts.doughnut, {
        ...chartsConfig.doughnut,
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        }
    });

    charts.lineChart = new Chart(chartContexts.line, {
        ...chartsConfig.line,
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        }
    });
}

function updateCharts(data) {
    // Check if we have valid data
    if (!data || !data.list || !data.list.length) {
        console.error('Invalid data for charts');
        return;
    }

    const next5Days = data.list
        .filter((reading, index) => index % 8 === 0)
        .slice(0, 5);

    if (!next5Days.length) {
        console.error('No forecast data available');
        return;
    }

    if (charts.barChart) {
        charts.barChart.data.labels = next5Days.map(day => 
            new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })
        );
        charts.barChart.data.datasets[0].data = next5Days.map(day => 
            day.main ? day.main.temp : null
        ).filter(temp => temp !== null);
        charts.barChart.update();
    }

    if (charts.doughnutChart) {
        const weatherTypes = {};
        next5Days.forEach(day => {
            if (day.weather && day.weather[0]) {
                const type = day.weather[0].main;
                weatherTypes[type] = (weatherTypes[type] || 0) + 1;
            }
        });

        charts.doughnutChart.data.labels = Object.keys(weatherTypes);
        charts.doughnutChart.data.datasets[0].data = Object.values(weatherTypes);
        charts.doughnutChart.update();
    }

    // Update Line Chart
    if (charts.lineChart) {
        charts.lineChart.data.labels = next5Days.map(day => 
            new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })
        );
        charts.lineChart.data.datasets[0].data = next5Days.map(day => 
            day.main ? day.main.temp : null
        ).filter(temp => temp !== null);
        charts.lineChart.update();
    }
}

async function handleChatInput(input) {
    if (!input.trim()) return;

    addChatMessage(input, true);

    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.textContent = 'Assistant is typing...';
    chatMessages.appendChild(typingDiv);

    try {
        let response;
        if (input.toLowerCase().includes('weather')) {
            const weatherData = await fetchWeatherData(currentCity);
            if (weatherData && weatherData.list && weatherData.list[0]) {
                const weatherPrompt = `Based on the weather data for ${currentCity}: 
                    Temperature: ${weatherData.list[0].main?.temp}°C, 
                    Weather: ${weatherData.list[0].weather?.[0]?.description || 'unavailable'}, 
                    Humidity: ${weatherData.list[0].main?.humidity}%. 
                    Please provide a natural response to: ${input}`;
                response = await queryGeminiAPI(weatherPrompt);
            } else {
                response = "I'm sorry, I couldn't fetch the weather data at the moment. Please try again later.";
            }
        } else {
            response = await queryGeminiAPI(input);
        }

        chatMessages.removeChild(typingDiv);
        addChatMessage(response);
    } catch (error) {
        console.error('Error:', error);
        chatMessages.removeChild(typingDiv);
        addChatMessage('I apologize, but I encountered an error processing your request.');
    }
}

function addChatMessage(message, isUser = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = isUser ? `You: ${message}` : `Assistant: ${message}`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showDashboard() {
    console.log('Switching to dashboard view');
}

function showTables() {
    console.log('Switching to tables view');
}

function toggleChatbot() {
    const chatbotContainer = document.getElementById('chatbot');
    const toggleArrow = document.getElementById('toggleArrow');

    if (chatbotContainer.classList.contains('expanded')) {
        chatbotContainer.classList.remove('expanded');
        chatbotContainer.classList.add('collapsed');
        toggleArrow.style.transform = 'rotate(180deg)';
    } else {
        chatbotContainer.classList.remove('collapsed');
        chatbotContainer.classList.add('expanded');
        toggleArrow.style.transform = 'rotate(0deg)';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const chatbotContainer = document.getElementById('chatbot');
    chatbotContainer.classList.add('collapsed');
});