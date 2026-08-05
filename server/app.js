const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB();

// 1. Inisialisasi CORS dan Body Parser di awal
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 2. Daftarkan folder statis uploads yang tepat (mengarah ke /api/uploads di root project)
// Karena app.js ada di dalam folder server/, kita pakai '../api/uploads'
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'quality-audit-suite-api' });
});

// API Routes
const apiRoutes = require('./routes/apiRoutes');
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});