/* =====================================================
   GLOBAL STATE
===================================================== */
let lang = localStorage.getItem('lang') || 'vi';
let unit = localStorage.getItem('unit') || 'C'; // 'C' | 'F'
let tempChart = null;

/* =====================================================
   I18N DICTIONARY
===================================================== */
const i18n = {
  vi: {
    title: '🌤️ Thời tiết',
    search: 'Xem thời tiết',
    placeholder: 'Ví dụ: Hà Nội, Đà Nẵng',
    loading: '⏳ Đang tải dữ liệu...',
    location: '📍 Vị trí hiện tại',
    notFound: '❌ Không tìm thấy dữ liệu',
    temp: 'Nhiệt độ',
    humidity: 'Độ ẩm',
    weather: 'Thời tiết',
    wind: 'Gió',
    forecast: 'Dự báo 5 ngày',
    history: 'Lịch sử tìm kiếm',
    chartLabel: 'Nhiệt độ'
  },
  en: {
    title: '🌤️ Weather',
    search: 'Search weather',
    placeholder: 'Example: Hanoi, Da Nang',
    loading: '⏳ Loading data...',
    location: '📍 Current location',
    notFound: '❌ Data not found',
    temp: 'Temperature',
    humidity: 'Humidity',
    weather: 'Condition',
    wind: 'Wind',
    forecast: '5-Day Forecast',
    history: 'Search history',
    chartLabel: 'Temperature'
  }
};

/* =====================================================
   LANGUAGE HANDLING
===================================================== */
function toggleLang() {
  lang = lang === 'vi' ? 'en' : 'vi';
  localStorage.setItem('lang', lang);
  applyLang();

  // re-render chart label if exists
  if (tempChart) tempChart.update();
}

function applyLang() {
  // Static text
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (i18n[lang][key]) {
      el.innerText = i18n[lang][key];
    }
  });

  // Input placeholder
  const cityInput = document.getElementById('city');
  if (cityInput) {
    cityInput.placeholder = i18n[lang].placeholder;
  }

  // Loading text
  const loading = document.getElementById('loading');
  if (loading) {
    loading.innerText = i18n[lang].loading;
  }
}

/* =====================================================
   THEME
===================================================== */
function toggleTheme() {
  document.body.classList.toggle('dark');
}

/* =====================================================
   UNIT (°C ↔ °F)
===================================================== */
function toDisplayTemp(celsius) {
  if (unit === 'F') {
    return Math.round(celsius * 9 / 5 + 32);
  }
  return Math.round(celsius);
}

function unitLabel() {
  return unit === 'F' ? '°F' : '°C';
}

function toggleUnit() {
  unit = unit === 'C' ? 'F' : 'C';
  localStorage.setItem('unit', unit);

  const city = document.getElementById('city').value;
  if (city) getWeather(city);
}

/* =====================================================
   NORMALIZE CITY NAME
===================================================== */
function normalizeCity(city) {
  if (!city) return city;

  const map = {
    'ha noi': 'Hanoi',
    'hà nội': 'Hanoi',
    'da nang': 'Da Nang',
    'đà nẵng': 'Da Nang',
    'tp hcm': 'Ho Chi Minh City',
    'ho chi minh': 'Ho Chi Minh City'
  };

  return map[city.toLowerCase()] || city;
}

/* =====================================================
   WEATHER – CURRENT
===================================================== */
function getWeather(cityParam) {
  let city = cityParam || document.getElementById('city').value.trim();
  city = normalizeCity(city);
  if (!city) return;

  const result = document.getElementById('result');
  const loading = document.getElementById('loading');

  loading.classList.remove('hidden');
  result.innerHTML = '';

  fetch(`/api/weather?city=${encodeURIComponent(city)}`)
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      loading.classList.add('hidden');

      result.innerHTML = `
        <h3>${data.city || city}</h3>
        <p>
          🌡️ ${i18n[lang].temp}:
          ${toDisplayTemp(data.temp)}${unitLabel()}
        </p>
        <p>💧 ${i18n[lang].humidity}: ${data.humidity}%</p>
        <p>🌤️ ${i18n[lang].weather}: ${data.weather}</p>
        <img src="https://openweathermap.org/img/wn/${data.icon}@2x.png" alt="weather">
      `;

      saveHistory(city);
      getForecast(city);
    })
    .catch(() => {
      loading.classList.add('hidden');
      result.innerHTML = `<p style="color:red">${i18n[lang].notFound}</p>`;
    });
}

