// frontend/src/pages/Cart.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Cart = () => {
    const { cart, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderForm, setOrderForm] = useState({
        address: user?.address || '',
        phone: user?.phone || '',
        payment_method: 'card'
    });

    // Загружаем данные пользователя при авторизации
    useEffect(() => {
        if (user) {
            setOrderForm(prev => ({
                ...prev,
                address: user.address || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    // Проверяем, есть ли в корзине сертификаты
    const certificatesInCart = cart.filter(item => item.isCertificate === true);

    const handleQuantityChange = (productId, delta) => {
        const item = cart.find(i => i.id === productId);
        if (item) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) {
                removeFromCart(productId);
            } else {
                updateQuantity(productId, newQuantity);
            }
        }
    };

    const handleSubmitOrder = async () => {
        if (!user) {
            alert('Для оформления заказа необходимо войти в аккаунт');
            navigate('/login');
            return;
        }

        if (!orderForm.address) {
            alert('Укажите адрес доставки');
            return;
        }

        if (!orderForm.phone) {
            alert('Укажите номер телефона');
            return;
        }

        // Проверка для всех сертификатов
        for (const cert of certificatesInCart) {
            const recipient = orderForm[`certificateRecipient_${cert.id}`];
            const telegram = orderForm[`certificateTelegram_${cert.id}`];
            
            if (!recipient) {
                alert(`Укажите ФИО получателя для сертификата "${cert.title}"`);
                return;
            }
            if (!telegram) {
                alert(`Укажите Telegram аккаунт для сертификата "${cert.title}"`);
                return;
            }
        }

        setIsOrdering(true);
        try {
            // Подготавливаем корзину с размерами и цветами
            const cartWithDetails = cart.map(item => ({
                id: item.id,
                title: item.title,
                price: item.price,
                quantity: item.quantity,
                selectedSize: item.selectedSize || null,
                selectedColor: item.selectedColor || null,
                isCertificate: item.isCertificate || false
            }));

            // Собираем данные сертификатов в массив
            const certificateData = certificatesInCart.map(cert => ({
                productId: cert.id,
                title: cert.title,
                quantity: cert.quantity,
                recipient: orderForm[`certificateRecipient_${cert.id}`],
                telegram: orderForm[`certificateTelegram_${cert.id}`],
                message: orderForm[`certificateMessage_${cert.id}`] || ''
            }));

            const response = await axios.post('http://localhost:5000/api/orders', {
                userId: user.id,
                cart: cartWithDetails,
                address: orderForm.address,
                phone: orderForm.phone,
                payment_method: orderForm.payment_method,
                certificates: certificateData,
                hasCertificate: certificatesInCart.length > 0
            });

            if (response.data.success) {
                alert('✅ Заказ успешно оформлен!');
                clearCart();
                navigate('/profile');
            }
        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
            alert('❌ Ошибка при оформлении заказа');
        } finally {
            setIsOrdering(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="container mx-auto px-4 py-16 text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-playfair font-bold text-burgundy mb-2">Корзина пуста</h2>
                    <p className="text-gray-500 mb-6">Добавьте товары в корзину, чтобы оформить заказ</p>
                    <Link to="/" className="bg-burgundy text-white px-6 py-3 rounded-lg hover:bg-burgundy-dark transition inline-block">
                        Перейти в каталог
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-playfair font-bold text-burgundy mb-8">Корзина</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Список товаров */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="divide-y">
                                {cart.map(item => (
                                    <div key={item.id} className="p-4 flex gap-4">
                                        <img 
                                            src={item.image_url} 
                                            alt={item.title}
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold font-poppins text-lg">{item.title}</h3>
                                            
                                            {/* Отображение для сертификата */}
                                            {item.isCertificate ? (
                                                <div className="text-sm text-burgundy mt-1">
                                                    🎁 Подарочный сертификат
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                                                    {item.selectedSize && (
                                                        <div>📏 Размер: <span className="font-medium">{item.selectedSize}</span></div>
                                                    )}
                                                    {item.selectedColor && (
                                                        <div>🎨 Цвет: <span className="font-medium">{item.selectedColor}</span></div>
                                                    )}
                                                    {!item.selectedSize && !item.selectedColor && (
                                                        <div className="text-gray-400">Стандарт</div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <p className="text-burgundy font-bold text-xl mt-2">{item.price} ₽</p>
                                            
                                            {/* Кнопки управления количеством */}
                                            <div className="flex items-center gap-3 mt-3">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, -1)}
                                                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                    </svg>
                                                </button>
                                                <span className="font-semibold text-lg min-w-[40px] text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, 1)}
                                                    className="w-8 h-8 rounded-full bg-burgundy hover:bg-burgundy-dark flex items-center justify-center transition text-white"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="ml-2 text-red-500 hover:text-red-700 transition text-sm"
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-burgundy text-xl">{item.price * item.quantity} ₽</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Форма оформления заказа */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                            <h2 className="text-2xl font-playfair font-bold text-burgundy mb-4">Оформление заказа</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Адрес доставки *</label>
                                    <input
                                        type="text"
                                        value={orderForm.address}
                                        onChange={(e) => setOrderForm({...orderForm, address: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                                        placeholder="Введите адрес"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Телефон *</label>
                                    <input
                                        type="tel"
                                        value={orderForm.phone}
                                        onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                                        placeholder="+7 (999) 123-45-67"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Способ оплаты</label>
                                    <select
                                        value={orderForm.payment_method}
                                        onChange={(e) => setOrderForm({...orderForm, payment_method: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                                    >
                                        <option value="card">Банковская карта</option>
                                        <option value="cash">Наличные при получении</option>
                                        <option value="online">Онлайн-оплата</option>
                                    </select>
                                </div>

                                {/* Поля для сертификатов (появляются, если в корзине есть сертификаты) */}
                                {certificatesInCart.length > 0 && (
                                    <div className="border-t border-b border-gray-200 py-4 my-4">
                                        <h3 className="font-semibold text-burgundy mb-3">🎁 Данные для сертификатов</h3>
                                        
                                        {/* Перебираем все сертификаты в корзине */}
                                        {certificatesInCart.map((cert, index) => (
                                            <div key={cert.id} className="mb-6 p-4 bg-gray-50 rounded-lg">
                                                <p className="font-medium text-gray-700 mb-2">
                                                    Сертификат: {cert.title} (×{cert.quantity})
                                                </p>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                                            ФИО получателя сертификата #{index + 1} *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={orderForm[`certificateRecipient_${cert.id}`] || ''}
                                                            onChange={(e) => setOrderForm({
                                                                ...orderForm, 
                                                                [`certificateRecipient_${cert.id}`]: e.target.value
                                                            })}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                                            placeholder="Иванов Иван Иванович"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                                            Telegram аккаунт получателя #{index + 1} *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={orderForm[`certificateTelegram_${cert.id}`] || ''}
                                                            onChange={(e) => setOrderForm({
                                                                ...orderForm, 
                                                                [`certificateTelegram_${cert.id}`]: e.target.value
                                                            })}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                                            placeholder="@username"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                                            Послание для получателя #{index + 1}
                                                        </label>
                                                        <textarea
                                                            value={orderForm[`certificateMessage_${cert.id}`] || ''}
                                                            onChange={(e) => setOrderForm({
                                                                ...orderForm, 
                                                                [`certificateMessage_${cert.id}`]: e.target.value
                                                            })}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                                            rows="2"
                                                            placeholder="Ваши пожелания..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="border-t mt-6 pt-4">
                                <div className="flex justify-between text-xl font-bold">
                                    <span>Итого:</span>
                                    <span className="text-burgundy">{cartTotal} ₽</span>
                                </div>
                                <button
                                    onClick={handleSubmitOrder}
                                    disabled={isOrdering}
                                    className="w-full mt-4 bg-burgundy text-white py-3 rounded-lg hover:bg-burgundy-dark transition-all duration-300 disabled:opacity-50 font-poppins"
                                >
                                    {isOrdering ? 'Оформление...' : 'Оформить заказ'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;