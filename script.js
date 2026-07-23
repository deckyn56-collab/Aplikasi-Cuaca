// ========== KONFIGURASI ==========
const API_KEY = '186570cd55b199a2e7ba5336127107de'; // <-- GANTI DENGAN KUNCI API-MU
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// ========== AMBIL ELEMEN HTML ==========
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherDisplay = document.getElementById('weatherDisplay');

// ========== FUNGSI UNTUK MENGAMBIL DATA CUACA ==========
async function getWeather(city) {
    // Tampilkan pesan "Memuat..." saat data sedang diambil
    weatherDisplay.innerHTML = '<p class="loading">⏳ Memuat data cuaca...</p>';

    try {
        // Bangun URL lengkap dengan kota dan API key
        const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=id`;

        // Ambil data dari internet (ini yang namanya fetch API)
        const response = await fetch(url);

        // Cek apakah kota ditemukan (response status 404 artinya tidak ditemukan)
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Kota tidak ditemukan. Coba lagi.');
            } else {
                throw new Error('Terjadi kesalahan. Coba lagi nanti.');
            }
        }

        // Ubah data dari format JSON menjadi objek JavaScript
        const data = await response.json();

        // Tampilkan data cuaca di layar
        displayWeather(data);

    } catch (error) {
        // Tangkap error dan tampilkan pesan error di layar
        weatherDisplay.innerHTML = `<p class="error-message">❌ ${error.message}</p>`;
    }
}

// ========== FUNGSI UNTUK MENAMPILKAN CUACA ==========
function displayWeather(data) {
    // Ambil data yang diperlukan dari objek 'data'
    const cityName = data.name;
    const country = data.sys.country;
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const iconCode = data.weather[0].icon;

    // Pilih ikon emoji berdasarkan kode cuaca dari API
    const weatherEmoji = getWeatherEmoji(iconCode);

    // Buat tampilan HTML untuk informasi cuaca
    weatherDisplay.innerHTML = `
        <div class="city-name">${cityName}, ${country}</div>
        <div class="weather-icon">${weatherEmoji}</div>
        <div class="temperature">${temp}°C</div>
        <div class="description">${description.charAt(0).toUpperCase() + description.slice(1)}</div>
        <div class="weather-details">
            <div>
                <span class="label">Terasa Seperti</span>
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
        </div>
    `;
}

// ========== FUNGSI BANTU UNTUK EMOJI CUACA ==========
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

// ========== EVENT LISTENER UNTUK TOMBOL CARI ==========
searchBtn.addEventListener('click', function() {
    const city = cityInput.value.trim();
    if (city === '') {
        alert('Masukkan nama kota!');
        return;
    }
    getWeather(city);
});

// ========== TEKAN ENTER UNTUK MENCARI ==========
cityInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// ========== INISIALISASI: TAMPILKAN CUACA SATU KOTA DEFAULT ==========
// Saat halaman pertama dibuka, langsung tampilkan cuaca Jakarta
window.onload = function() {
    getWeather('Jakarta');
};