const apiKey = '4ca6ca16185496cb252cef5cdf3d3499';

// Get references to DOM elements
const cityInput = document.getElementById('cityInput');
const getWeatherButton = document.getElementById('getWeather');
const getLocationWeatherButton = document.getElementById('getLocationWeather');
const recentCitiesDropdown = document.getElementById('recentCities');

// Event listener to get weather for entered city
getWeatherButton.addEventListener('click', () => {
    const city = cityInput.value;
    if (!city) {
        alert('Please enter a city name.');
        return;
    }
    fetchWeatherByCity(city);
});

// Event listener to get weather for selected recent city
recentCitiesDropdown.addEventListener('change', () => {
    const city = recentCitiesDropdown.value;
    if (city) {
        fetchWeatherByCity(city);
    }
});

// Function to fetch weather by city name
async function fetchWeatherByCity(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) throw new Error('Weather data not found');
        const data = await response.json();
        displayWeather(data);
        fetchExtendedForecast(data.coord.lat, data.coord.lon);
        updateRecentCities(city);
    } catch (error) {
        alert(error.message);
    }
}

// Function to get weather for current location
getLocationWeatherButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoordinates(latitude, longitude);
        }, () => {
            alert('Unable to retrieve your location');
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});

// Function to fetch weather by coordinates
async function fetchWeatherByCoordinates(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        if (!response.ok) throw new Error('Weather data not found');
        const data = await response.json();
        displayWeather(data);
        fetchExtendedForecast(lat, lon);
    } catch (error) {
        alert(error.message);
    }
}

// Function to display weather data
function displayWeather(data) {
    const weatherContainer = document.getElementById('weatherData');
    weatherContainer.innerHTML = `
        <h2 class="text-3xl p-4 font-semibold mb-2">${data.name}</h2>
        <div class="flex justify-center items-center mb-4">
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon" class="w-16 h-16">
            <p class="text-4xl font-bold ml-1">${data.main.temp}°C</p>
        </div>
        <p class="text-lg pb-2 capitalize">${data.weather[0].description}</p>
        <p class="text-lg">Humidity: ${data.main.humidity}%</p>
        <p class="text-lg pb-2">Wind Speed: ${data.wind.speed} m/s</p>
    `;
}

// Function to fetch and display extended forecast
async function fetchExtendedForecast(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        if (!response.ok) throw new Error('Extended forecast data not found');
        const data = await response.json();
        displayExtendedForecast(data);
    } catch (error) {
        alert(error.message);
    }
}

// Function to display extended forecast
function displayExtendedForecast(data) {
    const forecastContainer = document.getElementById('extendedForecast');
    forecastContainer.innerHTML = '<h3 class="text-lg font-semibold mb-4 text-center text-gray-700 w-full">5-Day Forecast</h3>';
    
    // Clear previous forecast cards
    forecastContainer.innerHTML = '';

    // Add forecast cards
    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const card = document.createElement('div');
        card.className = 'bg-blue-200 p-4 rounded-lg shadow-md flex-none w-full md:w-60 text-center border border-blue-300';

        card.innerHTML = `
            <p class="text-md font-semibold mb-2 text-blue-800">${new Date(forecast.dt_txt).toDateString()}</p>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="Weather Icon" class="w-12 h-12 mx-auto">
            <p class="text-md font-bold text-blue-700">${forecast.main.temp}°C</p>
            <p class="text-md text-blue-600">Wind: ${forecast.wind.speed} m/s</p>
            <p class="text-md text-blue-600">Humidity: ${forecast.main.humidity}%</p>
        `;

        forecastContainer.appendChild(card);
    }
}

// Function to update recently searched cities in local storage
function updateRecentCities(city) {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    
    if (!recentCities.includes(city)) {
        recentCities.push(city);
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
        populateRecentCitiesDropdown();
    }
}

// Function to populate dropdown with recent cities
function populateRecentCitiesDropdown() {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    
    if (recentCities.length > 0) {
        recentCitiesDropdown.classList.remove('hidden');
        recentCitiesDropdown.innerHTML = '<option value="" disabled selected>Select a recently searched city</option>';
        
        recentCities.forEach(city => {
            let option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            recentCitiesDropdown.appendChild(option);
        });
    } else {
        recentCitiesDropdown.classList.add('hidden');
    }
}

// Populate dropdown on page load
document.addEventListener('DOMContentLoaded', populateRecentCitiesDropdown);
