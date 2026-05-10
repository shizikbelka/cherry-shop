-- КАК ИСПОЛЬЗОВАТЬ
--Откройте pgAdmin
--Подключитесь к вашей базе данных
--Откройте Query Tool
--Скопируйте и выполните весь скрипт
--Готово! База данных будет полностью соответствовать вашему проекту

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
    title VARCHAR(200) NOT NULL,
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
-- КОЛЛЕКЦИИ
-- ============================================
INSERT INTO collections (title, slug, hero_title, description, release_date) VALUES
('x Rndm Crew', 'x-rndm-crew', 'x RNDM CREW', 
 'Капсульная коллекция в коллаборации с Rndm Crew. Объединение женской & мужской энергии, отраженные в любви и гармонии изделий. Лимитированный тираж к праздникам весны 026. 23 february & 8 march

В составе коллекции:
Зип–Худи / Штаны / Slim & Oversize-Fit Футболки', 
 'Released on 20 February 2026'),
('Skin Set', 'skin-set', 'SKIN SET COLLECTION', 
 'Линия базовых Slim-Fit комплектов, нежное дополнение к костюмам «Basic». your Skin, our Set. В основе коллекции - легкие & мягкие материалы, приятно облегающие фигуру и подчеркивающие её достоинства. Регулярные пополнения & апдейты состава коллекции.

В составе коллекции:
Slim-Fit — Футболки / Майки / Лонгсливы / Шорты & Oversize Лонгсливы', 
 'Released on 29 April 2025'),
('Танцевальная линия', 'dance-line', 'Танцевальная линия', 
 'Издание – Декабрь 025. Линия костюмов бренда танцевального направления. Каждый элемент разработан с фокусом на ваши движения, пластику тела и творческую свободу. Цвета-бестселлеры & новые оттенки сезона.

В составе коллекции:
Штаны / Худи – Оверсайз & Укороченный', 
 'Издание – Декабрь 025');

UPDATE collections SET image_url = 'https://sun9-20.userapi.com/s/v1/ig2/KHyukzD_5jJvyvB4B7R10e1sZHubpWrz3FfHY9Hqxg4LMFtKDwK5ST3GElrmVaut8nvJsH4Qe-JeUkZJ0G8aps9E.jpg?quality=95&as=32x38,48x58,72x87,108x130,160x192,240x289,360x433,480x578,540x650,640x770,720x866,1080x1299,1206x1451&from=bu&u=tVQlYGi7tR3bn9s9RSVW4WgU2ZKWqhghN5who6lQAbY&cs=1206x0' WHERE slug = 'x-rndm-crew';
UPDATE collections SET image_url = 'https://sun9-65.userapi.com/s/v1/ig2/8pddhKZJik6MlNfjASiLu-xZFjZ_3ZOhptFBkuo25IrvbGWghEMg9c3k63LfLFlGj5qeurTveAgvscv4ZlmDgGGN.jpg?quality=95&as=32x38,48x58,72x86,108x130,160x192,240x288,360x432,480x576,540x648,640x768,720x864,1080x1297,1206x1448&from=bu&cs=1206x0' WHERE slug = 'skin-set';
UPDATE collections SET image_url = 'https://sun9-17.userapi.com/s/v1/ig2/lU8U3YfTD-K9PPa6CZGyoyKOmoYRYp-49jijpG6eoWBWM8eWnoahF4yL5ZA76CFda3sxfF7uATTtOnsq9hUf_Mcr.jpg?quality=95&as=32x38,48x57,72x86,108x129,160x191,240x286,360x429,480x572,540x643,640x762,720x857,1080x1286,1206x1436&from=bu&cs=1206x0' WHERE slug = 'dance-line';

-- ============================================
-- ТОВАРЫ
-- ============================================

