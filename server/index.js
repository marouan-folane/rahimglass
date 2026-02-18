require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://rahimglass.ma',
    credentials: true,
}));

// Body parsing with size limits (security)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Basic security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Rate limiting (simple in-memory)
const rateLimitMap = new Map();
app.use('/api/auth', (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 20;

    const record = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };
    if (now > record.resetAt) {
        record.count = 0;
        record.resetAt = now + windowMs;
    }
    record.count++;
    rateLimitMap.set(ip, record);

    if (record.count > maxRequests) {
        return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
    }
    next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
function safeUse(pathStr, router, name) {
    try {
        if (typeof router !== 'function') {
            console.error(`❌ Error: ${name} router is not a function (it is ${typeof router}). Check module.exports.`);
        } else {
            app.use(pathStr, router);
            console.log(`✅ ${name} routes loaded.`);
        }
    } catch (err) {
        console.error(`❌ Error loading ${name}:`, err);
    }
}

try {
    safeUse('/api/auth', require('./routes/auth'), 'Auth');
    safeUse('/api/products', require('./routes/products'), 'Products');
    safeUse('/api/categories', require('./routes/categories'), 'Categories');
    safeUse('/api/orders', require('./routes/orders'), 'Orders');
    safeUse('/api/clients', require('./routes/clients'), 'Clients');
} catch (err) {
    console.error('Critical error loading routes:', err);
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 Handler for API ──────────────────────────────────────────────────────
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Route introuvable' });
});

// ─── Serve React Frontend (production) ───────────────────────────────────────
app.use(express.static(path.join(__dirname, '../dist')));

app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const db = require('./db');

db.init().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚀 RahimGlass API Server running on http://localhost:${PORT}`);
        console.log(`   Health:   http://localhost:${PORT}/api/health`);
        console.log(`   Products: http://localhost:${PORT}/api/products\n`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});