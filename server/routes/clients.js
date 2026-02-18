const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();

// ─── GET /api/clients ─────────────────────────────────────────────────────────
// Admin only
router.get('/', requireAdmin, async (req, res) => {
    try {
        const clients = await db.prepare(`
      SELECT p.*, u.email, u.created_at as joined_at
      FROM profiles p
      LEFT JOIN users u ON p.id = u.id
      ORDER BY p.created_at DESC
    `).all();
        res.json(clients);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ─── PUT /api/clients/:id/role ────────────────────────────────────────────────
// Admin only
router.put('/:id/role', requireAdmin, async (req, res) => {
    const { role } = req.body;
    const validRoles = ['customer', 'wholesale', 'admin'];

    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Rôle invalide' });
    }

    try {
        const result = await db.prepare('UPDATE profiles SET role = ? WHERE id = ?').run(role, req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });
        res.json({ success: true, role });
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
});

module.exports = router;
