// server.js - Main Express application entry point
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - allow same-origin requests from the frontend
app.use(cors({
    origin: true,
    credentials: true
}));

// Trust Render's proxy (needed for secure cookies on HTTPS)
app.set('trust proxy', 1);

// Session configuration
const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
    secret: process.env.SESSION_SECRET || 'caretrack-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 8
    }
}));

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/doctors',   require('./routes/doctors'));
app.use('/api/patients',  require('./routes/patients'));
app.use('/api/illnesses', require('./routes/illnesses'));

// ── Frontend Routes ──────────────────────────────────────────
// Redirect root to login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`CareTrack MRMS running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
});
