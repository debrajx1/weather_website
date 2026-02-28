/* ╔══════════════════════════════════════════════════════╗
   ║        WEATHER PRO — Professional App Logic         ║
   ╚══════════════════════════════════════════════════════╝ */

// ═══════════════════════════════════
// Configuration
// ═══════════════════════════════════
const API_KEY = "a7ad9a0d05ced488df10826b7a1aac74";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Audio preload
const audioFiles = {
  rain: new Audio("audio/rain_alert.mp3"),
  thunderstorm: new Audio("audio/thunderstorm_alert.mp3"),
  snow: new Audio("audio/snow_alert.mp3"),
  wind: new Audio("audio/wind_alert.mp3")
};

// ═══════════════════════════════════
// State
// ═══════════════════════════════════
let state = {
  isCelsius: true,
  isLightMode: false,
  map: null,
  currentLayer: null,
  lastCity: '',
  lastCoords: null,
  isLoading: false
};

// ═══════════════════════════════════
// DOM References
// ═══════════════════════════════════
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
  cityInput: $('#cityInput'),
  searchBtn: $('#searchBtn'),
  geoBtn: $('#geoBtn'),
  unitToggle: $('#unitToggle'),
  themeToggle: $('#themeToggle'),
  themeIcon: $('#themeIcon'),
  dateTime: $('#dateTime'),
  welcomePrompt: $('#welcomePrompt'),
  dashboard: $('#dashboard'),
  heroWeather: $('#heroWeather'),
  detailGrid: $('#detailGrid'),
  aqiContent: $('#aqiContent'),
  uvContent: $('#uvContent'),
  hourlyContainer: $('#hourlyContainer'),
  weeklyContainer: $('#weeklyContainer'),
  alertBanner: $('#alertBanner'),
  alertBannerText: $('#alertBannerText'),
  alertBannerClose: $('#alertBannerClose'),
  toastContainer: $('#toastContainer'),
  mapLayerControls: $('#mapLayerControls')
};


// ═══════════════════════════════════
// Initialize App
// ═══════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initDateTime();
  initEventListeners();
  loadPreferences();
  requestNotificationPermission();
});


// ═══════════════════════════════════
// Event Listeners
// ═══════════════════════════════════
function initEventListeners() {
  // Search
  dom.searchBtn.addEventListener('click', () => searchByCity());
  dom.cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchByCity();
  });

  // Geolocation
  dom.geoBtn.addEventListener('click', searchByLocation);

  // Unit toggle
  dom.unitToggle.addEventListener('change', () => {
    state.isCelsius = !state.isCelsius;
    localStorage.setItem('weatherpro_unit', state.isCelsius ? 'C' : 'F');
    if (state.lastCity || state.lastCoords) refreshWeather();
  });

  // Theme toggle
  dom.themeToggle.addEventListener('click', toggleTheme);

  // Alert banner close
  dom.alertBannerClose.addEventListener('click', () => {
    dom.alertBanner.style.display = 'none';
  });

  // Map layer controls
  $$('.layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.layer-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (state.lastCoords) {
        updateMapLayer(btn.dataset.layer);
      }
    });
  });
}


// ═══════════════════════════════════
// Preferences (localStorage)
// ═══════════════════════════════════
function loadPreferences() {
  // Unit
  const savedUnit = localStorage.getItem('weatherpro_unit');
  if (savedUnit === 'F') {
    state.isCelsius = false;
    dom.unitToggle.checked = true;
  }

  // Theme
  const savedTheme = localStorage.getItem('weatherpro_theme');
  if (savedTheme === 'light') {
    state.isLightMode = true;
    document.body.classList.add('light-mode');
    updateThemeIcon();
  }
}


// ═══════════════════════════════════
// Date & Time
// ═══════════════════════════════════
function initDateTime() {
  updateDateTime();
  setInterval(updateDateTime, 1000);
}

function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  };
  dom.dateTime.textContent = now.toLocaleDateString('en-US', options);
}


// ═══════════════════════════════════
// Theme Toggle
// ═══════════════════════════════════
function toggleTheme() {
  state.isLightMode = !state.isLightMode;
  document.body.classList.toggle('light-mode', state.isLightMode);
  localStorage.setItem('weatherpro_theme', state.isLightMode ? 'light' : 'dark');
  updateThemeIcon();
}

function updateThemeIcon() {
  const iconEl = dom.themeIcon;
  if (iconEl) {
    iconEl.setAttribute('data-lucide', state.isLightMode ? 'sun' : 'moon');
    lucide.createIcons();
  }
}


