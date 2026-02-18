const express = require('express');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../auth');

const router = express.Router();

// ─── GET /api/categories ──────────────────────────────────────────────────────
// Public
router.get('/', async (req, res) => {
    try {
        const categories = await db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ─── POST /api/categories ─────────────────────────────────────────────────────
// Admin only
router.post('/', requireAdmin, async (req, res) => {
    const { name, description, image_url } = req.body;
    if (!name) return res.status(400).json({ error: 'Nom requis' });

    try {
        const id = require('crypto').randomUUID();
        await db.prepare('INSERT INTO categories (id, name, description, image_url) VALUES (?, ?, ?, ?)').run(id, name, description || null, image_url || null);
        const cat = await db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
        res.status(201).json(cat);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la création' });
    }
});

module.exports = router;
