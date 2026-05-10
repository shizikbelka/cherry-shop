import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const Certificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState({});
    const { addToCart, cart } = useCart();

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/products/category/certificates');
                setCertificates(response.data);
            } catch (error) {
                console.error('Ошибка загрузки сертификатов:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificates();
    }, []);

    // Получаем количество из корзины
    const getQuantityInCart = (productId) => {
        const item = cart.find(item => item.id === productId && item.isCertificate);
        return item ? item.quantity : 0;
    };

    // Обновляем количества из корзины
    useEffect(() => {
        const newQuantities = {};
        certificates.forEach(cert => {
            newQuantities[cert.id] = getQuantityInCart(cert.id);
        });
        setQuantities(newQuantities);
    }, [cart, certificates]);

    const handleAddToCart = (product) => {
        addToCart({ 
            ...product, 
            isCertificate: true,
            selectedSize: null,
            selectedColor: null
        }, 1);
    };

    const handleQuantityChange = (product, delta) => {
        const currentQty = getQuantityInCart(product.id);
        const newQty = currentQty + delta;
        
        if (newQty <= 0) {
            // Удаляем из корзины
            const item = cart.find(item => item.id === product.id && item.isCertificate);
            if (item) {
                // Используем removeFromCart через контекст
                const { removeFromCart } = require('../contexts/CartContext');
                
            }
        } else {
            addToCart({ 
                ...product, 
                isCertificate: true,
                selectedSize: null,
                selectedColor: null
            }, delta);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4 py-16 text-center">
                    <div className="text-xl text-gray-600">Загрузка...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-16">
                <h1 className="text-4xl font-playfair font-bold text-burgundy mb-4 text-center">
                    Подарочные сертификаты
                </h1>
                <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
                    Выберите подарочный сертификат на любую сумму. 
                    Идеальный подарок для близких и друзей!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {certificates.map((cert) => {
                        const quantityInCart = quantities[cert.id] || 0;
                        
                        return (
                            <div key={cert.id} className="bg-white rounded-xl shadow-md overflow-hidden card-hover flex flex-col">
                                <Link to={`/product/${cert.id}`} className="block">
                                    <div className="relative overflow-hidden h-80">
                                        <img 
                                            src={cert.image_url} 
                                            alt={cert.title}
                                            className="w-full h-full object-cover transition duration-500 hover:scale-105"
                                        />
                                        <div className="absolute top-4 right-4 bg-burgundy text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            Подарочный
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="font-semibold text-xl mb-2 font-poppins">{cert.title}</h3>
                                        <p className="text-3xl font-bold text-burgundy mb-3">{cert.price} ₽</p>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-3">{cert.description?.substring(0, 150)}...</p>
                                    </div>
                                </Link>
                                
                                {/* Блок управления количеством */}
                                <div className="px-6 pb-6 mt-auto">
                                    {quantityInCart > 0 ? (
                                        <div className="flex items-center justify-between gap-2">
                                            <button
                                                onClick={() => handleQuantityChange(cert, -1)}
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
                                                onClick={() => handleQuantityChange(cert, 1)}
                                                className="w-10 h-10 rounded-full bg-burgundy hover:bg-burgundy-dark flex items-center justify-center transition text-white"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleAddToCart(cert)}
                                            className="w-full bg-burgundy text-white py-3 rounded-lg hover:bg-burgundy-dark transition font-poppins flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                            </svg>
                                            В корзину
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Информация о сертификатах */}
                <div className="mt-16 bg-white rounded-xl shadow-md p-8 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-playfair font-bold text-burgundy mb-4 text-center">
                        Как получить сертификат?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="text-3xl mb-2">1️⃣</div>
                            <p className="font-semibold">Выберите сертификат</p>
                            <p className="text-sm text-gray-500">На любую сумму из трёх вариантов</p>
                        </div>
                        <div>
                            <div className="text-3xl mb-2">2️⃣</div>
                            <p className="font-semibold">Оформите заказ</p>
                            <p className="text-sm text-gray-500">Укажите данные получателя в корзине</p>
                        </div>
                        <div>
                            <div className="text-3xl mb-2">3️⃣</div>
                            <p className="font-semibold">Получите сертификат</p>
                            <p className="text-sm text-gray-500">В течение 48 часов в Telegram</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certificates;