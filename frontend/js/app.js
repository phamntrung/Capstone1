// ===== LANGUAGE =====
let lang = localStorage.getItem('lang') || 'vi';
let tempChart = null;

const i18n = {
  vi: { title: '🌤️ Thời tiết', search: 'Xem thời tiết' },
  en: { title: '🌤️ Weather', search: 'Search' }
};

function toggleLang() {
  lang = lang === 'vi' ? 'en' : 'vi';
  localStorage.setItem('lang', lang);
  applyLang();
}

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el =>
    el.innerText = i18n[lang][el.dataset.i18n]
  );
}

// ===== THEME =====
function toggleTheme() {
  document.body.classList.toggle('dark');
}

// ===== NORMALIZE CITY =====
function normalizeCity(city) {
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

// ===== WEATHER =====
function getWeather(cityParam) {
  let city = cityParam || document.getElementById('city').value.trim();
  city = normalizeCity(city);

  const result = document.getElementById('result');
  const loading = document.getElementById('loading');

  loading.classList.remove('hidden');
  result.innerHTML = '';

  fetch(`/api/weather?city=${encodeURIComponent(city)}`)
    .then(res => {
      if (!res.ok) throw 0;
      return res.json();
    })
    .then(data => {
      loading.classList.add('hidden');
      result.innerHTML = `
        <h3>${city}</h3>
        <p>🌡️ ${data.temp}°C</p>
        <p>💧 ${data.humidity}%</p>
        <p>🌤️ ${data.weather}</p>
        <img src="https://openweathermap.org/img/wn/${data.icon}@2x.png">
      `;
      saveHistory(city);
      getForecast(city);
    })
    .catch(() => {
      loading.classList.add('hidden');
      result.innerHTML = `<p style="color:red">Không tìm thấy dữ liệu</p>`;
    });
}

// ===== GEO =====
function getByLocation() {
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

// ===== FORECAST =====
function getForecast(city) {
  fetch(`/api/weather/forecast?city=${city}`)
    .then(res => res.json())
    .then(days => {
      document.getElementById('forecast').innerHTML =
        days.map(d => `
          <div>
            <div>${d.dt_txt.slice(5,10)}</div>
            <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png">
            <div>${Math.round(d.main.temp)}°</div>
          </div>
        `).join('');
         drawChart(days); // ✅ CHỈ THÊM DÒNG NÀY
    });
}

// ===== HISTORY =====
function saveHistory(city) {
  let history = JSON.parse(localStorage.getItem('history') || '[]');
  if (!history.includes(city)) history.unshift(city);
  history = history.slice(0,5);
  localStorage.setItem('history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('history') || '[]');
  document.getElementById('history').innerHTML =
    history.map(c => `<button onclick="getWeather('${c}')">${c}</button>`).join('');
}

window.onload = () => {
  applyLang();
  renderHistory();
};
function drawChart(days) {
  const canvas = document.getElementById('tempChart');
  if (!canvas) return;

  const labels = days.map(d =>
    d.dt_txt.split(' ')[0].slice(5)
  );

  const temps = days.map(d =>
    Math.round(d.main.temp)
  );

  if (tempChart) tempChart.destroy();

  tempChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: temps,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.25)',
        tension: 0.4,
        fill: true
      }]
    }
  });
}
