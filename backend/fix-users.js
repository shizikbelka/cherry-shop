const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'Belka696',
    host: 'localhost',
    port: 5432,
    database: 'cherry_shop'
});

async function fixUsers() {
    try {
        // Генерируем правильный хэш для пароля 123456
        const hash = await bcrypt.hash('123456', 10);
        console.log('✅ Хэш создан:', hash);
        
        // Очищаем таблицу users
        await pool.query('DELETE FROM users');
        console.log('✅ Старые пользователи удалены');
        
        // Создаём админа
        await pool.query(
            `INSERT INTO users (username, email, password_hash, role) 
             VALUES ($1, $2, $3, $4)`,
            ['Admin', 'admin@shop.com', hash, 'admin']
        );
        console.log('✅ Админ создан');
        
        // Создаём обычных пользователей
        await pool.query(
            `INSERT INTO users (username, email, password_hash, role) 
             VALUES ($1, $2, $3, $4)`,
            ['Анна', 'anna@mail.com', hash, 'user']
        );
        
        await pool.query(
            `INSERT INTO users (username, email, password_hash, role) 
             VALUES ($1, $2, $3, $4)`,
            ['Иван', 'ivan@mail.com', hash, 'user']
        );
        
        console.log('✅ Обычные пользователи созданы');
        
        // Проверяем результат
        const result = await pool.query('SELECT id, username, email, role FROM users');
        console.log('\n📋 Пользователи в БД:');
        result.rows.forEach(user => {
            console.log(`   - ${user.username} (${user.email}) - ${user.role}`);
        });
        
        console.log('\n🎉 Входные данные:');
        console.log('   Админ: admin@shop.com / 123456');
        console.log('   Анна: anna@mail.com / 123456');
        console.log('   Иван: ivan@mail.com / 123456');
        
    } catch (err) {
        console.error('❌ Ошибка:', err.message);
    } finally {
        pool.end();
    }
}

fixUsers();