-- Худи & Кофты (category_id = 1)
INSERT INTO products (id, title, description, price, category_id, image_url, stock) VALUES
(1, 'ZIP-HOODIE DANCE RED', 'Трикотажный зип-худи объемного–оверсайз кроя.', 8900, 1, 'https://static.tildacdn.com/stor3833-6139-4834-b237-393563633964/8bca5797ea369bed1f80cf89c887ce1e.jpg', 35),
(2, 'ZIP-HOODIE DANCE BLACK', 'Трикотажный зип-худи объемного–оверсайз кроя.', 8900, 1, 'https://static.tildacdn.com/stor6532-3132-4230-b835-353238363737/bfd55c52b448532eb3eb8c0cc58c6b23.jpg', 28),
(3, 'ZIP-HOODIE DANCE BLUE', 'Трикотажный зип-худи объемного–оверсайз кроя.', 8900, 1, 'https://static.tildacdn.com/stor3231-3938-4661-b937-663862323235/8b14827165d51e3a2bab3a7d7320c8e0.jpg', 42),
(4, 'ZIP-HOODIE DANCE LIGHT GREY', 'Трикотажный зип-худи объемного–оверсайз кроя.', 8900, 1, 'https://static.tildacdn.com/stor6237-3564-4766-b837-313061663739/fa7431b6709be35760e7a09eefcfd41c.jpg', 25);

-- Штаны & Шорты (category_id = 2)
INSERT INTO products (id, title, description, price, category_id, image_url, stock) VALUES
(5, 'PANTS DANCE RED', 'Трикотажные брюки с объемной–оверсайз посадкой.', 7900, 2, 'https://static.tildacdn.com/stor3237-6165-4839-b563-333830613330/2bde5af590d942db5b006e71977cbd5e.jpg', 30),
(6, 'PANTS DANCE BLACK', 'Трикотажные брюки с объемной–оверсайз посадкой.', 7900, 2, 'https://static.tildacdn.com/stor3835-3737-4830-b135-316463613461/75727c969bcb144cb2ddeab0d37e3bd5.jpg', 45),
(7, 'PANTS DANCE BLUE', 'Трикотажные брюки с объемной–оверсайз посадкой.', 7900, 2, 'https://static.tildacdn.com/stor6239-3666-4664-a435-636632336361/8a6ae95ff249d899b14dbcae82d0145b.jpg', 32),
(8, 'PANTS DANCE LIGHT GREY', 'Трикотажные брюки с объемной–оверсайз посадкой.', 7900, 2, 'https://static.tildacdn.com/stor3466-6131-4331-a639-383532373838/991624fa8e21f64c2ec073926272cd85.jpg', 38);

-- Футболки & Верх (category_id = 3)
INSERT INTO products (id, title, description, price, category_id, image_url, stock) VALUES
(9, 'T-SHIRT /RNDM GREY', 'Футболка Unisex & Oversize Fit.', 5900, 3, 'https://static.tildacdn.com/stor6661-3166-4634-b166-663861306236/d4da4c98d133df3a704befc6ce5ab776.jpg', 50),
(10, 'T-SHIRT /RNDM BLACK', 'Футболка Unisex & Oversize Fit.', 5900, 3, 'https://static.tildacdn.com/stor6131-6164-4637-b964-363531346230/33ac4207bbcef35589269e80dc6351c0.jpg', 45),
(11, 'SLIM T-SHIRT /RNDM GREY', 'Женская Slim-Fit футболка.', 4500, 3, 'https://static.tildacdn.com/stor6532-6238-4632-b362-336334336462/cd2bd31f1b122e24ac1299ab6780deee.jpg', 35),
(12, 'SLIM T-SHIRT /RNDM MILKY', 'Женская Slim-Fit футболка.', 4500, 3, 'https://static.tildacdn.com/stor6333-3839-4339-a561-623339346562/8325e7b038660c01ed5d0d9d681bee6b.jpg', 28),
(21, 'T-SHIRT HW RED', 'Футболка Unisex & Oversize Fit.', 5900, 3, 'https://static.tildacdn.com/stor6438-3631-4434-a163-373137303334/1aa2fa3ced0d714003034b5cf52d6f04.jpg', 24),
(22, 'OVERSIZE LONGSLEEVE WASHED GREY', 'Oversize-Fit лонгслив с широкой горловиной.', 7500, 3, 'https://static.tildacdn.com/stor3561-3262-4164-b332-346531316337/72077287.jpg', 10),
(23, 'OVERSIZE LONGSLEEVE BLACK', 'Oversize-Fit лонгслив с широкой горловиной.', 7500, 3, 'https://static.tildacdn.com/stor3262-3237-4665-a330-343039623938/16917407.jpg', 10);