/* =====================================================
   WEATHER – GEO LOCATION
===================================================== */
function getByLocation() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;

    fetch(`/api/weather/geo?lat=${latitude}&lon=${longitude}`)
      .then(res => res.json())
      .then(data => {
        document.getElementById('city').value = data.city;
        getWeather(data.city);
      });
  });
}

/* =====================================================
   FORECAST – 5 DAYS
===================================================== */
function getForecast(city) {
  fetch(`/api/weather/forecast?city=${encodeURIComponent(city)}`)
    .then(res => res.json())
    .then(days => {
      const forecastEl = document.getElementById('forecast');

      forecastEl.innerHTML = days.map(d => `
        <div class="day">
          <div>${d.dt_txt.slice(5, 10)}</div>
          <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png">
          <div>${toDisplayTemp(d.main.temp)}${unitLabel()}</div>
        </div>
      `).join('');

      drawChart(days);
    });
}

/* =====================================================
   SEARCH HISTORY
===================================================== */
function saveHistory(city) {
  let history = JSON.parse(localStorage.getItem('history') || '[]');

  if (!history.includes(city)) {
    history.unshift(city);
  }

  history = history.slice(0, 5);
  localStorage.setItem('history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('history') || '[]');
  const historyEl = document.getElementById('history');

  historyEl.innerHTML = history
    .map(c => `<button onclick="getWeather('${c}')">${c}</button>`)
    .join('');
}

/* =====================================================
   CHART – TEMPERATURE
===================================================== */
function drawChart(days) {
  const canvas = document.getElementById('tempChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const labels = days.map(d => d.dt_txt.split(' ')[0].slice(5));
  const temps = days.map(d => toDisplayTemp(d.main.temp));

  if (tempChart) tempChart.destroy();

  tempChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `${i18n[lang].chartLabel} (${unitLabel()})`,
        data: temps,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.25)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: {
          ticks: {
            callback: v => v + unitLabel()
          }
        }
      }
    }
  });
}

/* =====================================================
   INIT
===================================================== */
window.onload = () => {
  applyLang();
  renderHistory();
};
/* =====================================================
   VOICE SEARCH (Speech Recognition)
===================================================== */

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

/**
 * Bắt đầu nghe giọng nói
 */
function startVoiceSearch() {
  if (!recognition) {
    alert('Trình duyệt không hỗ trợ voice search');
    return;
  }

  recognition.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
  recognition.start();

  showListening(true);
}

/**
 * Khi có kết quả
 */
if (recognition) {
  recognition.onresult = event => {
    const speechText = event.results[0][0].transcript;
    console.log('🎙 Voice:', speechText);

    const city = extractCityFromSpeech(speechText);

    if (city) {
      document.getElementById('city').value = city;
      getWeather(city);
    } else {
      alert('Không nhận diện được địa điểm');
    }

    showListening(false);
  };

  recognition.onerror = err => {
    console.error('Voice error:', err);
    showListening(false);
  };

  recognition.onend = () => {
    showListening(false);
  };
}

/**
 * Tách tên địa điểm từ câu nói
 */
function extractCityFromSpeech(text) {
  text = text.toLowerCase();

  // 🇻🇳 Tiếng Việt
  if (lang === 'vi') {
    return text
      .replace('thời tiết', '')
      .replace('ở', '')
      .replace('tại', '')
      .trim();
  }

  // 🇺🇸 English
  return text
    .replace('weather in', '')
    .replace('weather', '')
    .replace('in', '')
    .trim();
}

/**
 * UI khi đang nghe
 */
function showListening(isListening) {
  const body = document.body;
  body.classList.toggle('listening', isListening);
}
