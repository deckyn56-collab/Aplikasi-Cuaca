// ========== KONFIGURASI ==========
const API_KEY = '186570cd55b199a2e7ba5336127107de';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// ========== AMBIL ELEMEN HTML ==========
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const weatherDisplay = document.getElementById('weatherDisplay');
const forecastList = document.getElementById('forecastList');
const appContainer = document.getElementById('appContainer');

// ========== FUNGSI CUACA SAAT INI ==========
async function getWeather(city) {
    weatherDisplay.innerHTML = '<p class="loading">⏳ Memuat data cuaca...</p>';

    try {
        const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=id`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Kota tidak ditemukan. Coba lagi.');
            } else {
                throw new Error('Terjadi kesalahan. Coba lagi nanti.');
            }
        }

        const data = await response.json();
        displayWeather(data);
        updateBackground(data.weather[0].icon);
        
        // Ambil prakiraan setelah cuaca muncul
        getForecast(city);

    } catch (error) {
        weatherDisplay.innerHTML = `<p class="error-message">❌ ${error.message}</p>`;
    }
}

// ========== TAMPILKAN CUACA ==========
function displayWeather(data) {
    const cityName = data.name;
    const country = data.sys.country;
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const pressure = data.main.pressure;
    const visibility = data.visibility / 1000;
    const iconCode = data.weather[0].icon;
    const weatherEmoji = getWeatherEmoji(iconCode);

    weatherDisplay.innerHTML = `
        <div class="city-name">${cityName}, ${country}</div>
        <div class="weather-icon">${weatherEmoji}</div>
        <div class="temperature">${temp}°C</div>
        <div class="description">${description.charAt(0).toUpperCase() + description.slice(1)}</div>
        <div class="weather-details">
            <div>
                <span class="label">Terasa</span>
                <span class="value">${feelsLike}°C</span>
            </div>
            <div>
                <span class="label">Kelembaban</span>
                <span class="value">${humidity}%</span>
            </div>
            <div>
                <span class="label">Angin</span>
                <span class="value">${windSpeed} m/s</span>
            </div>
            <div>
                <span class="label">Tekanan</span>
                <span class="value">${pressure} hPa</span>
            </div>
            <div>
                <span class="label">Jarak Pandang</span>
                <span class="value">${visibility} km</span>
            </div>
            <div>
                <span class="label">Cuaca</span>
                <span class="value">${data.weather[0].main}</span>
            </div>
        </div>
    `;
}

// ========== FUNGSI PRAKIRAAN 5 HARI ==========
async function getForecast(city) {
    forecastList.innerHTML = '<p class="loading">⏳ Memuat prakiraan...</p>';

    try {
        const url = `${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=id`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Gagal memuat prakiraan.');
        }

        const data = await response.json();
        displayForecast(data.list);

    } catch (error) {
        forecastList.innerHTML = `<p class="error-message">❌ ${error.message}</p>`;
    }
}

// ========== TAMPILKAN PRAKIRAAN ==========
function displayForecast(forecastData) {
    // Ambil data setiap 8 interval (setiap 24 jam)
    const dailyForecast = forecastData.filter((item, index) => index % 8 === 0).slice(0, 5);
    
    if (dailyForecast.length === 0) {
        forecastList.innerHTML = '<p>Tidak ada data prakiraan.</p>';
        return;
    }

    forecastList.innerHTML = '';
    
    dailyForecast.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
        const temp = Math.round(item.main.temp);
        const description = item.weather[0].description;
        const icon = getWeatherEmoji(item.weather[0].icon);

        const div = document.createElement('div');
        div.className = 'forecast-item';
        div.innerHTML = `
            <span class="time">${day}</span>
            <span class="icon">${icon}</span>
            <span class="desc">${description}</span>
            <span class="temp">${temp}°C</span>
        `;
        forecastList.appendChild(div);
    });
}

// ========== EMOJI CUACA ==========
function getWeatherEmoji(iconCode) {
    const iconMap = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '🌍';
}

// ========== BACKGROUND DINAMIS ==========
function updateBackground(iconCode) {
    const body = document.body;
    // Hapus semua class background sebelumnya
    body.className = '';
    
    if (iconCode.includes('01') || iconCode.includes('02')) {
        body.classList.add('sunny');
    } else if (iconCode.includes('09') || iconCode.includes('10') || iconCode.includes('11')) {
        body.classList.add('rainy');
    } else if (iconCode.includes('03') || iconCode.includes('04')) {
        body.classList.add('cloudy');
    } else if (iconCode.includes('13')) {
        body.classList.add('snowy');
    }
}

// ========== LOKASI SAYA (GPS) ==========
function getLocation() {
    if (!navigator.geolocation) {
        alert('Browser tidak mendukung GPS.');
        return;
    }

    weatherDisplay.innerHTML = '<p class="loading">📍 Mendapatkan lokasi...</p>';
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            try {
                const url = `${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=id`;
                const response = await fetch(url);
                const data = await response.json();
                displayWeather(data);
                updateBackground(data.weather[0].icon);
                getForecast(data.name);
                cityInput.value = data.name;
            } catch (error) {
                weatherDisplay.innerHTML = `<p class="error-message">❌ Gagal mengambil cuaca lokasi.</p>`;
            }
        },
        (error) => {
            let msg = 'Gagal mendapatkan lokasi. ';
            if (error.code === 1) msg += 'Izinkan akses lokasi di HP.';
            else if (error.code === 2) msg += 'Sinyal GPS lemah.';
            else msg += 'Coba lagi.';
            weatherDisplay.innerHTML = `<p class="error-message">❌ ${msg}</p>`;
        }
    );
}

// ========== EVENT LISTENER ==========
searchBtn.addEventListener('click', function() {
    const city = cityInput.value.trim();
    if (city === '') {
        alert('Masukkan nama kota!');
        return;
    }
    getWeather(city);
});

cityInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

locationBtn.addEventListener('click', getLocation);

// ========== INISIALISASI ==========
window.onload = function() {
    getWeather('Jakarta');
};