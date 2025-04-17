// Preload audio files to prevent delays
const audioFiles = {
  rain: new Audio("audio/rain_alert.mp3"),
  thunderstorm: new Audio("audio/thunderstorm_alert.mp3"),
  snow: new Audio("audio/snow_alert.mp3"),
  wind: new Audio("audio/wind_alert.mp3")
};

const apiKey = "a7ad9a0d05ced488df10826b7a1aac74"; // Replace with OpenWeatherMap API key
let isCelsius = true;

// Function to Fetch Weather Data
// Function to Fetch Weather Data
async function getWeather() {
    const city = document.getElementById("cityInput").value;
    if (!city) {
        alert("Please enter a city name");
        return;
    }
  
    const unit = isCelsius ? "metric" : "imperial";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`;
  
    try {
        const response = await fetch(url);
        const data = await response.json();
  
        if (data.cod === "404") {
            document.getElementById("weatherInfo").innerHTML = `<p>City not found!</p>`;
            document.getElementById("weatherInfo").style.display = "block";
  
            // Clear forecast sections if city not found
            document.getElementById("hourlyContainer").innerHTML = "";
            document.getElementById("weeklyContainer").innerHTML = "";
            return;
        }
  
        let tempUnit = isCelsius ? "°C" : "°F";
        let sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
        let sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString();
        let feelsLike = data.main.feels_like;
        let rainAmount = data.rain ? data.rain["1h"] || data.rain["3h"] : 0;
        let snowAmount = data.snow ? data.snow["1h"] || data.snow["3h"] : 0;
  
        document.getElementById("weatherInfo").innerHTML = `
            <h2>${data.name}, ${data.sys.country}</h2>
            <p><strong>Temperature:</strong> ${data.main.temp}${tempUnit}</p>
            <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
            <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
            <p><strong>Weather:</strong> ${data.weather[0].description}</p>
            <p><strong>Pressure:</strong> ${data.main.pressure} hPa</p>
            <p><strong>Visibility:</strong> ${data.visibility / 1000} km</p>
            <p><strong>Cloudiness:</strong> ${data.clouds.all}%</p>
            <p><strong>Feels Like:</strong> ${feelsLike}${tempUnit}</p>
            <p><strong>Wind Direction:</strong> ${data.wind.deg}°</p>
            <p><strong>Rain:</strong> ${rainAmount > 0 ? rainAmount + " mm" : "None"}</p>
            <p><strong>Snow:</strong> ${snowAmount > 0 ? snowAmount + " mm" : "None"}</p>
            <p><strong>Sunrise:</strong> ${sunriseTime}</p>
            <p><strong>Sunset:</strong> ${sunsetTime}</p>
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">
        `;
  
        document.getElementById("weatherInfo").style.display = "block";
  
        // Fetch forecast data
        getForecast(forecastUrl, tempUnit);
  
        // ✅ Initialize Radar Map with correct latitude & longitude
        initRadarMap(data.coord.lat, data.coord.lon);
  
        // ✅ Move `getWeatherAlerts()` AFTER fetching `data`
        getWeatherAlerts(data.coord.lat, data.coord.lon);
  
    } catch (error) {
        console.error("Error fetching data:", error);
    }
  }
  

// Function to Fetch and Display Hourly & Weekly Forecast
async function getForecast(url, tempUnit) {
  try {
      const response = await fetch(url);
      const data = await response.json();

      // 1️⃣ Hourly Forecast - Shows Next 6 Time Slots
      let hourlyForecastHTML = `<h3>Hourly Forecast</h3><div class="forecast-container">`;
      for (let i = 0; i < data.list.length && i < 6; i++) {  
          let forecast = data.list[i];

          // Improved Time Formatting
          let time = new Intl.DateTimeFormat(navigator.language, {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }).format(new Date(forecast.dt * 1000));

          hourlyForecastHTML += `
              <div class="forecast-item">
                  <p>${time}</p>
                  <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="Weather Icon">
                  <p>${forecast.main.temp}${tempUnit}</p>
              </div>
          `;
      }
      hourlyForecastHTML += `</div>`;

      // 2️⃣ Weekly Forecast - Fix 5-Day Forecast Selection
      let dailyForecastHTML = `<h3>5-Day Forecast</h3><div class="forecast-container">`;
      let uniqueDays = new Set();

      for (let i = 0; i < data.list.length; i++) {
          let forecast = data.list[i];
          let date = new Date(forecast.dt * 1000).toLocaleDateString();

          // Convert UTC time to local time correctly
          let forecastDate = new Date(forecast.dt * 1000);
          let localHours = forecastDate.getHours();

          // Select forecast for each day around 12 PM (allowing ±1 hour flexibility)
          if (!uniqueDays.has(date) && localHours >= 11 && localHours <= 13) {
              uniqueDays.add(date);

              dailyForecastHTML += `
                  <div class="forecast-item">
                      <p>${date}</p>
                      <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="Weather Icon">
                      <p>${forecast.main.temp}${tempUnit}</p>
                  </div>
              `;
          }

          if (uniqueDays.size === 5) break; // Stop after collecting 5 unique days
      }
      dailyForecastHTML += `</div>`;

      // Update UI
      document.getElementById("hourlyContainer").innerHTML = hourlyForecastHTML;
      document.getElementById("weeklyContainer").innerHTML = dailyForecastHTML;

  } catch (error) {
      console.error("Error fetching forecast data:", error);
  }
}

// Toggle Temperature Unit
document.getElementById("unitToggle").addEventListener("change", function () {
  isCelsius = !isCelsius;
  getWeather();
});

// Update Date & Time
function updateDateTime() {
  const now = new Date();
  document.getElementById("dateTime").innerText = now.toLocaleString();
}
setInterval(updateDateTime, 1000);
updateDateTime();

// Function to toggle between light and dark themes
function themeToggle() {
    const body = document.body;
    const nav = document.querySelector('nav');
    const themeButton = document.getElementById('themeToggle');
    
    // Toggle the dark-mode class on body, nav, and button
    body.classList.toggle('dark-mode');
    nav.classList.toggle('dark-mode');
    themeButton.classList.toggle('dark-mode');
    
    // Update the button text based on the current theme
    if (body.classList.contains('dark-mode')) {
      themeButton.textContent = '🌞'; // Change to sun icon for light mode
    } else {
      themeButton.textContent = '🌙'; // Change to moon icon for dark mode
    }
  }
  
  // Add event listener to the theme toggle button
  document.getElementById('themeToggle').addEventListener('click', themeToggle);
  
async function getWeatherAlerts(lat, lon) {
  const alertsUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
      const response = await fetch(alertsUrl);
      const data = await response.json();

      if (data.weather && data.weather.length > 0) {
          let weatherCondition = data.weather[0].main;
          checkWeatherAlert(weatherCondition, data.wind.speed);
      }
  } catch (error) {
      console.error("Error fetching weather alerts:", error);
  }
}


function showNotification(title, message, audioKey) {
  if (Notification.permission === "granted") {
      new Notification(title, {
          body: message,
          icon: "weather-icon.png"
      });
  }

  // Check if the audio exists in the preloaded list and play it
  if (audioFiles[audioKey]) {
      audioFiles[audioKey].play().catch(error => {
          console.warn("Audio playback blocked:", error);
      });
  }
}

function checkWeatherAlert(weatherCondition, windSpeed) {
  let alertTitle = "";
  let alertMessage = "";
  let audioFile = null;

  switch (weatherCondition) {
      case "Rain":
      case "Drizzle":
          alertTitle = "Rain Alert 🌧️";
          alertMessage = "Rain expected! Carry an umbrella.";
          showNotification(alertTitle, alertMessage, "rain"); // ✅ UPDATED
          break;
  
      case "Thunderstorm":
          alertTitle = "Thunderstorm Alert ⛈️";
          alertMessage = "Thunderstorm detected! Stay indoors.";
          showNotification(alertTitle, alertMessage, "thunderstorm"); // ✅ UPDATED
          break;
  
      case "Snow":
          alertTitle = "Snow Alert ❄️";
          alertMessage = "Snowfall ahead! Wear warm clothes.";
          showNotification(alertTitle, alertMessage, "snow"); // ✅ UPDATED
          break;
  
      default:
          if (windSpeed > 10) {
              alertTitle = "Wind Alert 💨";
              alertMessage = "High winds detected! Be careful outside.";
              showNotification(alertTitle, alertMessage, "wind"); // ✅ UPDATED
          } else {
              return;
          }
  }
  
  showNotification(alertTitle, alertMessage, audioFile);
}

let map; // Declare globally
let radarLayers = {};
let activeLayer = null;

// Initialize Map with a Clean, Professional Base Map
async function initRadarMap(lat, lon) {
  if (!map) {
      map = L.map("map", { zoomControl: false }).setView([lat, lon], 6);

      // Use a clean, light-themed base map for a professional look
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution: "&copy; <a href='https://carto.com/'>CartoDB</a>",
          subdomains: "abcd"
      }).addTo(map);
  } else {
      map.setView([lat, lon], 6);
  }
}