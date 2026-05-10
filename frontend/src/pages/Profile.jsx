// frontend/src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
    const { user, token, updateUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('orders');
    const [loading, setLoading] = useState(true);
    const [profileForm, setProfileForm] = useState({
        username: user?.username || '',
        address: user?.address || '',
        phone: user?.phone || '',
        avatar_color: user?.avatar_color || '#800020'
    });
    const [isEditing, setIsEditing] = useState(false);

    const colors = [
        '#800020', '#5a0016', '#a8324a', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'
    ];

    useEffect(() => {
        if (user?.id) {
            fetchOrders();
        }
    }, [user?.id]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            console.log('Загружаем заказы для пользователя ID:', user?.id);
            const response = await axios.get(`http://localhost:5000/api/orders/user/${user?.id}`);
            console.log('Полученные заказы:', response.data);
            setOrders(response.data);
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const response = await axios.put(
                `http://localhost:5000/api/users/${user?.id}`,
                profileForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            updateUser(response.data);
            setIsEditing(false);
            alert('Профиль успешно обновлён');
        } catch (error) {
            console.error('Ошибка обновления:', error);
            alert('Ошибка при обновлении профиля');
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'pending': '🆕 Оформлен',
            'confirmed': '✅ Принят',
            'shipped': '🚚 В пути',
            'delivered': '📦 Доставлен',
            'new': '🆕 Новый',
            'processing': '⚙️ В обработке',
            'cancelled': '❌ Отменён'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'shipped': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-green-100 text-green-800',
            'new': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-blue-100 text-blue-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colorMap[status] || 'bg-gray-100 text-gray-800';
    };

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="text-gray-500">Пожалуйста, войдите в аккаунт</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-playfair font-bold text-burgundy mb-8">Личный кабинет</h1>
                
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Боковое меню */}
                    <div className="md:w-64">
                        <div className="bg-white rounded-xl shadow-md p-4">
                            <div className="text-center mb-4">
                                <div 
                                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3"
                                    style={{ backgroundColor: user?.avatar_color || '#800020' }}
                                >
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="font-semibold font-poppins">{user?.username}</h3>
                                <p className="text-gray-500 text-sm">{user?.email}</p>
                                <p className="text-gray-400 text-xs mt-1">ID: {user?.id}</p>
                            </div>
                            <div className="border-t pt-3">
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all ${
                                        activeTab === 'orders' ? 'bg-burgundy text-white' : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    📦 Мои заказы
                                </button>
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                                        activeTab === 'profile' ? 'bg-burgundy text-white' : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    👤 Личные данные
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Контент */}
                    <div className="flex-1">
                        {activeTab === 'orders' && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-2xl font-playfair font-bold text-burgundy mb-4">История заказов</h2>
                                {loading ? (
                                    <p className="text-gray-500">Загрузка...</p>
                                ) : orders.length === 0 ? (
                                    <div>
                                        <p className="text-gray-500 mb-4">У вас пока нет заказов</p>
                                        <button 
                                            onClick={fetchOrders} 
                                            className="text-burgundy text-sm underline"
                                        >
                                            Обновить
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map(order => (
                                            <div key={order.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <span className="text-gray-500 text-sm">Заказ #{order.id}</span>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(order.created_at).toLocaleDateString('ru-RU')}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                        {getStatusText(order.status)}
                                                    </span>
                                                </div>
                                                
                                                {/* Товары в заказе */}
                                                {order.items && order.items.length > 0 && order.items[0] !== null ? (
                                                    <div className="space-y-2 mb-3">
                                                        {order.items.map((item, idx) => (
                                                            item && item.id && (
                                                                <div key={idx} className="flex justify-between text-sm">
                                                                    <span>{item.title || `Товар #${item.product_id}`} x{item.quantity}</span>
                                                                    <span>{item.price * item.quantity} ₽</span>
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-400 mb-3">Нет информации о товарах</p>
                                                )}
                                                
                                                <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                                                    <span>Итого:</span>
                                                    <span className="text-burgundy">{order.total} ₽</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-playfair font-bold text-burgundy">Личные данные</h2>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-burgundy hover:text-burgundy-dark"
                                        >
                                            ✏️ Редактировать
                                        </button>
                                    )}
                                </div>
                                
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Имя</label>
                                            <input
                                                type="text"
                                                value={profileForm.username}
                                                onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Адрес</label>
                                            <input
                                                type="text"
                                                value={profileForm.address}
                                                onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Телефон</label>
                                            <input
                                                type="text"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Цвет аватарки</label>
                                            <div className="flex flex-wrap gap-2">
                                                {colors.map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => setProfileForm({...profileForm, avatar_color: color})}
                                                        className={`w-8 h-8 rounded-full transition ${
                                                            profileForm.avatar_color === color ? 'ring-2 ring-offset-2 ring-burgundy scale-110' : ''
                                                        }`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-3 pt-4">
                                            <button
                                                onClick={handleUpdateProfile}
                                                className="bg-burgundy text-white px-4 py-2 rounded-lg hover:bg-burgundy-dark transition"
                                            >
                                                Сохранить
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex">
                                            <span className="w-24 text-gray-500">Имя:</span>
                                            <span>{user?.username}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="w-24 text-gray-500">Email:</span>
                                            <span>{user?.email}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="w-24 text-gray-500">Адрес:</span>
                                            <span>{user?.address || 'Не указан'}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="w-24 text-gray-500">Телефон:</span>
                                            <span>{user?.phone || 'Не указан'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;