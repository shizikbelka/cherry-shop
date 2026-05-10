// frontend/src/pages/Catalog.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { products, categories, collections } from '../data';

const Catalog = ({ isMainPage = false }) => {
    const { categorySlug, collectionSlug } = useParams();
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(categorySlug || 'all');
    const [addedProductId, setAddedProductId] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [collection, setCollection] = useState(null);
    const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
    const { user } = useAuth();

    const categoryList = [
        { name: 'Каталог', slug: 'all' },
        { name: 'Худи & Кофты', slug: 'hoodies' },
        { name: 'Штаны & Шорты', slug: 'pants' },
        { name: 'Футболки & Верх', slug: 't-shirts' },
        { name: 'Аксессуары', slug: 'accessories' },
        { name: 'Верхняя одежда', slug: 'outerwear' }
    ];

    const getQuantity = useCallback((productId) => {
        const item = cart.find(item => item.id === productId);
        return item ? item.quantity : 0;
    }, [cart]);

    // Загрузка избранного
    useEffect(() => {
        if (user) {
            const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
            if (savedFavorites) {
                setFavorites(JSON.parse(savedFavorites));
            }
        }
    }, [user]);

    useEffect(() => {
        if (collectionSlug) {
            const foundCollection = collections.find(c => c.slug === collectionSlug);
            setCollection(foundCollection);
            const collectionProducts = products.filter(p => p.collection_id === foundCollection?.id);
            setFilteredProducts(collectionProducts);
            setLoading(false);
        } else {
            setSelectedCategory(categorySlug || 'all');
        }
    }, [categorySlug, collectionSlug]);

    useEffect(() => {
        if (!collectionSlug) {
            let filtered = [...products];
            
            if (selectedCategory && selectedCategory !== 'all') {
                const category = categories.find(c => c.slug === selectedCategory);
                if (category) {
                    filtered = products.filter(p => p.category_id === category.id);
                }
            }
            
            setFilteredProducts(filtered);
            setLoading(false);
        }
    }, [selectedCategory, collectionSlug]);

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

    const toggleFavorite = (productId, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            alert('Войдите в аккаунт, чтобы добавлять товары в избранное');
            return;
        }
        
        let newFavorites;
        if (favorites.includes(productId)) {
            newFavorites = favorites.filter(id => id !== productId);
        } else {
            newFavorites = [...favorites, productId];
        }
        setFavorites(newFavorites);
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4 py-16 text-center">
                    <div className="text-xl text-gray-600">Загрузка товаров...</div>
                </div>
            </div>
        );
    }

    // Если это страница коллекции
    if (collectionSlug && collection) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: `url(${collection.image_url})` }}>
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-center text-white">
                            <h1 className="text-5xl font-playfair font-bold mb-4">{collection.hero_title}</h1>
                            <p className="text-xl mb-6">{collection.release_date}</p>
                            <p className="max-w-2xl mx-auto whitespace-pre-line">{collection.description}</p>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8">
                    <h2 className="text-3xl font-playfair font-bold text-burgundy mb-6">Товары коллекции</h2>
                    <CatalogProducts 
                        products={filteredProducts} 
                        favorites={favorites}
                        getQuantity={getQuantity}
                        handleAddToCart={handleAddToCart}
                        handleQuantityChange={handleQuantityChange}
                        toggleFavorite={toggleFavorite}
                        addedProductId={addedProductId}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-playfair font-bold text-burgundy mb-2">
                    {categoryList.find(c => c.slug === selectedCategory)?.name || 'Каталог'}
                </h1>
                <p className="text-gray-500 mb-8 font-poppins">Выберите идеальный образ вместе с CherryStyle</p>

                <div className="flex flex-wrap gap-3 mb-8">
                    {categoryList.map(cat => (
                        <button
                            key={cat.slug}
                            onClick={() => setSelectedCategory(cat.slug)}
                            className={`px-4 py-2 rounded-full transition-all duration-300 font-poppins ${
                                selectedCategory === cat.slug
                                    ? 'bg-burgundy text-white shadow-md'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <CatalogProducts 
                    products={filteredProducts} 
                    favorites={favorites}
                    getQuantity={getQuantity}
                    handleAddToCart={handleAddToCart}
                    handleQuantityChange={handleQuantityChange}
                    toggleFavorite={toggleFavorite}
                    addedProductId={addedProductId}
                />
            </div>
        </div>
    );
};

const CatalogProducts = ({ products, favorites, getQuantity, handleAddToCart, handleQuantityChange, toggleFavorite, addedProductId }) => {
    if (products.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500 text-lg">В этой категории пока нет товаров</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => {
                const quantityInCart = getQuantity(product.id);
                const isAdded = addedProductId === product.id;
                const isFavorite = favorites.includes(product.id);
                
                return (
                    <Link to={`/product/${product.id}`} key={product.id} className="block bg-white rounded-xl shadow-md overflow-hidden card-hover flex flex-col h-full relative group">
                        <button
                            onClick={(e) => toggleFavorite(product.id, e)}
                            className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md hover:scale-110 transition"
                        >
                            <svg className={`w-5 h-5 transition ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'}`} fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                        </button>

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
                            
                            <div className="mt-auto">
                                {quantityInCart > 0 ? (
                                    <div className="flex items-center justify-between gap-2">
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleQuantityChange(product.id, -1); }}
                                            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                            </svg>
                                        </button>
                                        <span className="font-semibold text-xl min-w-[40px] text-center">{quantityInCart}</span>
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleQuantityChange(product.id, 1); }}
                                            className="w-10 h-10 rounded-full bg-burgundy hover:bg-burgundy-dark flex items-center justify-center transition text-white"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                                        className={`w-full py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
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
                                )}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};

export default Catalog;