-- Аксессуары (category_id = 4)
INSERT INTO products (id, title, description, price, category_id, image_url, stock) VALUES
(13, 'BLACK TOTE BAG', 'Сумка – Шоппер из плотного хлопка.', 7500, 4, 'https://static.tildacdn.com/tild3733-6133-4164-a535-393666343134/BlackToteBag-Update-.jpg', 100),
(14, 'WASHED TOTE BAG', 'Сумка – Шоппер из плотного хлопка.', 7500, 4, 'https://static.tildacdn.com/stor3765-3733-4630-b766-356432653837/55682275.jpg', 40),
(15, 'PINK TOTE BAG', 'Сумка – Шоппер из плотного хлопка.', 7500, 4, 'https://static.tildacdn.com/tild3665-6133-4161-b339-643339396530/Pink-1.jpg', 120),
(16, 'RED TOTE BAG', 'Сумка – Шоппер из плотного хлопка.', 7500, 4, 'https://static.tildacdn.com/stor3532-3861-4165-b963-353836353363/30805422.jpg', 55);

-- Верхняя одежда (category_id = 5)
INSERT INTO products (id, title, description, price, category_id, image_url, stock) VALUES
(17, 'BOMBER JACKET BLACK', 'Утепленный бомбер, выполненный из ветрозащитной мембраны с искусственным утеплителем.', 17990, 5, 'https://static.tildacdn.com/stor3034-3439-4630-b238-613630343535/39482656.jpg', 20),
(18, 'JACKET BRITAIN BEIGE', 'Джинсовая демисезонная куртка с стеганным утеплителем.', 19900, 5, 'https://static.tildacdn.com/stor3037-3932-4432-b531-366666663330/34712163.jpg', 15),
(19, 'JACKET RACING BLACK', 'Куртка из легкого материала с кожаными вставками.', 19000, 5, 'https://static.tildacdn.com/stor3836-3463-4962-a235-343934343966/19880121.jpg', 22),
(20, 'PUFFER JACKET MINI BROWN', 'Зимняя пуховая куртка базовой посадки.', 23900, 5, 'https://static.tildacdn.com/stor6663-3962-4630-a536-316332653531/66226280.jpg', 30);

-- Сертификаты (category_id = 6)
INSERT INTO products (id, title, description, price, category_id, image_url, stock) VALUES
(24, 'СЕРТИФИКАТ CW–01', 'Подарочный сертификат номиналом в 5500 рублей', 5500, 6, 'https://sun9-22.userapi.com/s/v1/ig2/t9L6-96c9y4Puur7yw63MuMBcedTJazLQZtVci-jdfVpFoURzbQ11AhT5wRVRk4N1GmxjY1LTQf9U88uC5twOxaD.jpg?quality=95&as=32x42,48x63,72x94,108x141,160x210,240x314,360x471,480x629,540x707,640x838,688x901&from=bu&cs=688x0', 999),
(25, 'СЕРТИФИКАТ CW–02', 'Подарочный сертификат номиналом в 9900 рублей', 9900, 6, 'https://sun9-82.userapi.com/s/v1/ig2/VVhXpzR9O5lX4nn1TrMf61h7ozZPTrmgkCcg0csaStCB3pw6L0rsXJDO5IctI2E6BoZo4YWhdMY1DkLm4FewVgTc.jpg?quality=95&as=32x42,48x63,72x94,108x141,160x209,240x314,360x471,480x628,540x707,640x838,690x903&from=bu&cs=690x0', 999),
(26, 'СЕРТИФИКАТ CW–03', 'Подарочный сертификат номиналом в 19800 рублей', 19800, 6, 'https://sun9-62.userapi.com/s/v1/ig2/CxS6X0Gde-MKwvqqmAjA3oOBuoaeq8B72h8QxL-aK1zOnez_m9aTq41qTasCdFIn4HiwyvGWV3CyrSpaggGS661z.jpg?quality=95&as=32x42,48x62,72x94,108x140,160x208,240x312,360x468,480x624,540x701,640x831,689x895&from=bu&u=XUiycLjWmKcy3Esd0UlzifUTzUpVF5jeHLj5RFaBwUQ&cs=689x0', 999);

