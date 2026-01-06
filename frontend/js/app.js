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
   LANGUAGE
===================================================== */
function toggleLang() {
  lang = lang === 'vi' ? 'en' : 'vi';
  localStorage.setItem('lang', lang);
  applyLang();
  if (tempChart) tempChart.update();
}

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (i18n[lang][key]) el.innerText = i18n[lang][key];
  });

  const cityInput = document.getElementById('city');
  if (cityInput) cityInput.placeholder = i18n[lang].placeholder;

  const loading = document.getElementById('loading');
  if (loading) loading.innerText = i18n[lang].loading;
}

/* =====================================================
   THEME
===================================================== */
function toggleTheme() {
  document.body.classList.toggle('dark');
}

/* =====================================================
   UNIT °C / °F
===================================================== */
function toDisplayTemp(c) {
  return unit === 'F' ? Math.round(c * 9 / 5 + 32) : Math.round(c);
}
function unitLabel() {
  return unit === 'F' ? '°F' : '°C';
}
function toggleUnit() {
  unit = unit === 'C' ? 'F' : 'C';
  localStorage.setItem('unit', unit);

  const city = document.getElementById('city').value;
  if (city) getWeather(city);

  if (tempChart) {
    tempChart.data.datasets[0].label =
      `${i18n[lang].chartLabel} (${unitLabel()})`;
    tempChart.update();
  }
}

/* =====================================================
   NORMALIZE CITY
===================================================== */
function normalizeCity(city) {
  if (!city) return '';
  const map = {
    'hà nội': 'Hanoi',
    'ha noi': 'Hanoi',
    'đà nẵng': 'Da Nang',
    'da nang': 'Da Nang',
    'tp hcm': 'Ho Chi Minh City',
    'ho chi minh': 'Ho Chi Minh City'
  };
  return map[city.toLowerCase()] || city;
}

/* =====================================================
   WEATHER – CURRENT
===================================================== */
function getWeather(cityParam) {
  let city = normalizeCity(cityParam || document.getElementById('city').value);
  if (!city) return;

  const result = document.getElementById('result');
  const loading = document.getElementById('loading');
  const suggestionEl = document.getElementById('suggestion');

  loading.classList.remove('hidden');
  result.innerHTML = '';
  if (suggestionEl) suggestionEl.innerHTML = '';

  fetch(`/api/weather?city=${encodeURIComponent(city)}`)
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      loading.classList.add('hidden');

      result.innerHTML = `
        <h3>${data.city}</h3>
        <p>🌡️ ${toDisplayTemp(data.temp)}${unitLabel()}</p>
        <p>💧 ${data.humidity}%</p>
        <p>🌤️ ${data.weather}</p>
        <img src="https://openweathermap.org/img/wn/${data.icon}@2x.png">
      `;

      if (suggestionEl) {
        const tips = generateSuggestion(data);
        suggestionEl.innerHTML = tips.length
          ? tips.map(t => `<p>${t}</p>`).join('')
          : '';
      }

      saveHistory(city);
      getForecast(city);
    })
    .catch(() => {
      loading.classList.add('hidden');
      result.innerHTML = `<p style="color:red">${i18n[lang].notFound}</p>`;
    });
}

