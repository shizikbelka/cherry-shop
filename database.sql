-- ============================================
-- БАЗА ДАННЫХ ДЛЯ ИНТЕРНЕТ-МАГАЗИНА CHERRYSTYLE
-- ============================================

-- Удаляем старые таблицы (если есть)
DROP TABLE IF EXISTS order_certificates CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_colors CASCADE;
DROP TABLE IF EXISTS product_sizes CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS colors CASCADE;
DROP TABLE IF EXISTS sizes CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 1. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    avatar_color VARCHAR(30) DEFAULT '#800020',
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. ТАБЛИЦА КАТЕГОРИЙ
-- ============================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL
);

-- ============================================
-- 3. ТАБЛИЦА КОЛЛЕКЦИЙ
-- ============================================
CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    hero_title VARCHAR(200),
    description TEXT,
    image_url TEXT,
    release_date VARCHAR(50)
);

-- ============================================
-- 4. ТАБЛИЦА ТОВАРОВ
-- ============================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    collection_id INTEGER REFERENCES collections(id) ON DELETE SET NULL,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. ТАБЛИЦА РАЗМЕРОВ
-- ============================================
CREATE TABLE sizes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(10) UNIQUE NOT NULL
);

-- ============================================
-- 6. ТАБЛИЦА ЦВЕТОВ
-- ============================================
CREATE TABLE colors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL,
    code VARCHAR(10)
);

-- ============================================
-- 7. СВЯЗЬ ТОВАРОВ С РАЗМЕРАМИ
-- ============================================
CREATE TABLE product_sizes (
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    size_id INTEGER REFERENCES sizes(id) ON DELETE CASCADE,
    stock INTEGER DEFAULT 0,
    PRIMARY KEY (product_id, size_id)
);

-- ============================================
-- 8. СВЯЗЬ ТОВАРОВ С ЦВЕТАМИ
-- ============================================
CREATE TABLE product_colors (
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    color_id INTEGER REFERENCES colors(id) ON DELETE CASCADE,
    image_url TEXT,
    PRIMARY KEY (product_id, color_id)
);

-- ============================================
-- 9. ТАБЛИЦА ЗАКАЗОВ
-- ============================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    total DECIMAL(10,2),
    address TEXT NOT NULL,
    phone VARCHAR(20),
    payment_method VARCHAR(50)
);

-- ============================================
-- 10. ТАБЛИЦА ПОЗИЦИЙ ЗАКАЗА
-- ============================================
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- ============================================
-- 11. ТАБЛИЦА СЕРТИФИКАТОВ
-- ============================================
CREATE TABLE order_certificates (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER,
    product_title VARCHAR(200),
    quantity INTEGER DEFAULT 1,
    recipient_name VARCHAR(200) NOT NULL,
    telegram VARCHAR(100) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 12. ТАБЛИЦА ИЗБРАННОГО
-- ============================================
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- ============================================
-- ИНДЕКСЫ ДЛЯ УСКОРЕНИЯ
-- ============================================
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_collection_id ON products(collection_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ============================================
-- ДОБАВЛЯЕМ БАЗОВЫЕ ДАННЫЕ
-- ============================================

-- Категории
INSERT INTO categories (name, slug) VALUES 
('Худи & Кофты', 'hoodies'),
('Штаны & Шорты', 'pants'),
('Футболки & Верх', 't-shirts'),
('Аксессуары', 'accessories'),
('Верхняя одежда', 'outerwear'),
('Сертификаты', 'certificates')
ON CONFLICT (slug) DO NOTHING;

-- Размеры
INSERT INTO sizes (name) VALUES ('XS'), ('S'), ('M'), ('L'), ('XL'), ('ONE SIZE')
ON CONFLICT (name) DO NOTHING;

-- Цвета
INSERT INTO colors (name, code) VALUES 
('Черный', '#000000'),
('Белый', '#FFFFFF'),
('Серый', '#808080'),
('Красный', '#FF0000'),
('Синий', '#0000FF'),
('Хаки', '#8B8B6B'),
('Молочный', '#FEFCFF'),
('Розовый', '#FF69B4'),
('Коричневый', '#654321')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ТЕСТОВЫЙ АДМИНИСТРАТОР (пароль: 123456)
-- ============================================
INSERT INTO users (username, email, password_hash, role) VALUES 
('Admin', 'admin@shop.com', '$2a$10$5CwU.9kqjZqZrXzXzXzXzOeL8wX8wX8wX8wX8wX8wX8wX8wX8.', 'admin')
ON CONFLICT (email) DO NOTHING;