-- ============================================
-- ОБНОВЛЕНИЕ ID ПОСЛЕДОВАТЕЛЬНОСТИ (если нужно)
-- ============================================
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- ============================================
-- НАЗНАЧЕНИЕ ТОВАРОВ К КОЛЛЕКЦИЯМ
-- ============================================
UPDATE products SET collection_id = 1 WHERE id IN (9, 10, 11, 12);
UPDATE products SET collection_id = 2 WHERE id IN (22, 23);
UPDATE products SET collection_id = 3 WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8);

-- ============================================
-- ОБНОВЛЕНИЕ ПОЛНЫХ ОПИСАНИЙ ТОВАРОВ
-- ============================================

-- Худи (id 1-4)
UPDATE products SET description = 'Трикотажный зип-худи объемного–оверсайз кроя.

Футер петля без начеса.

Состав: Хлопок 80% | Полиэстер 20%

Зип-худи имеет два кармана, свободный капюшон, манжеты на рукавах & внизу изделия.

Комфортная ткань не растягивается и не теряет внешний вид даже после многочисленных стирок.

Брендовая вышивка на лицевой стороне изделия.

Танцевальная линия' WHERE id BETWEEN 1 AND 4;

-- Штаны (id 5-8)
UPDATE products SET description = 'Трикотажные брюки с объемной–оверсайз посадкой.

Разработаны специально для красоты & динамики танцев.

Футер петля без начеса.

Состав: Хлопок 90% | Эластан 10%

Широкие к низу, резинка для регулировки ширины по низу изделия.

Штаны имеют пояс на резинке, два боковых внутренних кармана и задний карман.
Двойной белый кант вдоль изделия с двух сторон.

Комфортная ткань не растягивается и не теряет внешний вид даже после многочисленных стирок.

Брендовая вышивка на лицевой стороне изделия.

Танцевальная линия' WHERE id BETWEEN 5 AND 8;

-- Футболки RNDM (id 9-10)
UPDATE products SET description = 'Футболка Unisex & Oversize Fit.

Состав: 92% Хлопок | 8% Эластан

Изготовлена из легкого и приятного материала, свободная посадка для комфорта движений.

Классический круглый вырез.

Брендовый принт на лицевой стороне изделия.

cherrywood x Rndm Crew
Special – Limited' WHERE id IN (9, 10);

-- Slim футболки RNDM (id 11-12)
UPDATE products SET description = 'Женская Slim-Fit футболка.

Состав: 92% Хлопок | 8% Эластан

Изготовлена из легкого и мягкого материала, футболка приятно облегает фигуру, подчеркивая её достоинства.

Классический круглый вырез.

Брендовый принт на лицевой стороне изделия.

cherrywood x Rndm Crew
Special – Limited' WHERE id IN (11, 12);

-- Сумки (id 13-16)
UPDATE products SET description = 'Сумка – Шоппер из плотного хлопка.

Состав: Хлопок 100%

Две удобные ручки через плечо & внутренний карман-отделение.
Брендовый принт и бирка на лицевой стороне изделия.

Размеры
Ширина – 66 см | Высота – 40 см
Толщина – 18 см | Длина ручек – 22 см

Внутренний карман – 18 x 21 см

«Summer» Season 025' WHERE id BETWEEN 13 AND 16;

-- Бомбер (id 17)
UPDATE products SET description = 'Утепленный бомбер, выполненный из ветрозащитной мембраны с искусственным утеплителем.

Температурный режим от +10°C до -20°C

Дополнительно прикрепляем брендированный шильдик из бронзы.

Бомбер на застежке-молнии с высоким воротником с текстильным подкладом.
Оснащен тремя карманами: два внешних и один внутренний без застежки.
Рукава и низ куртки обрамлены трикотажными манжетами.' WHERE id = 17;

-- Куртки Britain (id 18-19)
UPDATE products SET description = 'Джинсовая демисезонная куртка с стеганным утеплителем.

Состав
Основа – 100% Хлопок | Подклад – 100% Полиэстер
Ворот – 92% Полиэстер, 8% Нейлон

Бежевая куртка на застежке-молнии с воротом.
Фирменная зип-молния и заклепки для регулировки посадки.
Оснащена двумя внешними карманами.