/* =====================================================
   FORECAST
===================================================== */
function getForecast(city) {
  fetch(`/api/weather/forecast?city=${encodeURIComponent(city)}`)
    .then(r => r.json())
    .then(days => {
      document.getElementById('forecast').innerHTML = days.map(d => `
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
   HISTORY
===================================================== */
function saveHistory(city) {
  let h = JSON.parse(localStorage.getItem('history') || '[]');
  if (!h.includes(city)) h.unshift(city);
  localStorage.setItem('history', JSON.stringify(h.slice(0, 5)));
  renderHistory();
}
function renderHistory() {
  const h = JSON.parse(localStorage.getItem('history') || '[]');
  document.getElementById('history').innerHTML =
    h.map(c => `<button onclick="getWeather('${c}')">${c}</button>`).join('');
}

/* =====================================================
   CHART
===================================================== */
function drawChart(days) {
  const ctx = document.getElementById('tempChart');
  if (!ctx || !Chart) return;

  if (tempChart) tempChart.destroy();

  tempChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days.map(d => d.dt_txt.slice(5, 10)),
      datasets: [{
        label: `${i18n[lang].chartLabel} (${unitLabel()})`,
        data: days.map(d => toDisplayTemp(d.main.temp)),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,.25)',
        tension: .4,
        fill: true
      }]
    }
  });
}

/* =====================================================
   SMART SUGGESTION
===================================================== */
function generateSuggestion(data) {
  if (!data || !data.weather) return [];

  const tips = [];
  const w = data.weather.toLowerCase();

  if (w.includes('rain')) tips.push('🌧 Thời tiết xấu: Có mưa');
  if (data.temp >= 35) tips.push('🥵 Thời tiết xấu: Nắng nóng gay gắt');
  if (data.wind >= 8) tips.push('🌬 Thời tiết xấu: Gió mạnh');

  // ⭐ Nếu KHÔNG có yếu tố xấu
  if (tips.length === 0) {
    tips.push('✅ Thời tiết hôm nay khá thuận lợi');
  }

  return tips;
}

/* =====================================================
   VOICE (NHẬN DIỆN – KHÔNG ĐỌC)
===================================================== */
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = SpeechRecognition ? new SpeechRecognition() : null;

function startVoiceSearch() {
  if (!recognition) return alert('Trình duyệt không hỗ trợ voice');
  recognition.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
  recognition.start();
}

if (recognition) {
  recognition.onresult = e => {
    const text = e.results[0][0].transcript.toLowerCase();
    console.log('🎙 Voice:', text);

    if (text.includes('độ f')) toggleUnit();
    else if (text.includes('độ c')) toggleUnit();
    else {
      const city = normalizeCity(text.replace('thời tiết', '').trim());
      document.getElementById('city').value = city;
      getWeather(city);
    }
  };
}

/* =====================================================
   INIT
===================================================== */
window.onload = () => {
  applyLang();
  renderHistory();
};

/* =====================================================
   DISABLE TTS
===================================================== */
function speak(_) {}
/* =====================================================
   WEATHER INTELLIGENCE (SCORE + LEVEL + ACTIVITIES)
===================================================== */

/**
 * Chấm điểm thời tiết (0–100)
 */
function calculateWeatherScore(data) {
  let score = 100;
  const w = data.weather.toLowerCase();

  // 🌧 Rain
  if (w.includes('rain')) score -= 25;
  if (w.includes('storm') || w.includes('thunder')) score -= 40;

  // 🌡 Temperature
  if (data.temp >= 35) score -= 30;
  if (data.temp <= 10) score -= 20;

  // 🌬 Wind
  if (data.wind >= 8) score -= 20;

  // 💧 Humidity
  if (data.humidity >= 85) score -= 10;

  return Math.max(0, Math.min(score, 100));
}

/**
 * Đánh giá mức độ thời tiết
 */
function getWeatherLevel(score) {
  if (score >= 80) return { level: 'Good', icon: '🟢' };
  if (score >= 50) return { level: 'Normal', icon: '🟡' };
  return { level: 'Bad', icon: '🔴' };
}

/**
 * Gợi ý hoạt động (rule-based như AI)
 */
function suggestActivities(score, data) {
  const activities = [];
  const w = data.weather.toLowerCase();

  if (score >= 80) {
    activities.push('🏖️ Đi dạo, cà phê ngoài trời');
    activities.push('🏃‍♂️ Tập thể dục ngoài trời');
  } 
  else if (score >= 50) {
    activities.push('🛍️ Đi mua sắm, hoạt động trong nhà');
    activities.push('🏠 Hoạt động nhẹ nhàng');
  } 
  else {
    activities.push('🏠 Nên ở trong nhà');
    activities.push('📺 Xem phim, đọc sách');
  }

  if (w.includes('rain')) {
    activities.push('☔ Mang theo áo mưa nếu ra ngoài');
  }

  if (data.temp >= 35) {
    activities.push('🥤 Uống đủ nước, tránh nắng trưa');
  }

  return activities;
}
  