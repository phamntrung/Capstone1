import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import weatherRoutes from './routes/weather.routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===== API ROUTES ===== */
app.use('/api/weather', weatherRoutes);

/* ===== SERVE FRONTEND ===== */
app.use(express.static(path.join(__dirname, '../frontend')));

/* ❌ KHÔNG DÙNG app.get('*') NỮA */

/* ===== START SERVER ===== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('✅ Server started');
  console.log(`🌤 Weather App: http://localhost:${PORT}`);
});
