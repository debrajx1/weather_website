# ⛅ WeatherPro — Real-Time Weather Forecast

A sleek, professional weather application built with vanilla HTML, CSS & JavaScript. Get real-time weather data, hourly & 5-day forecasts, air quality index, UV levels, and interactive radar maps — all in a stunning glassmorphism UI.

![Dark Mode](https://img.shields.io/badge/Theme-Dark%20%2F%20Light-blue?style=for-the-badge)
![Vanilla JS](https://img.shields.io/badge/Built%20With-Vanilla%20JS-yellow?style=for-the-badge)
![API](https://img.shields.io/badge/API-OpenWeatherMap-orange?style=for-the-badge)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌡️ **Current Weather** | Temperature, humidity, wind, pressure, visibility, cloudiness |
| 🕐 **Hourly Forecast** | 8-hour scrollable forecast with rain probability |
| 📅 **5-Day Forecast** | Daily hi/lo temperatures with weather descriptions |
| 🌫️ **Air Quality Index** | Real-time AQI with pollutant breakdown (PM2.5, PM10, O₃, NO₂, SO₂, CO) |
| ☀️ **UV Index** | Color-coded UV level with health advice |
| 🗺️ **Live Radar Map** | Interactive Leaflet map with switchable layers (Rain, Temp, Clouds, Wind) |
| 📍 **Geolocation** | Auto-detect your location for instant weather |
| 🌙 **Dark / Light Mode** | Full theme support with localStorage persistence |
| 🔔 **Weather Alerts** | Toast notifications + audio alerts for severe weather |
| 💾 **Preferences** | Unit (°C/°F) and theme saved across sessions |
| 📱 **Responsive** | Fully responsive on mobile, tablet and desktop |
| ⌨️ **Keyboard Support** | Press Enter to search |

---

## 🖼️ Preview

### Dark Mode
> Glassmorphism cards, gradient accents, animated weather icons, and a professional dark interface.

### Light Mode
> Clean, bright design with proper contrast and readable typography.

---

## 🛠️ Tech Stack

- **HTML5** — Semantic structure with accessibility (ARIA labels)
- **CSS3** — Custom properties, glassmorphism, `@keyframes` animations, responsive breakpoints
- **JavaScript (ES6+)** — Async/await, Fetch API, modular architecture
- **[Leaflet.js](https://leafletjs.com/)** — Interactive maps with weather tile overlays
- **[Lucide Icons](https://lucide.dev/)** — Lightweight SVG icon library
- **[Google Fonts (Inter)](https://fonts.google.com/specimen/Inter)** — Modern typography
- **[OpenWeatherMap API](https://openweathermap.org/api)** — Weather data, forecasts, AQI

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Edge, Firefox, Safari)
- An [OpenWeatherMap API key](https://openweathermap.org/appkeys) (free tier works)

### Step 1: Clone the Repository

```bash
git clone https://github.com/debrajx1/weather-forecast.git
cd weather-forecast
```

Or download the ZIP from GitHub and extract it.

### Step 2: Add Your API Key

Open `script.js` and replace the API key on **line 9**:

```js
const API_KEY = "YOUR_API_KEY_HERE";
```

> 💡 **How to get a free API key:**
> 1. Go to [openweathermap.org](https://openweathermap.org/) and create a free account
> 2. Navigate to **My API Keys** in your profile
> 3. Copy the default key or generate a new one
> 4. Paste it in `script.js`

### Step 3: Run the App

You have **3 ways** to run the project:

#### Option A: Direct File Open (Simplest)
Just double-click `index.html` — it will open in your default browser. That's it!

```
📂 weather-forecast → 🖱️ double-click index.html → ✅ App opens!
```

#### Option B: VS Code Live Server (Recommended for Development)
If you use **VS Code**:
1. Install the **Live Server** extension
2. Right-click `index.html` → **"Open with Live Server"**
3. App opens at `http://127.0.0.1:5500`

#### Option C: Python HTTP Server
```bash
# Python 3
python -m http.server 8000

# Then open in browser
# http://localhost:8000
```

---

## 📖 How to Use

1. **Search a City** — Type any city name (e.g., "Mumbai", "London", "Tokyo") in the search bar and press **Enter** or click **Search**
2. **Use My Location** — Click the 📍 pin button to auto-detect your current location
3. **Switch Units** — Toggle the **°C / °F** switch to change temperature units
4. **Change Theme** — Click the 🌙/☀️ button to switch between dark and light mode
5. **Radar Map Layers** — Click **Rain**, **Temp**, **Clouds**, or **Wind** buttons to switch weather overlays on the map
6. **Scroll Hourly Forecast** — Swipe/scroll horizontally through the 8-hour forecast cards
7. **Weather Alerts** — If severe weather is detected, you'll see a toast notification and hear an audio alert

---

## 📁 Project Structure

```
weather-forecast/
├── index.html          # Main HTML page
├── style.css           # Complete styling (design system + responsive)
├── script.js           # App logic (API calls, rendering, interactions)
├── audio/
│   ├── rain_alert.mp3
│   ├── snow_alert.mp3
│   ├── thunderstorm_alert.mp3
│   └── wind_alert.mp3
└── README.md
```

---

## 🔑 API Usage

This app uses the **OpenWeatherMap** free tier APIs:

| Endpoint | Purpose |
|----------|---------|
| `/weather` | Current weather data |
| `/forecast` | 5-day / 3-hour forecast |
| `/air_pollution` | Air Quality Index (AQI) |
| Map tiles | Radar overlays (precipitation, temperature, clouds, wind) |

> **Note:** The free tier allows 1,000 API calls/day — more than enough for personal use.

---

## 🎨 Design Highlights

- **Glassmorphism** — `backdrop-filter: blur()` with semi-transparent cards
- **CSS Custom Properties** — 40+ design tokens for colors, spacing, typography
- **Skeleton Loaders** — Shimmer effect while data loads
- **Micro-animations** — Float, fade-in, pulse glow, staggered card reveals
- **Dynamic Backgrounds** — Gradient changes based on weather condition & time of day

---

## 📱 Responsive Breakpoints

| Breakpoint | Target |
|------------|--------|
| `≤ 480px` | Mobile phones |
| `≤ 768px` | Tablets |
| `≤ 1024px` | Small laptops |
| `> 1024px` | Desktops |

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Debraj Naik** — [@debrajx1](https://github.com/debrajx1)

---

<p align="center">
  Crafted with ❤️ by <a href="https://github.com/debrajx1">Debraj Naik</a>
</p>
