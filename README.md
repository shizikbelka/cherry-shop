# 🛍️ CherryStyle - Интернет-магазин одежды

**CherryStyle** — интернет-магазин одежды. Проект демонстрирует навыки Fullstack-разработки.

🔗 **Демо-сайт:** https://shizikbelka.github.io/cherry-shop
> ⚠️ **Демо-версия:** Сайт опубликован для демонстрации интерфейса. 
> Для работы с авторизацией, корзиной, заказами и админ панелью необходимо запустить 
> проект локально (инструкция ниже). 

## ✨ Функциональность

### 👤 Для пользователей:
- Просмотр каталога с фильтрацией по категориям
- Добавление товаров в корзину с выбором размера и цвета
- Управление количеством товаров (+/-)
- Личный кабинет с историей заказов
- Избранное (❤️)
- Оформление заказа с указанием адреса и телефона

### 👑 Для администратора:
- Управление товарами (добавление, редактирование, удаление)
- Управление коллекциями
- Управление размерами и цветами товаров
- Просмотр всех заказов пользователей
- Изменение статуса заказа

## 🛠️ Технологии

**Frontend:**
- ⚛️ React 18 (Hooks, Context API, React Router v6)
- ⚡️ Vite - быстрая сборка
- 🎨 Tailwind CSS - стилизация

**Backend:**
- 🟢 Node.js + Express.js
- 🐘 PostgreSQL
- 🔐 JWT + bcryptjs (аутентификация)

---

## 🚀 Запуск проекта локально

### Требования:
- Node.js (версия 18+)
- PostgreSQL (версия 14+)

### 1. Клонируйте репозиторий
```bash
git clone https://github.com/shizikbelka/cherry-shop.git
cd cherry-shop

## 2. Настройте базу данных

Создайте базу данных `cherry_shop` в PostgreSQL

Выполните скрипт `database.sql` в pgAdmin (Query Tool)

## 3. Настройте переменные окружения

Создайте файл `backend/.env`:

```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=ваш_пароль
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cherry_shop
JWT_SECRET=my_super_secret_key

4. Запустите Backend
bash
cd backend
npm install
npm run dev
Сервер запустится на http://localhost:5000

5. Запустите Frontend
bash
cd frontend
npm install
npm run dev
6. Откройте сайт
text
http://localhost:5173
Тестовые данные для входа:
👑 Администратор	admin@shop.com	123456
👤 Пользователь	anna@mail.com	123456
👤 Пользователь	ivan@mail.com	123456

📁 Структура проекта
cherry-shop/
├── backend/              # Серверная часть
│   ├── server.js         # API маршруты
│   ├── db.js             # Подключение к PostgreSQL
│   ├── .env              # Переменные окружения
│   └── package.json      # Зависимости
│
├── frontend/             # Клиентская часть
│   ├── src/
│   │   ├── components/   # React компоненты
│   │   ├── pages/        # Страницы
│   │   ├── contexts/     # Контексты (корзина, авторизация)
│   │   ├── App.jsx       # Главный компонент
│   │   └── main.jsx      # Точка входа
│   ├── public/           # Статические файлы
│   └── package.json      # Зависимости
│
├── database.sql          # SQL скрипт для создания БД
└── README.md             # Описание проекта
