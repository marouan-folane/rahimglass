const express = require('express');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../auth');

const router = express.Router();

// ─── GET /api/products ────────────────────────────────────────────────────────
// Public: anyone can view products
router.get('/', async (req, res) => {
    try {
        const products = await db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `).all();

        // Convert SQLite integers to booleans (and MySQL tinyint(1))
        const mapped = products.map(p => ({
            ...p,
            is_customizable: p.is_customizable === 1,
        }));

        res.json(mapped);
    } catch (err) {
        console.error('GET /products error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ─── GET /api/products/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const product = await db.prepare(`
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `).get(req.params.id);

        if (!product) return res.status(404).json({ error: 'Produit introuvable' });
        res.json({ ...product, is_customizable: product.is_customizable === 1 });
    } catch (err) {
        console.error('GET /products/:id error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ─── POST /api/products ───────────────────────────────────────────────────────
// Admin only
router.post('/', requireAdmin, async (req, res) => {
    const { name, description, price_per_m2, stock, thickness, category_id, is_customizable, image_url } = req.body;

    if (!name || price_per_m2 == null) {
        return res.status(400).json({ error: 'Nom et prix requis' });
    }

    try {
        const id = require('crypto').randomUUID();
        await db.prepare(`
      INSERT INTO products (id, name, description, price_per_m2, stock, thickness, category_id, is_customizable, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, description || null, price_per_m2, stock || 0, thickness || 6, category_id || null, is_customizable ? 1 : 0, image_url || null);

        const product = await db.prepare('SELECT * FROM products WHERE id = ?').get(id);
        res.status(201).json({ ...product, is_customizable: product.is_customizable === 1 });
    } catch (err) {
        console.error('POST /products error:', err);
        res.status(500).json({ error: 'Erreur lors de la création du produit' });
    }
});

// ─── PUT /api/products/:id ────────────────────────────────────────────────────
// Admin only
router.put('/:id', requireAdmin, async (req, res) => {
    const { name, description, price_per_m2, stock, thickness, category_id, is_customizable, image_url } = req.body;

    try {
        await db.prepare(`
      UPDATE products SET
        name = ?, description = ?, price_per_m2 = ?, stock = ?,
        thickness = ?, category_id = ?, is_customizable = ?, image_url = ?
      WHERE id = ?
    `).run(name, description || null, price_per_m2, stock, thickness, category_id || null, is_customizable ? 1 : 0, image_url || null, req.params.id);

        const product = await db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
        if (!product) return res.status(404).json({ error: 'Produit introuvable' });
        res.json({ ...product, is_customizable: product.is_customizable === 1 });
    } catch (err) {
        console.error('PUT /products error:', err);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
});

// ─── DELETE /api/products/:id ─────────────────────────────────────────────────
// Admin only
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const result = await db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: 'Produit introuvable' });
        res.json({ success: true });
    } catch (err) {
        console.error('DELETE /products error:', err);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
});

module.exports = router;