Брендовая вышивка на лицевой стороне изделия.

«Britain» Collection.' WHERE id IN (18, 19);

-- Пуховик (id 20)
UPDATE products SET description = 'Зимняя пуховая куртка базовой посадки.
Универсальный & комплиментарный силуэт для всех типов фигур.

Отстегиваемый капюшон на зип-молнии.

Температурный режим до -35°C

Брендовая вышивка на лицевой стороне изделия.
Утяжки для регулировки размера на капюшоне & внизу куртки.

Два наружных кармана с клапанами & пара боковых скрытых, внутренний карман на молнии.
Застежка-молния в цвет ткани.

Fall – Winter | 025' WHERE id = 20;

-- Футболка Hollywood (id 21)
UPDATE products SET description = 'Футболка Unisex & Oversize Fit.

Состав: 92% Хлопок | 8% Эластан

Изготовлена из легкого и приятного материала, свободная посадка для комфорта движений.

Классический круглый вырез.

Брендовый принт на лицевой стороне изделия.

«Hollywood» Capsule.

Fall – Winter | 025' WHERE id = 21;

-- Лонгсливы Skin Set (id 22-23)
UPDATE products SET description = 'Oversize-Fit лонгслив с широкой горловиной.

Состав: 94% Бамбук | 6% Лайкра

Изготовлен из легкого и мягкого материала, лонгслив свободного кроя oversize-посадки.

Брендовый принт на тыльной стороне под горловиной изделия.

«Skin Set» Line' WHERE id IN (22, 23);

-- Сертификаты (id 24-26)
UPDATE products SET description = 'Подарочный сертификат.

Сертификат поступает исключительно в электронном виде на указанный при оформлении telegram-аккаунт.

Предназначен для приобретения изделий коллекции Skin Set, Футболок & Шорт.

Обладатель подарочного сертификата также может использовать его в качестве скидки (в размере номинала сертификата) на оформление любых изделий бренда.

* Обязательно укажите имя человека, которому предназначается сертификат в ''Корзине'' при оформлении заказа в специальной графе ''ФИО получателя сертификата''.

** Заполните поле – ''Послание для получателя'', в случае если хотите оставить пожелания, мы укажем их для адресата.

Отправляем на указанный telegram-аккаунт в течение 48 часов.' WHERE id BETWEEN 24 AND 26;

-- ============================================
-- НАЗНАЧЕНИЕ РАЗМЕРОВ ДЛЯ ТОВАРОВ
-- ============================================

-- ONE SIZE для товаров 1-8, 13-16, 18-20, 22-26
INSERT INTO product_sizes (product_id, size_id, stock)
SELECT id, (SELECT id FROM sizes WHERE name = 'ONE SIZE'), 
       CASE WHEN id BETWEEN 13 AND 16 THEN 5 
            WHEN id IN (18,19,20) THEN 5 
            ELSE 50 END
FROM products 
WHERE id IN (1,2,3,4,5,6,7,8,13,14,15,16,18,19,20,22,23,24,25,26)
AND NOT EXISTS (SELECT 1 FROM product_sizes WHERE product_id = products.id);

-- ONE SIZE для товаров 9,10
INSERT INTO product_sizes (product_id, size_id, stock)
SELECT 9, id, 50 FROM sizes WHERE name = 'ONE SIZE'
ON CONFLICT DO NOTHING;

INSERT INTO product_sizes (product_id, size_id, stock)
SELECT 10, id, 50 FROM sizes WHERE name = 'ONE SIZE'
ON CONFLICT DO NOTHING;

-- Размеры S,M,L для товаров 11,12
INSERT INTO product_sizes (product_id, size_id, stock)
SELECT 11, id, 20 FROM sizes WHERE name IN ('S', 'M', 'L')
ON CONFLICT DO NOTHING;

INSERT INTO product_sizes (product_id, size_id, stock)
SELECT 12, id, 20 FROM sizes WHERE name IN ('S', 'M', 'L')
ON CONFLICT DO NOTHING;