// ═══════════════════════════════════
// Request Notification Permission
// ═══════════════════════════════════
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}


// ═══════════════════════════════════
// Search Functions
// ═══════════════════════════════════
function searchByCity() {
  const city = dom.cityInput.value.trim();
  if (!city) {
    showToast('warning', 'Enter a City', 'Please type a city name to search.');
    shakeInput();
    return;
  }
  state.lastCity = city;
  state.lastCoords = null;
  fetchAllWeatherData(city, null);
}

function searchByLocation() {
  if (!navigator.geolocation) {
    showToast('warning', 'Not Supported', 'Geolocation is not supported by your browser.');
    return;
  }

  dom.geoBtn.innerHTML = '<span class="spinner"></span>';

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;
      state.lastCoords = { lat, lon };
      state.lastCity = '';
      dom.geoBtn.innerHTML = '<i data-lucide="map-pin"></i>';
      lucide.createIcons();
      fetchAllWeatherData(null, { lat, lon });
    },
    (err) => {
      dom.geoBtn.innerHTML = '<i data-lucide="map-pin"></i>';
      lucide.createIcons();
      showToast('danger', 'Location Error', 'Unable to get your location. Please allow location access.');
    },
    { timeout: 10000 }
  );
}

function refreshWeather() {
  if (state.lastCoords) {
    fetchAllWeatherData(null, state.lastCoords);
  } else if (state.lastCity) {
    fetchAllWeatherData(state.lastCity, null);
  }
}


// ═══════════════════════════════════
// Input Shake Animation
// ═══════════════════════════════════
function shakeInput() {
  dom.cityInput.style.animation = 'none';
  dom.cityInput.offsetHeight; // trigger reflow
  dom.cityInput.style.animation = 'shake 0.4s ease';
  dom.cityInput.style.borderColor = 'var(--danger)';
  setTimeout(() => {
    dom.cityInput.style.borderColor = '';
    dom.cityInput.style.animation = '';
  }, 1000);
}

// Add shake keyframes dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-6px); }
    40%, 80% { transform: translateX(6px); }
  }
