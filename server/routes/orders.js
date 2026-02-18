const express = require('express');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../auth');

const router = express.Router();

// ─── GET /api/orders ──────────────────────────────────────────────────────────
// Admin: all orders | User: own orders
router.get('/', requireAuth, async (req, res) => {
    try {
        let orders;
        if (req.user.role === 'admin') {
            orders = await db.prepare(`
        SELECT o.*, p.name as user_name, p.phone as user_phone, u.email as user_email
        FROM orders o
        LEFT JOIN profiles p ON o.user_id = p.id
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `).all();
        } else {
            orders = await db.prepare(`
        SELECT o.*, p.name as user_name
        FROM orders o
        LEFT JOIN profiles p ON o.user_id = p.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
      `).all(req.user.id);
        }

        // Attach order items with product info
        const ordersWithItems = await Promise.all(orders.map(async order => {
            const items = await db.prepare(`
        SELECT oi.*, pr.name as product_name, pr.image_url as product_image
        FROM order_items oi
        LEFT JOIN products pr ON oi.product_id = pr.id
        WHERE oi.order_id = ?
      `).all(order.id);

            return {
                ...order,
                order_items: items.map(item => ({
                    ...item,
                    product: item.product_name ? {
                        id: item.product_id,
                        name: item.product_name,
                        image_url: item.product_image,
                    } : null,
                })),
            };
        }));

        res.json(ordersWithItems);
    } catch (err) {
        console.error('GET /orders error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ─── POST /api/orders ─────────────────────────────────────────────────────────
// Authenticated users
router.post('/', requireAuth, async (req, res) => {
    const { total_price, shipping_address, payment_method, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Panier vide' });
    }

    try {
        const orderId = require('crypto').randomUUID();

        await db.prepare(`
      INSERT INTO orders (id, user_id, total_price, status, shipping_address, payment_method)
      VALUES (?, ?, ?, 'pending', ?, ?)
    `).run(orderId, req.user.id, total_price, shipping_address, payment_method);

        const insertItem = db.prepare(`
      INSERT INTO order_items (id, order_id, product_id, quantity, price, custom_width, custom_height)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        for (const item of items) {
            await insertItem.run(
                require('crypto').randomUUID(),
                orderId,
                item.product_id || null,
                item.quantity,
                item.price,
                item.custom_width || null,
                item.custom_height || null,
            );
        }

        const order = await db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
        const orderItems = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

        res.status(201).json({ ...order, order_items: orderItems });
    } catch (err) {
        console.error('POST /orders error:', err);
        res.status(500).json({ error: 'Erreur lors de la création de la commande' });
    }
});

// ─── PUT /api/orders/:id/status ───────────────────────────────────────────────
// Admin only
router.put('/:id/status', requireAdmin, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Statut invalide' });
    }

    try {
        const result = await db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: 'Commande introuvable' });
        res.json({ success: true, status });
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
});

module.exports = router;