-- Размеры S,M,L,XL для товаров 17,21
INSERT INTO product_sizes (product_id, size_id, stock)
SELECT 17, id, 10 FROM sizes WHERE name IN ('S', 'M', 'L', 'XL')
ON CONFLICT DO NOTHING;

INSERT INTO product_sizes (product_id, size_id, stock)
SELECT 21, id, 10 FROM sizes WHERE name IN ('S', 'M', 'L', 'XL')
ON CONFLICT DO NOTHING;

-- ============================================
-- НАЗНАЧЕНИЕ ЦВЕТОВ ДЛЯ ТОВАРОВ
-- ============================================

-- Товары 1-8: Красный, Черный, Синий, Серый
INSERT INTO product_colors (product_id, color_id)
SELECT p.id, c.id FROM products p, colors c
WHERE p.id BETWEEN 1 AND 8 
AND c.name IN ('Красный', 'Черный', 'Синий', 'Серый')
ON CONFLICT DO NOTHING;

-- Товары 9,10: Черный, Серый
INSERT INTO product_colors (product_id, color_id)
SELECT p.id, c.id FROM products p, colors c
WHERE p.id IN (9,10) AND c.name IN ('Черный', 'Серый')
ON CONFLICT DO NOTHING;

-- Товары 11,12: Молочный, Серый
INSERT INTO product_colors (product_id, color_id)
SELECT p.id, c.id FROM products p, colors c
WHERE p.id IN (11,12) AND c.name IN ('Молочный', 'Серый')
ON CONFLICT DO NOTHING;

-- Товары 13-16: Красный, Черный, Розовый, Серый
INSERT INTO product_colors (product_id, color_id)
SELECT p.id, c.id FROM products p, colors c
WHERE p.id BETWEEN 13 AND 16 
AND c.name IN ('Красный', 'Черный', 'Розовый', 'Серый')
ON CONFLICT DO NOTHING;

-- Товар 17: Черный
INSERT INTO product_colors (product_id, color_id)
SELECT 17, id FROM colors WHERE name = 'Черный'
ON CONFLICT DO NOTHING;

-- Товары 18,19: Молочный, Черный
INSERT INTO product_colors (product_id, color_id)
SELECT p.id, c.id FROM products p, colors c
WHERE p.id IN (18,19) AND c.name IN ('Молочный', 'Черный')
ON CONFLICT DO NOTHING;

-- Товар 20: Коричневый
INSERT INTO product_colors (product_id, color_id)
SELECT 20, id FROM colors WHERE name = 'Коричневый'
ON CONFLICT DO NOTHING;

-- Товар 21: Красный
INSERT INTO product_colors (product_id, color_id)
SELECT 21, id FROM colors WHERE name = 'Красный'
ON CONFLICT DO NOTHING;

-- Товары 22,23: Серый, Черный
INSERT INTO product_colors (product_id, color_id)
SELECT p.id, c.id FROM products p, colors c
WHERE p.id IN (22,23) AND c.name IN ('Серый', 'Черный')
ON CONFLICT DO NOTHING;

-- ============================================
-- ТЕСТОВЫЙ АДМИНИСТРАТОР (пароль: 123456)
-- ============================================
INSERT INTO users (username, email, password_hash, role) VALUES 
('Admin', 'admin@shop.com', '$2a$10$5CwU.9kqjZqZrXzXzXzXzOeL8wX8wX8wX8wX8wX8wX8wX8wX8.', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- ПРОВЕРОЧНЫЕ ЗАПРОСЫ
-- ============================================

-- Показать все товары с категориями
SELECT p.id, p.title, c.name as category, coll.title as collection
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN collections coll ON p.collection_id = coll.id
ORDER BY p.id;

-- Показать все назначенные цвета
SELECT p.id, p.title, string_agg(c.name, ', ') as colors
FROM products p
LEFT JOIN product_colors pc ON p.id = pc.product_id
LEFT JOIN colors c ON pc.color_id = c.id
GROUP BY p.id, p.title
ORDER BY p.id;

-- Показать все назначенные размеры
SELECT p.id, p.title, string_agg(s.name, ', ') as sizes
FROM products p
LEFT JOIN product_sizes ps ON p.id = ps.product_id
LEFT JOIN sizes s ON ps.size_id = s.id
GROUP BY p.id, p.title
ORDER BY p.id;