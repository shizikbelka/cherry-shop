import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const dropdownRef = useRef(null);
    const categoriesRef = useRef(null);
    const timeoutRef = useRef(null);
    const categoriesTimeoutRef = useRef(null);

    const categories = [
        { name: 'Все', slug: 'all' },
        { name: 'Худи & Кофты', slug: 'hoodies' },
        { name: 'Штаны & Шорты', slug: 'pants' },
        { name: 'Футболки & Верх', slug: 't-shirts' },
        { name: 'Аксессуары', slug: 'accessories' },
        { name: 'Верхняя одежда', slug: 'outerwear' }
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsDropdownOpen(false);
    };

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsDropdownOpen(true);
    };
    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setIsDropdownOpen(false), 200);
    };
    const handleCategoriesMouseEnter = () => {
        if (categoriesTimeoutRef.current) clearTimeout(categoriesTimeoutRef.current);
        setIsCategoriesOpen(true);
    };
    const handleCategoriesMouseLeave = () => {
        categoriesTimeoutRef.current = setTimeout(() => setIsCategoriesOpen(false), 200);
    };
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (categoriesTimeoutRef.current) clearTimeout(categoriesTimeoutRef.current);
        };
    }, []);

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-3xl font-playfair font-bold text-burgundy hover:text-burgundy-dark transition">
                        CherryStyle
                    </Link>
                    
                    {/* ПРАВАЯ ЧАСТЬ: КНОПКИ */}
                    <div className="flex items-center space-x-6">
                        {/* --- КНОПКА "КАТАЛОГ" (без изменений) --- */}
                        <div className="relative" ref={categoriesRef}
                             onMouseEnter={handleCategoriesMouseEnter}
                             onMouseLeave={handleCategoriesMouseLeave}>
                            <button className="flex items-center gap-2 text-gray-700 hover:text-burgundy transition font-medium px-3 py-2 rounded-lg hover:bg-gray-100">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                Каталог
                                <svg className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {isCategoriesOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-50 border"
                                     onMouseEnter={handleCategoriesMouseEnter}
                                     onMouseLeave={handleCategoriesMouseLeave}>
                                    <div className="px-3 py-2 border-b"><span className="text-sm font-semibold text-burgundy">Категории</span></div>
                                    {categories.map(cat => (
                                        <Link key={cat.slug} to={`/category/${cat.slug}`}
                                              className="block px-4 py-2 text-gray-700 hover:bg-burgundy hover:text-white transition">
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* --- НОВАЯ КНОПКА "СЕРТИФИКАТЫ" --- */}
                        <Link to="/certificates" className="text-gray-700 hover:text-burgundy transition font-medium">
                            Сертификаты
                        </Link>

                        {/* --- ИКОНКА ИЗБРАННОГО (СЕРДЕЧКО) --- */}
                        <Link to="/favorites" className="relative text-gray-700 hover:text-burgundy transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                        </Link>

                        {/* --- ИКОНКА КОРЗИНЫ (была) --- */}
                        <Link to="/cart" className="relative text-gray-700 hover:text-burgundy transition">
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
    {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-burgundy text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
</Link>

                        {/* --- МЕНЮ ПОЛЬЗОВАТЕЛЯ (было) --- */}
                        {user ? (
                            <div className="relative" ref={dropdownRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                                <button className="flex items-center space-x-2 text-gray-700">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: user.avatar_color || '#800020' }}>{user.username?.charAt(0).toUpperCase()}</div>
                                    <span className="hidden md:inline">{user.username}</span>
                                    <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                                        <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>👤 Личный кабинет</Link>
                                        {user.role === 'admin' && <Link to="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>🔧 Админ-панель</Link>}
                                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">🚪 Выйти</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-x-4"><Link to="/login" className="text-gray-700 hover:text-burgundy">Вход</Link><Link to="/register" className="bg-burgundy text-white px-4 py-2 rounded-lg hover:bg-burgundy-dark">Регистрация</Link></div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;