`;
document.head.appendChild(shakeStyle);


// ═══════════════════════════════════
// Main Data Fetcher
// ═══════════════════════════════════
async function fetchAllWeatherData(city, coords) {
  if (state.isLoading) return;
  state.isLoading = true;

  const unit = state.isCelsius ? 'metric' : 'imperial';
  let locationQuery = city ? `q=${encodeURIComponent(city)}` : `lat=${coords.lat}&lon=${coords.lon}`;

  const currentUrl = `${BASE_URL}/weather?${locationQuery}&appid=${API_KEY}&units=${unit}`;
  const forecastUrl = `${BASE_URL}/forecast?${locationQuery}&appid=${API_KEY}&units=${unit}`;

  // Show dashboard + loading
  dom.welcomePrompt.style.display = 'none';
  dom.dashboard.style.display = 'flex';
  showLoadingState();

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ]);

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    if (currentData.cod === '404' || currentData.cod === 404) {
      showErrorState('City Not Found', 'We couldn\'t find that city. Please check the spelling and try again.');
      state.isLoading = false;
      return;
    }

    if (!currentRes.ok) {
      throw new Error(`API Error: ${currentData.message || 'Unknown error'}`);
    }

    // Store coords for map / AQI / UV
    const { lat, lon } = currentData.coord;
    state.lastCoords = { lat, lon };

    // Render everything
    renderCurrentWeather(currentData);
    renderDetailCards(currentData);
    renderHourlyForecast(forecastData);
    renderWeeklyForecast(forecastData);
    initRadarMap(lat, lon);
    setDynamicBackground(currentData.weather[0].main, currentData.dt, currentData.sys.sunrise, currentData.sys.sunset);

    // Fetch additional data (non-blocking)
    fetchAQI(lat, lon);
    fetchUV(lat, lon);
    checkWeatherAlerts(currentData.weather[0].main, currentData.wind.speed);

    // Update input
    dom.cityInput.value = currentData.name;

  } catch (error) {
    console.error('Error fetching weather:', error);
    showErrorState('Something Went Wrong', 'Unable to fetch weather data. Please check your connection and try again.');
  }

  state.isLoading = false;
}


// ═══════════════════════════════════
// Loading State
// ═══════════════════════════════════
function showLoadingState() {
  dom.heroWeather.innerHTML = `
    <div class="hero-weather__main">
      <div class="skeleton skeleton--circle"></div>
      <div style="flex:1">
        <div class="skeleton skeleton--title"></div>
        <div class="skeleton skeleton--text" style="width:40%"></div>
        <div class="skeleton skeleton--text" style="width:60%"></div>
      </div>
    </div>
  `;
  dom.detailGrid.innerHTML = Array(6).fill(0).map(() => `
    <div class="detail-card">
      <div class="skeleton" style="width:44px;height:44px;border-radius:12px;flex-shrink:0"></div>
      <div style="flex:1"><div class="skeleton skeleton--text"></div><div class="skeleton skeleton--text" style="width:50%"></div></div>
    </div>
  `).join('');
  dom.hourlyContainer.innerHTML = Array(8).fill(0).map(() => `
    <div class="hourly-item"><div class="skeleton" style="width:50px;height:12px"></div><div class="skeleton skeleton--circle" style="width:42px;height:42px"></div><div class="skeleton" style="width:40px;height:14px"></div></div>
  `).join('');
  dom.weeklyContainer.innerHTML = Array(5).fill(0).map(() => `
    <div class="weekly-item"><div class="skeleton" style="width:80px;height:14px"></div><div class="skeleton" style="width:42px;height:42px;border-radius:8px"></div><div class="skeleton skeleton--text"></div><div class="skeleton" style="width:60px;height:14px"></div></div>
  `).join('');
}


// ═══════════════════════════════════
// Error State
// ═══════════════════════════════════
function showErrorState(title, message) {
  dom.dashboard.innerHTML = `
    <div class="error-state animate-in">
      <div class="error-state__icon">😔</div>
      <h3 class="error-state__title">${title}</h3>
      <p class="error-state__message">${message}</p>
      <button class="btn btn--primary" onclick="resetToWelcome()">Try Again</button>
    </div>
  `;
}

function resetToWelcome() {
  dom.dashboard.style.display = 'none';
  dom.welcomePrompt.style.display = 'flex';
  dom.cityInput.value = '';
  dom.cityInput.focus();
  // Restore dashboard inner HTML structure
  location.reload();
}


// ═══════════════════════════════════
// Render: Current Weather
// ═══════════════════════════════════
function renderCurrentWeather(data) {
  const tempUnit = state.isCelsius ? '°C' : '°F';
  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

  dom.heroWeather.innerHTML = `
    <div class="hero-weather__main animate-in">
      <img class="hero-weather__icon" src="${iconUrl}" alt="${data.weather[0].description}" />
      <div class="hero-weather__info">
        <h2 class="hero-weather__city">
          ${data.name}<span class="hero-weather__country">${data.sys.country}</span>
        </h2>
        <div class="hero-weather__temp">${Math.round(data.main.temp)}${tempUnit}</div>
        <p class="hero-weather__desc">${data.weather[0].description}</p>
        <span class="hero-weather__feels">
          Feels like ${Math.round(data.main.feels_like)}${tempUnit}
        </span>
      </div>
    </div>
    <div class="hero-weather__stats animate-in">
      ${renderStatItem('thermometer', Math.round(data.main.temp_max) + tempUnit + ' / ' + Math.round(data.main.temp_min) + tempUnit, 'Hi / Lo')}
      ${renderStatItem('droplets', data.main.humidity + '%', 'Humidity')}
      ${renderStatItem('wind', data.wind.speed + (state.isCelsius ? ' m/s' : ' mph'), 'Wind')}
      ${renderStatItem('gauge', data.main.pressure + ' hPa', 'Pressure')}
    </div>
  `;

  lucide.createIcons();
}

function renderStatItem(icon, value, label) {
  return `
    <div class="stat-item">
      <div class="stat-item__icon"><i data-lucide="${icon}"></i></div>
      <div class="stat-item__data">
        <div class="stat-item__value">${value}</div>
        <div class="stat-item__label">${label}</div>
      </div>
    </div>
  `;
}


// ═══════════════════════════════════
// Render: Detail Cards
// ═══════════════════════════════════
function renderDetailCards(data) {
  const tempUnit = state.isCelsius ? '°C' : '°F';
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const visibility = data.visibility ? (data.visibility / 1000).toFixed(1) + ' km' : 'N/A';
  const windDir = getWindDirection(data.wind.deg);
  const rainAmount = data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0;
  const cloudiness = data.clouds.all;

  const cards = [
    { icon: 'sunrise', value: sunrise, label: 'Sunrise', color: 'amber' },
    { icon: 'sunset', value: sunset, label: 'Sunset', color: 'rose' },
    { icon: 'eye', value: visibility, label: 'Visibility', color: 'blue' },
    { icon: 'compass', value: windDir + ' (' + data.wind.deg + '°)', label: 'Wind Dir', color: 'teal' },
    { icon: 'cloud-rain', value: rainAmount > 0 ? rainAmount + ' mm' : 'None', label: 'Rain', color: 'purple' },
    { icon: 'cloud', value: cloudiness + '%', label: 'Cloudiness', color: 'green' },
  ];

  dom.detailGrid.innerHTML = cards.map((c, i) => `
    <div class="detail-card animate-in" style="animation-delay: ${i * 0.05}s">
      <div class="detail-card__icon detail-card__icon--${c.color}">
        <i data-lucide="${c.icon}"></i>
      </div>
      <div class="detail-card__info">
        <div class="detail-card__value">${c.value}</div>
        <div class="detail-card__label">${c.label}</div>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function getWindDirection(deg) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}


