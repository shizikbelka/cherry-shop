const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ==================== ПОЛЬЗОВАТЕЛИ ====================

// Регистрация
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, address, phone } = req.body;
        
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash, address, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, address, phone',
            [username, email, hashedPassword, address || '', phone || '']
        );
        
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Вход (логин)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        const token = jwt.sign(
            { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            token,
            user: {
                id: user.rows[0].id,
                username: user.rows[0].username,
                email: user.rows[0].email,
                address: user.rows[0].address,
                phone: user.rows[0].phone,
                avatar_color: user.rows[0].avatar_color,
                role: user.rows[0].role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить данные пользователя
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await pool.query(
            'SELECT id, username, email, address, phone, avatar_color, role FROM users WHERE id = $1',
            [req.params.id]
        );
        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json(user.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновить данные пользователя
app.put('/api/users/:id', async (req, res) => {
    try {
        const { username, address, phone, avatar_color } = req.body;
        const result = await pool.query(
            'UPDATE users SET username = $1, address = $2, phone = $3, avatar_color = $4 WHERE id = $5 RETURNING id, username, email, address, phone, avatar_color',
            [username, address, phone, avatar_color, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ==================== КАТЕГОРИИ ====================

// Получить все категории
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await pool.query('SELECT * FROM categories ORDER BY id');
        res.json(categories.rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ==================== КОЛЛЕКЦИИ  ====================

// Получить все коллекции
app.get('/api/collections', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM collections ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения коллекций' });
    }
});

// Получить товары по коллекции
app.get('/api/collections/:slug', async (req, res) => {
    try {
        const collectionResult = await pool.query('SELECT * FROM collections WHERE slug = $1', [req.params.slug]);
        if (collectionResult.rows.length === 0) return res.status(404).json({ error: 'Коллекция не найдена' });
        const collection = collectionResult.rows[0];
        
        const productsResult = await pool.query('SELECT * FROM products WHERE collection_id = $1', [collection.id]);
        res.json({ collection, products: productsResult.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения коллекции' });
    }
});

// ==================== ТОВАРЫ ====================

// Получить все товары
app.get('/api/products', async (req, res) => {
    try {
        const products = await pool.query(`
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.id
        `);
        res.json(products.rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить товар по ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await pool.query(`
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = $1
        `, [req.params.id]);
        
        if (product.rows.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        res.json(product.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/products/detail/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        // 1. Основная информация о товаре
        const productRes = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
        if (productRes.rows.length === 0) return res.status(404).json({ error: 'Товар не найден' });
        const product = productRes.rows[0];
        
        // 2. Получаем доступные размеры из БД
        const sizesRes = await pool.query(`
            SELECT s.name, ps.stock FROM product_sizes ps
            JOIN sizes s ON ps.size_id = s.id
            WHERE ps.product_id = $1 AND ps.stock > 0
        `, [productId]);
        
        // 3. Получаем доступные цвета из БД
        const colorsRes = await pool.query(`
            SELECT c.name, c.code, pc.image_url FROM product_colors pc
            JOIN colors c ON pc.color_id = c.id
            WHERE pc.product_id = $1
        `, [productId]);
        
        res.json({ 
            ...product, 
            sizes: sizesRes.rows, 
            colors: colorsRes.rows 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения деталей товара' });
    }
});

// Получить товары по категории (по slug)
app.get('/api/products/category/:slug', async (req, res) => {
    try {
        const products = await pool.query(`
            SELECT p.*, c.name as category_name
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE c.slug = $1
        `, [req.params.slug]);
        res.json(products.rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ==================== АДМИН: УПРАВЛЕНИЕ ТОВАРАМИ ====================

// Добавить товар (только админ)
app.post('/api/admin/products', async (req, res) => {
    try {
        const { title, description, price, category_id, image_url, stock } = req.body;
        
        const result = await pool.query(
            'INSERT INTO products (title, description, price, category_id, image_url, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, description, price, category_id, image_url, stock]
        );
        
        res.json({ success: true, product: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при добавлении товара' });
    }
});

// Обновить товар (только админ)
app.put('/api/admin/products/:id', async (req, res) => {
    try {
        const { title, description, price, category_id, image_url, stock } = req.body;
        
        const result = await pool.query(
            'UPDATE products SET title = $1, description = $2, price = $3, category_id = $4, image_url = $5, stock = $6 WHERE id = $7 RETURNING *',
            [title, description, price, category_id, image_url, stock, req.params.id]
        );
        
        res.json({ success: true, product: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при обновлении товара' });
    }
});

// Удалить товар (только админ)
app.delete('/api/admin/products/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при удалении товара' });
    }
});

// ==================== ИЗБРАННОЕ (НОВОЕ) ====================

// Получить избранное пользователя
app.get('/api/favorites/:userId', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.* FROM favorites f
            JOIN products p ON f.product_id = p.id
            WHERE f.user_id = $1
        `, [req.params.userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения избранного' });
    }
});

// Добавить/удалить из избранного (toggle)
app.post('/api/favorites/toggle', async (req, res) => {
    const { userId, productId } = req.body;
    try {
        const check = await pool.query('SELECT id FROM favorites WHERE user_id = $1 AND product_id = $2', [userId, productId]);
        if (check.rows.length > 0) {
            await pool.query('DELETE FROM favorites WHERE user_id = $1 AND product_id = $2', [userId, productId]);
            res.json({ success: true, action: 'removed' });
        } else {
            await pool.query('INSERT INTO favorites (user_id, product_id) VALUES ($1, $2)', [userId, productId]);
            res.json({ success: true, action: 'added' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка обновления избранного' });
    }
});

// Проверить, в избранном ли товар
app.get('/api/favorites/check/:userId/:productId', async (req, res) => {
    try {
        const result = await pool.query('SELECT id FROM favorites WHERE user_id = $1 AND product_id = $2', 
            [req.params.userId, req.params.productId]);
        res.json({ isFavorite: result.rows.length > 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка проверки избранного' });
    }
});

// ==================== ЗАКАЗЫ ====================

// ==================== ЗАКАЗЫ ====================

// Создать заказ (ОБНОВЛЁННАЯ ВЕРСИЯ)
app.post('/api/orders', async (req, res) => {
    try {
        const { 
            userId, 
            cart, 
            address, 
            phone, 
            payment_method,
            certificates,
            hasCertificate
        } = req.body;
        
        // Вычисляем общую сумму
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Создаём заказ
        const order = await pool.query(
            'INSERT INTO orders (user_id, total, address, phone, payment_method, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [userId, total, address, phone, payment_method, 'pending']
        );
        
        const orderId = order.rows[0].id;
        
        // Добавляем позиции заказа
        for (const item of cart) {
            await pool.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [orderId, item.id, item.quantity, item.price]
            );
            
            // Уменьшаем количество на складе (только для обычных товаров, не сертификатов)
            if (!item.isCertificate) {
                await pool.query(
                    'UPDATE products SET stock = stock - $1 WHERE id = $2',
                    [item.quantity, item.id]
                );
            }
        }
        
        // Создаём таблицу для сертификатов, если её нет
        await pool.query(`
            CREATE TABLE IF NOT EXISTS order_certificates (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                product_id INTEGER,
                product_title VARCHAR(200),
                quantity INTEGER DEFAULT 1,
                recipient_name VARCHAR(200) NOT NULL,
                telegram VARCHAR(100) NOT NULL,
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Сохраняем данные сертификатов
        if (certificates && certificates.length > 0) {
            for (const cert of certificates) {
                await pool.query(
                    `INSERT INTO order_certificates (order_id, product_id, product_title, quantity, recipient_name, telegram, message) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [orderId, cert.productId, cert.title, cert.quantity, cert.recipient, cert.telegram, cert.message || '']
                );
            }
        }
        
        res.json({ success: true, orderId: orderId });
    } catch (err) {
        console.error('Ошибка при создании заказа:', err);
        res.status(500).json({ error: 'Ошибка при создании заказа' });
    }
});

// Получить заказы пользователя
app.get('/api/orders/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        console.log('Запрос заказов для пользователя ID:', userId);
        
        const result = await pool.query(`
            SELECT o.*, 
                   COALESCE(
                       (SELECT json_agg(json_build_object(
                           'id', oi.id,
                           'product_id', oi.product_id,
                           'quantity', oi.quantity,
                           'price', oi.price,
                           'title', p.title,
                           'image_url', p.image_url
                       )) FROM order_items oi 
                       LEFT JOIN products p ON oi.product_id = p.id
                       WHERE oi.order_id = o.id),
                       '[]'::json
                   ) as items
            FROM orders o
            WHERE o.user_id = $1
            ORDER BY o.created_at DESC
        `, [userId]);
        
        console.log(`Найдено заказов: ${result.rows.length}`);
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения заказов:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ==================== АДМИН: УПРАВЛЕНИЕ ЗАКАЗАМИ (НОВОЕ) ====================

// Получить все заказы (для админа)
app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await pool.query(`
            SELECT o.*, u.username, u.email 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC
        `);
        res.json(orders.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения заказов' });
    }
});

// Обновить статус заказа (для админа)
app.put('/api/admin/orders/:orderId/status', async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered'];
    
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Недопустимый статус' });
    }
    
    try {
        await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка обновления статуса' });
    }
});

// Обновить статус заказа (старый маршрут, оставляем для совместимости)
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ==================== РАЗМЕРЫ И ЦВЕТА ====================

// Получить все размеры
app.get('/api/sizes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sizes ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка получения размеров' });
    }
});

// Получить все цвета
app.get('/api/colors', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM colors ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка получения цветов' });
    }
});

// Получить размеры товара
app.get('/api/products/:id/sizes', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.id, s.name FROM product_sizes ps
            JOIN sizes s ON ps.size_id = s.id
            WHERE ps.product_id = $1
        `, [req.params.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка получения размеров товара' });
    }
});

// Получить цвета товара
app.get('/api/products/:id/colors', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.id, c.name, c.code FROM product_colors pc
            JOIN colors c ON pc.color_id = c.id
            WHERE pc.product_id = $1
        `, [req.params.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка получения цветов товара' });
    }
});

// Удалить все размеры товара
app.delete('/api/admin/products/:id/sizes', async (req, res) => {
    try {
        await pool.query('DELETE FROM product_sizes WHERE product_id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка удаления размеров' });
    }
});

// Добавить размер товару
app.post('/api/admin/products/:id/sizes', async (req, res) => {
    const { size_id, stock } = req.body;
    try {
        await pool.query(
            'INSERT INTO product_sizes (product_id, size_id, stock) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [req.params.id, size_id, stock || 10]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка добавления размера' });
    }
});

// Удалить все цвета товара
app.delete('/api/admin/products/:id/colors', async (req, res) => {
    try {
        await pool.query('DELETE FROM product_colors WHERE product_id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка удаления цветов' });
    }
});

// Добавить цвет товару
app.post('/api/admin/products/:id/colors', async (req, res) => {
    const { color_id } = req.body;
    try {
        await pool.query(
            'INSERT INTO product_colors (product_id, color_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [req.params.id, color_id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка добавления цвета' });
    }
});

// ==================== УПРАВЛЕНИЕ КОЛЛЕКЦИЯМИ ====================

// Добавить коллекцию
app.post('/api/admin/collections', async (req, res) => {
    const { title, slug, hero_title, description, image_url, release_date } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO collections (title, slug, hero_title, description, image_url, release_date) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [title, slug, hero_title, description, image_url, release_date]
        );
        res.json({ success: true, collection: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка добавления коллекции' });
    }
});

// Обновить коллекцию
app.put('/api/admin/collections/:id', async (req, res) => {
    const { title, slug, hero_title, description, image_url, release_date } = req.body;
    try {
        const result = await pool.query(
            `UPDATE collections SET title = $1, slug = $2, hero_title = $3, description = $4, image_url = $5, release_date = $6 
             WHERE id = $7 RETURNING *`,
            [title, slug, hero_title, description, image_url, release_date, req.params.id]
        );
        res.json({ success: true, collection: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка обновления коллекции' });
    }
});

// Удалить коллекцию
app.delete('/api/admin/collections/:id', async (req, res) => {
    try {
        await pool.query('UPDATE products SET collection_id = NULL WHERE collection_id = $1', [req.params.id]);
        await pool.query('DELETE FROM collections WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка удаления коллекции' });
    }
});

// ==================== ЗАПУСК СЕРВЕРА ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
});