// WeatherNow - Simple Weather Application
// API Configuration
const API_KEY = "1e3e8f230b6064d27976e41163a82b77";
const API_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const GEO_API_URL = "https://api.openweathermap.org/geo/1.0/reverse";

// DOM Elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const errorMessage = document.getElementById("error-message");
const weatherDisplay = document.getElementById("weather-display");

// Weather icon mapping
const WEATHER_ICONS = {
  Clear: "img/sun.png",
  Clouds: "img/cloud.png",
  Rain: "img/rain.png",
  Drizzle: "img/rain.png",
  Snow: "img/snow.png",
  Mist: "img/mist.png",
  Fog: "img/mist.png",
  Haze: "img/haze.png",
  Smoke: "img/haze.png",
  Thunderstorm: "img/thunderstorm.png"
};

// Weather background classes
const WEATHER_BACKGROUNDS = {
  Clear: "clear",
  Clouds: "clouds",
  Rain: "rain",
  Drizzle: "rain",
  Snow: "snow",
  Mist: "mist",
  Fog: "mist",
  Haze: "mist",
  Smoke: "mist",
  Thunderstorm: "thunderstorm"
};

// Show/Hide states
function showLoading() {
  loading.classList.remove("hidden");
  error.classList.add("hidden");
  weatherDisplay.classList.add("hidden");
}

function showError(message) {
  loading.classList.add("hidden");
  weatherDisplay.classList.add("hidden");
  error.classList.remove("hidden");
  errorMessage.textContent = message;
}

function showWeather() {
  loading.classList.add("hidden");
  error.classList.add("hidden");
  weatherDisplay.classList.remove("hidden");
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
  const url = `${API_BASE_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error("Unable to fetch weather data");
  }
  
  return await response.json();
}

// Fetch weather by city name
async function fetchWeatherByCity(city) {
  const url = `${API_BASE_URL}?q=${city}&units=metric&appid=${API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error("City not found. Please check the spelling and try again.");
  }
  
  return await response.json();
}

// Get current location weather
async function getCurrentLocationWeather() {
  showLoading();
  
  try {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by your browser");
    }
    
    // Get user's position
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        enableHighAccuracy: true
      });
    });
    
    const { latitude, longitude } = position.coords;
    const weatherData = await fetchWeatherByCoords(latitude, longitude);
    displayWeather(weatherData);
    
  } catch (err) {
    console.error("Location error:", err);
    if (err.code === 1) {
      showError("Location access denied. Please enable location services or search for a city.");
    } else if (err.code === 2) {
      showError("Unable to determine your location. Please search for a city.");
    } else if (err.code === 3) {
      showError("Location request timed out. Please search for a city.");
    } else {
      showError(err.message || "Unable to get your location. Please search for a city.");
    }
  }
}

// Search weather by city
async function searchWeather() {
  const city = searchInput.value.trim();
  
  if (!city) {
    showError("Please enter a city name");
    return;
  }
  
  showLoading();
  
  try {
    const weatherData = await fetchWeatherByCity(city);
    displayWeather(weatherData);
    searchInput.value = "";
  } catch (err) {
    console.error("Search error:", err);
    showError(err.message || "Unable to find weather data for this city");
  }
}

// Format time from timestamp
function formatTime(timestamp, timezone) {
  const date = new Date((timestamp + timezone) * 1000);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Get current date and time
function getCurrentDateTime() {
  const now = new Date();
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return now.toLocaleDateString('en-US', options);
}

// Display weather data
function displayWeather(data) {
  // Update location info
  document.getElementById("city-name").textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("date-time").textContent = getCurrentDateTime();
  
  // Update main weather
  const weatherCondition = data.weather[0].main;
  const weatherIcon = WEATHER_ICONS[weatherCondition] || "img/sun.png";
  
  document.getElementById("weather-icon").src = weatherIcon;
  document.getElementById("temp").textContent = Math.round(data.main.temp);
  document.getElementById("weather-description").textContent = data.weather[0].description;
  
  // Update weather details
  document.getElementById("feels-like").textContent = `${Math.round(data.main.feels_like)}°C`;
  document.getElementById("humidity").textContent = `${data.main.humidity}%`;
  document.getElementById("wind-speed").textContent = `${data.wind.speed} m/s`;
  document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;
  document.getElementById("visibility").textContent = `${(data.visibility / 1000).toFixed(1)} km`;
  document.getElementById("cloudiness").textContent = `${data.clouds.all}%`;
  
  // Update sun times
  document.getElementById("sunrise").textContent = formatTime(data.sys.sunrise, data.timezone);
  document.getElementById("sunset").textContent = formatTime(data.sys.sunset, data.timezone);
  
  // Update background
  updateBackground(weatherCondition);
  
  // Show weather display
  showWeather();
}

// Update background based on weather
function updateBackground(condition) {
  // Remove all weather background classes
  document.body.className = "";
  
  // Add new background class
  const bgClass = WEATHER_BACKGROUNDS[condition] || "clear";
  document.body.classList.add(bgClass);
}

// Event listeners
searchBtn.addEventListener("click", searchWeather);

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchWeather();
  }
});

locationBtn.addEventListener("click", getCurrentLocationWeather);

// Initialize app - Try to get current location on load
window.addEventListener("load", () => {
  getCurrentLocationWeather();
});
