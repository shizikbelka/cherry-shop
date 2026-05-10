// frontend/src/pages/Favorites.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { products } from '../data';

const Favorites = () => {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
        if (savedFavorites) {
            const favoriteIds = JSON.parse(savedFavorites);
            const favoriteProducts = products.filter(p => favoriteIds.includes(p.id));
            setFavorites(favoriteProducts);
        }
        setLoading(false);
    }, [user]);

    const removeFromFavorites = (productId) => {
        const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
        if (savedFavorites) {
            const favoriteIds = JSON.parse(savedFavorites);
            const newFavorites = favoriteIds.filter(id => id !== productId);
            localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
            setFavorites(prev => prev.filter(p => p.id !== productId));
        }
        alert('Товар удалён из избранного');
    };

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        alert(`Товар "${product.title}" добавлен в корзину!`);
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
                        {favorites.map(product => (
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
                                <div className="px-4 pb-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="flex-1 bg-burgundy text-white py-2 rounded-lg hover:bg-burgundy-dark transition flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                            </svg>
                                            В корзину
                                        </button>
                                        <button
                                            onClick={() => removeFromFavorites(product.id)}
                                            className="px-4 py-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 transition"
                                        >
                                            ❌
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;