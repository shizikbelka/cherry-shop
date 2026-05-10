import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Favorites = () => {
    const { user } = useAuth();
    const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addedProductId, setAddedProductId] = useState(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) return;
            try {
                const res = await axios.get(`http://localhost:5000/api/favorites/${user.id}`);
                setFavorites(res.data);
            } catch (error) {
                console.error('Ошибка загрузки избранного:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, [user]);

    const removeFromFavorites = async (productId) => {
        try {
            await axios.post('http://localhost:5000/api/favorites/toggle', { 
                userId: user.id, 
                productId 
            });
            setFavorites(prev => prev.filter(p => p.id !== productId));
            alert('Товар удалён из избранного');
        } catch (error) {
            console.error(error);
            alert('Ошибка при удалении из избранного');
        }
    };

    // Получаем количество товара в корзине
    const getQuantity = (productId) => {
        const item = cart.find(item => item.id === productId);
        return item ? item.quantity : 0;
    };

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        setAddedProductId(product.id);
        setTimeout(() => setAddedProductId(null), 500);
    };

    const handleQuantityChange = (productId, delta) => {
        const currentQty = getQuantity(productId);
        const newQty = currentQty + delta;
        
        if (newQty <= 0) {
            removeFromCart(productId);
        } else {
            updateQuantity(productId, newQty);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="text-xl text-gray-600">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-16">
                <h1 className="text-4xl font-playfair font-bold text-burgundy mb-8 text-center">
                    ❤️ Избранное
                </h1>
                
                {favorites.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-md">
                        <div className="text-6xl mb-4">💔</div>
                        <p className="text-gray-500 text-lg mb-4">У вас пока нет избранных товаров</p>
                        <Link to="/" className="inline-block bg-burgundy text-white px-6 py-3 rounded-lg hover:bg-burgundy-dark transition">
                            Перейти в каталог
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map(product => {
                            const quantityInCart = getQuantity(product.id);
                            const isAdded = addedProductId === product.id;
                            
                            return (
                                <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden card-hover flex flex-col h-full">
                                    <Link to={`/product/${product.id}`} className="block">
                                        <div className="relative overflow-hidden h-92">
                                            <img 
                                                src={product.image_url} 
                                                alt={product.title}
                                                className="w-full h-full object-cover transition duration-500 hover:scale-105"
                                            />
                                        </div>
                                        <div className="p-4 flex flex-col flex-grow">
                                            <h3 className="font-semibold text-lg mb-1 font-poppins line-clamp-1">{product.title}</h3>
                                            <p className="text-gray-500 text-sm mb-2 line-clamp-2 flex-grow">{product.description}</p>
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-2xl font-bold text-burgundy">{product.price} ₽</span>
                                            </div>
                                        </div>
                                    </Link>
                                    
                                    {/* Блок с кнопкой "В корзину" и управлением количеством */}
                                    <div className="px-4 pb-4 mt-auto">
                                        {quantityInCart > 0 ? (
                                            <div className="flex items-center justify-between gap-2">
                                                <button
                                                    onClick={() => handleQuantityChange(product.id, -1)}
                                                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                    </svg>
                                                </button>
                                                <span className="font-semibold text-xl min-w-[40px] text-center">
                                                    {quantityInCart}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(product.id, 1)}
                                                    className="w-10 h-10 rounded-full bg-burgundy hover:bg-burgundy-dark flex items-center justify-center transition text-white"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => removeFromFavorites(product.id)}
                                                    className="px-3 py-2 text-red-500 hover:text-red-700 transition text-sm"
                                                    title="Удалить из избранного"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className={`flex-1 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                                                        isAdded ? 'bg-green-500 scale-105' : 'bg-burgundy hover:bg-burgundy-dark'
                                                    } text-white font-poppins`}
                                                >
                                                    {isAdded ? (
                                                        <>
                                                            <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Добавлено!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                                            </svg>
                                                            В корзину
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => removeFromFavorites(product.id)}
                                                    className="px-4 py-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 transition"
                                                    title="Удалить из избранного"
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;