// ═══════════════════════════════════
// Render: Hourly Forecast
// ═══════════════════════════════════
function renderHourlyForecast(data) {
  const tempUnit = state.isCelsius ? '°C' : '°F';
  const items = data.list.slice(0, 8);

  dom.hourlyContainer.innerHTML = items.map((forecast, i) => {
    const time = new Date(forecast.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    const iconUrl = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
    const rainProb = forecast.pop ? Math.round(forecast.pop * 100) : 0;

    return `
      <div class="hourly-item animate-in" style="animation-delay: ${i * 0.04}s">
        <span class="hourly-item__time">${i === 0 ? 'Now' : time}</span>
        <img class="hourly-item__icon" src="${iconUrl}" alt="${forecast.weather[0].description}" />
        <span class="hourly-item__temp">${Math.round(forecast.main.temp)}${tempUnit}</span>
        ${rainProb > 0 ? `<span class="hourly-item__rain">💧 ${rainProb}%</span>` : ''}
      </div>
    `;
  }).join('');
}


// ═══════════════════════════════════
// Render: Weekly (5-Day) Forecast
// ═══════════════════════════════════
function renderWeeklyForecast(data) {
  const tempUnit = state.isCelsius ? '°C' : '°F';
  const dailyMap = new Map();

  // Group by day and find hi/lo
  for (const item of data.list) {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    if (!dailyMap.has(dayKey)) {
      dailyMap.set(dayKey, {
        dayKey,
        high: item.main.temp_max,
        low: item.main.temp_min,
        icon: item.weather[0].icon,
        desc: item.weather[0].description
      });
    } else {
      const existing = dailyMap.get(dayKey);
      existing.high = Math.max(existing.high, item.main.temp_max);
      existing.low = Math.min(existing.low, item.main.temp_min);
      // Use midday icon if available
      const hours = new Date(item.dt * 1000).getHours();
      if (hours >= 11 && hours <= 14) {
        existing.icon = item.weather[0].icon;
        existing.desc = item.weather[0].description;
      }
    }
  }

  const days = Array.from(dailyMap.values()).slice(0, 5);

  dom.weeklyContainer.innerHTML = days.map((day, i) => {
    const iconUrl = `https://openweathermap.org/img/wn/${day.icon}@2x.png`;

    return `
      <div class="weekly-item animate-in" style="animation-delay: ${i * 0.06}s">
        <span class="weekly-item__day">${i === 0 ? 'Today' : day.dayKey}</span>
        <img class="weekly-item__icon" src="${iconUrl}" alt="${day.desc}" />
        <span class="weekly-item__desc">${day.desc}</span>
        <span class="weekly-item__temps">
          <span class="weekly-item__high">${Math.round(day.high)}°</span>
          <span class="weekly-item__low">${Math.round(day.low)}°</span>
        </span>
      </div>
    `;
  }).join('');
}


// ═══════════════════════════════════
// AQI (Air Quality Index)
// ═══════════════════════════════════
async function fetchAQI(lat, lon) {
  try {
    const res = await fetch(`${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    const data = await res.json();

    if (data.list && data.list.length > 0) {
      renderAQI(data.list[0]);
    }
  } catch (err) {
    dom.aqiContent.innerHTML = '<p style="color:var(--text-muted)">AQI data unavailable</p>';
  }
}

function renderAQI(aqiData) {
  const aqi = aqiData.main.aqi;
  const components = aqiData.components;

  const levels = {
    1: { label: 'Good', class: 'good' },
    2: { label: 'Fair', class: 'fair' },
    3: { label: 'Moderate', class: 'moderate' },
    4: { label: 'Poor', class: 'poor' },
    5: { label: 'Very Poor', class: 'very-poor' }
  };

  const level = levels[aqi] || levels[3];

  dom.aqiContent.innerHTML = `
    <div class="aqi-display animate-in">
      <div class="aqi-badge aqi-badge--${level.class}">
        ${aqi}
        <span class="aqi-badge__label">${level.label}</span>
      </div>
      <div class="aqi-details">
        <h3 class="aqi-details__title">Air Quality: ${level.label}</h3>
        <div class="aqi-pollutants">
          <span class="aqi-pollutant">PM2.5: <span>${components.pm2_5.toFixed(1)}</span></span>
          <span class="aqi-pollutant">PM10: <span>${components.pm10.toFixed(1)}</span></span>
          <span class="aqi-pollutant">O₃: <span>${components.o3.toFixed(1)}</span></span>
          <span class="aqi-pollutant">NO₂: <span>${components.no2.toFixed(1)}</span></span>
          <span class="aqi-pollutant">SO₂: <span>${components.so2.toFixed(1)}</span></span>
          <span class="aqi-pollutant">CO: <span>${components.co.toFixed(0)}</span></span>
        </div>
      </div>
    </div>
  `;
}


// ═══════════════════════════════════
// UV Index
// ═══════════════════════════════════
async function fetchUV(lat, lon) {
  try {
    // Use One Call API alternatives since UV endpoint is deprecated
    // Fall back to estimating UV from current weather data
    const res = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    const data = await res.json();

    // Estimate UV based on cloudiness and time of day
    const clouds = data.clouds.all;
    const now = data.dt;
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;
    const isDay = now >= sunrise && now <= sunset;

    let uvEstimate = 0;
    if (isDay) {
      const dayProgress = (now - sunrise) / (sunset - sunrise);
      // Peak UV at solar noon  
      const solarNoonFactor = 1 - Math.abs(dayProgress - 0.5) * 2;
      uvEstimate = Math.round((10 * solarNoonFactor * (1 - clouds / 150)) * 10) / 10;
      uvEstimate = Math.max(0, Math.min(11, uvEstimate));
    }

    renderUV(uvEstimate);
  } catch (err) {
    dom.uvContent.innerHTML = '<p style="color:var(--text-muted)">UV data unavailable</p>';
  }
}

function renderUV(uv) {
  let level, cls, advice;

  if (uv <= 2) {
    level = 'Low'; cls = 'low';
    advice = 'No protection needed. Enjoy the outdoors!';
  } else if (uv <= 5) {
    level = 'Moderate'; cls = 'moderate';
    advice = 'Wear sunscreen. Seek shade during midday.';
  } else if (uv <= 7) {
    level = 'High'; cls = 'high';
    advice = 'Reduce sun exposure. Use SPF 30+ sunscreen.';
  } else if (uv <= 10) {
    level = 'Very High'; cls = 'very-high';
    advice = 'Extra protection needed. Avoid outdoor exposure.';
  } else {
    level = 'Extreme'; cls = 'extreme';
    advice = 'Stay indoors if possible. Maximum protection required.';
  }

  dom.uvContent.innerHTML = `
    <div class="uv-display animate-in">
      <div class="uv-badge uv-badge--${cls}">
        ${uv}
        <span class="uv-badge__label">${level}</span>
      </div>
      <div class="uv-info">
        <h3 class="uv-info__title">UV Index: ${level}</h3>
        <p class="uv-info__advice">${advice}</p>
      </div>
    </div>
  `;
}


// ═══════════════════════════════════
// Dynamic Background
// ═══════════════════════════════════
function setDynamicBackground(weatherCondition, dt, sunrise, sunset) {
  const isNight = dt < sunrise || dt > sunset;
  let gradient;

  if (isNight) {
    gradient = 'linear-gradient(135deg, #0a0e1a 0%, #1a1a3e 50%, #0d1117 100%)';
  } else {
    switch (weatherCondition) {
      case 'Clear':
        gradient = 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 50%, #0d2137 100%)';
        break;
      case 'Clouds':
        gradient = 'linear-gradient(135deg, #0f1923 0%, #1c2d3f 50%, #141e2b 100%)';
        break;
      case 'Rain':
      case 'Drizzle':
        gradient = 'linear-gradient(135deg, #0a1520 0%, #152535 50%, #0d1a28 100%)';
        break;
      case 'Thunderstorm':
        gradient = 'linear-gradient(135deg, #0a0f18 0%, #1a1528 50%, #0d0f1a 100%)';
        break;
      case 'Snow':
        gradient = 'linear-gradient(135deg, #121a25 0%, #1e2d3f 50%, #182535 100%)';
        break;
      case 'Mist':
      case 'Fog':
      case 'Haze':
        gradient = 'linear-gradient(135deg, #111820 0%, #1c252f 50%, #141c25 100%)';
        break;
      default:
        gradient = 'linear-gradient(135deg, #0a1628 0%, #111d32 50%, #0d1520 100%)';
    }
  }

  // Only apply dynamic bg in dark mode
  if (!state.isLightMode) {
    document.body.style.background = gradient;
  }
}


// ═══════════════════════════════════
// Radar Map
// ═══════════════════════════════════
function initRadarMap(lat, lon) {
  if (!state.map) {
    state.map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([lat, lon], 7);

    // Base tile layer
    const isDark = !state.isLightMode;
    L.tileLayer(
      isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 18 }
    ).addTo(state.map);

    // Add zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(state.map);

    // Default weather layer
    addWeatherLayer('precipitation_new');
  } else {
    state.map.setView([lat, lon], 7);
  }

  // Add city marker
  L.marker([lat, lon]).addTo(state.map);
}

function addWeatherLayer(layerType) {
  if (state.currentLayer) {
    state.map.removeLayer(state.currentLayer);
  }

  state.currentLayer = L.tileLayer(
    `https://tile.openweathermap.org/map/${layerType}/{z}/{x}/{y}.png?appid=${API_KEY}`,
    { opacity: 0.6, maxZoom: 18 }
  ).addTo(state.map);
}

function updateMapLayer(layerType) {
  if (state.map) {
    addWeatherLayer(layerType);
  }
}


// ═══════════════════════════════════
// Weather Alerts
// ═══════════════════════════════════
function checkWeatherAlerts(weatherCondition, windSpeed) {
  let alertTitle = '';
  let alertMessage = '';
  let audioKey = null;
  let toastType = 'warning';

  switch (weatherCondition) {
    case 'Rain':
    case 'Drizzle':
      alertTitle = '🌧️ Rain Alert';
      alertMessage = 'Rain expected! Don\'t forget your umbrella.';
      audioKey = 'rain';
      break;
    case 'Thunderstorm':
      alertTitle = '⛈️ Thunderstorm Alert';
      alertMessage = 'Thunderstorm detected! Stay indoors and stay safe.';
      audioKey = 'thunderstorm';
      toastType = 'danger';
      break;
    case 'Snow':
      alertTitle = '❄️ Snow Alert';
      alertMessage = 'Snowfall ahead! Wear warm clothes and drive carefully.';
      audioKey = 'snow';
      break;
    default:
      if (windSpeed > 10) {
        alertTitle = '💨 High Wind Alert';
        alertMessage = 'Strong winds detected! Be careful outdoors.';
        audioKey = 'wind';
      } else {
        return;
      }
  }

  // Show alert banner
  dom.alertBanner.style.display = 'block';
  dom.alertBannerText.textContent = `${alertTitle}: ${alertMessage}`;

  // Show toast
  showToast(toastType, alertTitle, alertMessage);

  // Play audio
  if (audioKey && audioFiles[audioKey]) {
    audioFiles[audioKey].play().catch(() => {});
  }

  // Browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(alertTitle, { body: alertMessage });
  }
}


// ═══════════════════════════════════
// Toast Notifications
// ═══════════════════════════════════
function showToast(type, title, message) {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;

  const icons = {
    warning: '⚠️',
    danger: '🚨',
    info: 'ℹ️',
    success: '✅'
  };

  toast.innerHTML = `
    <span class="toast__icon">${icons[type] || 'ℹ️'}</span>
    <div class="toast__content">
      <div class="toast__title">${title}</div>
      <div class="toast__message">${message}</div>
    </div>
    <button class="toast__close" onclick="this.parentElement.remove()">&times;</button>
  `;

  dom.toastContainer.appendChild(toast);

  // Auto-dismiss after 5s
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'fadeIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}