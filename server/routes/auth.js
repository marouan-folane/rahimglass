const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { signToken, requireAuth } = require('../auth');

const router = express.Router();

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    const { email, password, name, phone } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    try {
        const hashed = bcrypt.hashSync(password, 12);
        const userId = require('crypto').randomUUID();

        await db.prepare('INSERT INTO users (id, email, password) VALUES (?, ?, ?)').run(userId, email.toLowerCase().trim(), hashed);
        await db.prepare('INSERT INTO profiles (id, name, phone, role) VALUES (?, ?, ?, ?)').run(userId, name || null, phone || null, 'customer');

        const profile = await db.prepare('SELECT * FROM profiles WHERE id = ?').get(userId);
        const token = signToken({ id: userId, email, role: 'customer' });

        res.status(201).json({ token, user: { id: userId, email }, profile });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const profile = await db.prepare('SELECT * FROM profiles WHERE id = ?').get(user.id);
    const token = signToken({ id: user.id, email: user.email, role: profile?.role || 'customer' });

    res.json({ token, user: { id: user.id, email: user.email }, profile });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
    const user = await db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(req.user.id);
    const profile = await db.prepare('SELECT * FROM profiles WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ user, profile });
});

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
router.put('/profile', requireAuth, async (req, res) => {
    const { name, phone, address } = req.body;
    await db.prepare('UPDATE profiles SET name = ?, phone = ?, address = ? WHERE id = ?')
        .run(name || null, phone || null, address || null, req.user.id);
    const profile = await db.prepare('SELECT * FROM profiles WHERE id = ?').get(req.user.id);
    res.json({ profile });
});

module.exports = router;
