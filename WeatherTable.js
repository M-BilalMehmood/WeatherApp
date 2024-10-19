// Save this as tables.js
let currentCity = 'Toba Tek Singh';
const WEATHER_API_KEY = '937bd1026ed0dfc1fccb82b759b7b700';
const GEMINI_API_KEY = 'AIzaSyB6BM3pZfn_CdXKAmR_hLBdXAPT3JkVhmY';

document.addEventListener('DOMContentLoaded', () => {
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
        
        updateWeatherTable(data);
        updateCurrentWeatherStats(data);
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert(error.message || 'Error fetching weather data');
        return null;
    }
}

function updateWeatherTable(data) {
    const tableBody = document.querySelector('#weatherHistoryTable tbody');
    tableBody.innerHTML = '';

    data.list.forEach(day => {
        const row = document.createElement('tr');
        const date = new Date(day.dt * 1000);
        
        row.innerHTML = `
            <td>${date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            })}</td>
            <td>${Math.round(day.main.temp)}°C</td>
            <td>${day.weather[0].description}</td>
            <td>${day.main.humidity}</td>
            <td>${day.wind.speed}</td>
            <td>${day.main.pressure}</td>
        `;
        tableBody.appendChild(row);
    });
}

function updateCurrentWeatherStats(data) {
    const currentWeather = data.list[0];
    const statsContainer = document.getElementById('currentWeatherStats');
    
    statsContainer.innerHTML = `
        <div class="stat-item">
            <h4>Temperature</h4>
            <p>${Math.round(currentWeather.main.temp)}°C</p>
        </div>
        <div class="stat-item">
            <h4>Weather</h4>
            <p>${currentWeather.weather[0].description}</p>
        </div>
        <div class="stat-item">
            <h4>Humidity</h4>
            <p>${currentWeather.main.humidity}%</p>
        </div>
        <div class="stat-item">
            <h4>Wind Speed</h4>
            <p>${currentWeather.wind.speed} m/s</p>
        </div>
    `;
}

async function handleChatInput(input) {
    if (!input.trim()) return;

    addChatMessage(input, true);

    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot-message';
    typingDiv.textContent = 'Assistant is typing...';
    chatMessages.appendChild(typingDiv);

    try {
        let response;
        if (input.toLowerCase().includes('weather')) {
            const weatherData = await fetchWeatherData(currentCity);
            if (weatherData && weatherData.list && weatherData.list[0]) {
                const weatherPrompt = `Based on the weather data for ${currentCity}: 
                    Temperature: ${weatherData.list[0].main.temp}°C, 
                    Weather: ${weatherData.list[0].weather[0].description}, 
                    Humidity: ${weatherData.list[0].main.humidity}%. 
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
        const message = data.contents[0].parts[0].text;

        addChatMessage(message, false);
    } catch (error) {
        console.error('Error:', error);
        addChatMessage('I apologize, but I encountered an error processing your request.', false);
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