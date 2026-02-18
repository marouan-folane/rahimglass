/* eslint-disable no-console */
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rahimglass',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
};

let pool;

async function initDB() {
    try {
        // First connect without DB to create it if it doesn't exist
        const tempConfig = { ...config, database: undefined };
        const tempPool = await mysql.createConnection(tempConfig);
        await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\`;`);
        await tempPool.end();

        // Now connect with DB
        pool = mysql.createPool(config);
        console.log('✅ Connected to MySQL database');

        await createSchema();
        await seed();
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }
}

async function createSchema() {
    const schema = `
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS profiles (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255),
            phone VARCHAR(50),
            address TEXT,
            role ENUM('customer', 'wholesale', 'admin') NOT NULL DEFAULT 'customer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS categories (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price_per_m2 DECIMAL(10, 2) NOT NULL DEFAULT 0,
            stock INT NOT NULL DEFAULT 0,
            thickness INT NOT NULL DEFAULT 6,
            category_id VARCHAR(36),
            is_customizable BOOLEAN NOT NULL DEFAULT 1,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );

        CREATE TABLE IF NOT EXISTS orders (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL,
            total_price DECIMAL(10, 2) NOT NULL,
            status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered') NOT NULL DEFAULT 'pending',
            shipping_address TEXT,
            payment_method VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id VARCHAR(36) PRIMARY KEY,
            order_id VARCHAR(36) NOT NULL,
            product_id VARCHAR(36),
            quantity INT NOT NULL DEFAULT 1,
            price DECIMAL(10, 2) NOT NULL,
            custom_width DECIMAL(10, 2),
            custom_height DECIMAL(10, 2),
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id)
        );
    `;

    // Split schema execution because multipleStatements works differently sometimes with create table
    // But multipleStatements: true is set, so it should be fine.
    // However, it's safer to not rely on it for DDL if we can avoid it, but let's try.
    await pool.query(schema);
    console.log('✅ Schema initialized');
}

async function seed() {
    const [rows] = await pool.query('SELECT COUNT(*) as n FROM categories');
    if (rows[0].n > 0) return;

    console.log('🌱 Seeding database...');

    // Categories
    const categories = [
        ['cat-1', 'Miroirs Muraux', 'Miroirs décoratifs pour murs'],
        ['cat-2', 'Miroirs de Salle de Bain', 'Miroirs résistants à l\'humidité'],
        ['cat-3', 'Miroirs Sur Mesure', 'Miroirs personnalisés à votre taille'],
        ['cat-4', 'Vitrages Décoratifs', 'Verre décoratif pour intérieurs']
    ];

    for (const cat of categories) {
        await pool.query('INSERT INTO categories (id, name, description) VALUES (?, ?, ?)', cat);
    }

    // Products
    const products = [
        ['prod-1', 'Miroir Élégance Noir', 'Miroir avec cadre noir mat, style moderne et épuré.', 850, 15, 6, 'cat-1', 1, 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600'],
        ['prod-2', 'Miroir Arche Dorée', 'Miroir en arche avec finition dorée luxueuse.', 1200, 8, 8, 'cat-1', 1, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600'],
        ['prod-3', 'Miroir Salle de Bain LED', 'Miroir anti-buée avec éclairage LED intégré.', 1500, 12, 6, 'cat-2', 0, 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600'],
        ['prod-4', 'Miroir Rond Minimaliste', 'Miroir circulaire sans cadre, style scandinave.', 650, 20, 4, 'cat-1', 1, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600'],
        ['prod-5', 'Miroir Pleine Longueur', 'Miroir de sol pleine longueur avec cadre en bois.', 950, 6, 6, 'cat-1', 1, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'],
        ['prod-6', 'Vitrage Sablé Décoratif', 'Verre sablé avec motifs géométriques pour cloisons.', 780, 30, 8, 'cat-4', 1, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
        ['prod-7', 'Miroir Vintage Baroque', 'Miroir avec cadre baroque doré, style classique.', 1800, 4, 6, 'cat-1', 0, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600'],
        ['prod-8', 'Miroir Sur Mesure Premium', 'Miroir taillé sur mesure selon vos dimensions exactes.', 1100, 50, 10, 'cat-3', 1, 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600'],
    ];

    for (const p of products) {
        await pool.query(`
            INSERT INTO products (id, name, description, price_per_m2, stock, thickness, category_id, is_customizable, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, p);
    }

    // Admin user
    const adminPass = await bcrypt.hash('admin123', 10);
    const adminId = 'admin-user-001';

    // Check if user exists before inserting to avoid duplicate key error log spam (though IGNORE handles it roughly)
    // Actually INSERT IGNORE is fine for simple skipping if duplicative.

    await pool.query(`INSERT IGNORE INTO users (id, email, password) VALUES (?, ?, ?)`, [adminId, 'admin@rahimglass.ma', adminPass]);
    await pool.query(`INSERT IGNORE INTO profiles (id, name, phone, role) VALUES (?, ?, ?, ?)`, [adminId, 'Admin RahimGlass', '+212600000000', 'admin']);

    console.log('✅ Database seeded successfully');
    console.log('   Admin: admin@rahimglass.ma / admin123');
}

const db = {
    init: initDB,
    prepare: (sql) => {
        return {
            async get(...params) {
                if (!pool) throw new Error('DB not initialized');
                const [rows] = await pool.execute(sql, params);
                return rows[0];
            },
            async all(...params) {
                if (!pool) throw new Error('DB not initialized');
                const [rows] = await pool.execute(sql, params);
                return rows;
            },
            async run(...params) {
                if (!pool) throw new Error('DB not initialized');
                const [result] = await pool.execute(sql, params);
                return { changes: result.affectedRows, lastInsertRowid: result.insertId };
            }
        };
    }
};

module.exports = db;
