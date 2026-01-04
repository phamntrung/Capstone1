import express from 'express';
import axios from 'axios';

const router = express.Router();

// 🌡 Current weather
router.get('/', async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ message: 'City required' });

  try {
    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?q=${encodeURIComponent(city)}&units=metric&appid=${process.env.WEATHER_API_KEY}`;

    const { data } = await axios.get(url);

    res.json({
      city: data.name,
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      weather: data.weather[0].description,
      icon: data.weather[0].icon,
      wind: data.wind.speed
    });
  } catch {
    res.status(404).json({ message: 'City not found' });
  }
});

// 📍 Geo weather
router.get('/geo', async (req, res) => {
  const { lat, lon } = req.query;

  try {
    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.WEATHER_API_KEY}`;

    const { data } = await axios.get(url);

    res.json({
      city: data.name,
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      weather: data.weather[0].description,
      icon: data.weather[0].icon,
      wind: data.wind.speed
    });
  } catch {
    res.status(500).json({ message: 'Geo error' });
  }
});

// 📅 Forecast 5 days
router.get('/forecast', async (req, res) => {
  const { city } = req.query;

  const url =
    `https://api.openweathermap.org/data/2.5/forecast` +
    `?q=${encodeURIComponent(city)}&units=metric&appid=${process.env.WEATHER_API_KEY}`;

  const { data } = await axios.get(url);
  const daily = data.list.filter(i => i.dt_txt.includes('12:00:00'));
  res.json(daily);
});

export default router;
